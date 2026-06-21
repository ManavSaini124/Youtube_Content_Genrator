import { NextResponse } from "next/server";
import { InngestStatusError, RunStatus } from "@/services/GlobalApi";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { error: "Event ID is required." },
      { status: 400 },
    );
  }

  try {
    const status = await RunStatus(id);
    return NextResponse.json({ status });
  } catch (error) {
    console.error("Error in run-status API:", error);

    if (error instanceof InngestStatusError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.status },
      );
    }

    return NextResponse.json(
      { error: "Failed to fetch generation status." },
      { status: 500 },
    );
  }
}
