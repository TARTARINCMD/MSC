import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.id || !user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const name =
      (typeof user.user_metadata?.name === "string"
        ? user.user_metadata.name
        : null) ?? null;

    await prisma.user.upsert({
      where: { id: user.id },
      create: {
        id: user.id,
        email: user.email,
        name,
      },
      update: {
        email: user.email,
        ...(name !== null ? { name } : {}),
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("ensure-profile:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
