import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Check if find exists and belongs to user
    const find = await prisma.spotifyFind.findUnique({
      where: { id },
    });

    if (!find) {
      return NextResponse.json({ error: "Find not found" }, { status: 404 });
    }

    if (find.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Delete the find
    await prisma.spotifyFind.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting find:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const data = await request.json();

    // Check if find exists and belongs to user
    const find = await prisma.spotifyFind.findUnique({
      where: { id },
    });

    if (!find) {
      return NextResponse.json({ error: "Find not found" }, { status: 404 });
    }

    if (find.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Update the find
    const updatedFind = await prisma.spotifyFind.update({
      where: { id },
      data: {
        description: data.description,
        type: data.type,
        genre: data.genre,
      },
    });

    return NextResponse.json(updatedFind);
  } catch (error) {
    console.error("Error updating find:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

