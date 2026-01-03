import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { imageUrl } = await request.json();

    // Update the image URL (no authentication required - this is for backfilling)
    const updatedFind = await prisma.spotifyFind.update({
      where: { id },
      data: { imageUrl },
    });

    return NextResponse.json(updatedFind);
  } catch (error) {
    console.error("Error updating image:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

