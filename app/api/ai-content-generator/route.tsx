import { db } from "@/configs/db";
import { AiContentTable } from "@/configs/schema";
import { inngest } from "@/inngest/client";
import { getInngestUnavailableMessage } from "@/inngest/config";
import { currentUser } from "@clerk/nextjs/server";
import { desc, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const {userInput} = await req.json();
    const user = await currentUser();

    try {
        const result = await inngest.send({
            name:'ai/generate-content',
            data: {
                userInput,
                userEmail : user?.primaryEmailAddress?.emailAddress
            }
        });
        const runId = result.ids[0];

        if (!runId) {
            throw new Error("Inngest did not return an event ID.");
        }

        return NextResponse.json({ runId });
    } catch (error) {
        console.error("Unable to dispatch content generation:", {
            error: error instanceof Error ? error.message : String(error),
        });
        return NextResponse.json(
            { error: getInngestUnavailableMessage() },
            { status: 503 },
        );
    }
}

export async function GET() {
    const user = await currentUser();
    const userEmail = user?.primaryEmailAddress?.emailAddress;

    if (!userEmail) {
        return NextResponse.json([]);
    }

    const result = await db
        .select()
        .from(AiContentTable)
        .where(eq(AiContentTable.userEmail, userEmail))
        .orderBy(desc(AiContentTable.createdAt), desc(AiContentTable.id));

    return NextResponse.json(result);
}
