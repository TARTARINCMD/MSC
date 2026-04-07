import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const authUser = await getAuthUser();
    const userId = authUser?.id;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const saved = await prisma.savedArticle.findMany({
      where: { userId },
      orderBy: { savedAt: "desc" },
    });

    const articles = saved.map((s) => ({
      id: s.id,
      title: s.title,
      link: s.link,
      keyword: s.keyword,
      pubDate: s.pubDate,
      savedAt: s.savedAt,
    }));

    return NextResponse.json(articles);
  } catch (error) {
    console.error("Error fetching saved articles:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const authUser = await getAuthUser();
    const userId = authUser?.id;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, link, keyword, pubDate } = body;

    if (!title || !link || !keyword) {
      return NextResponse.json(
        { error: "Missing title, link, or keyword" },
        { status: 400 }
      );
    }

    const saved = await prisma.savedArticle.upsert({
      where: {
        userId_link: { userId, link: String(link) },
      },
      create: {
        userId,
        title: String(title),
        link: String(link),
        keyword: String(keyword),
        pubDate: pubDate ? String(pubDate) : null,
      },
      update: { savedAt: new Date() },
    });

    return NextResponse.json({ id: saved.id, saved: true });
  } catch (error) {
    console.error("Error saving article:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const authUser = await getAuthUser();
    const userId = authUser?.id;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const link = searchParams.get("link");
    const id = searchParams.get("id");

    if (id) {
      await prisma.savedArticle.deleteMany({
        where: { id, userId },
      });
    } else if (link) {
      await prisma.savedArticle.deleteMany({
        where: { userId, link },
      });
    } else {
      return NextResponse.json(
        { error: "Provide id or link" },
        { status: 400 }
      );
    }

    return NextResponse.json({ saved: false });
  } catch (error) {
    console.error("Error unsaving article:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
