
import { db } from "@/configs/db";
import { AiThumbnail } from "@/configs/schema";
import { inngest } from "@/inngest/client";
import { currentUser } from "@clerk/nextjs/server";
import { desc, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req:NextRequest) {
    const formData = await req.formData();
    const referenceImage = formData.get('referenceImage') as File | null;
    const userImage = formData.get('userImage') as File | null;
    const userInput = formData.get('userInput');
    const user = await currentUser();
    console.log(formData)

    console.log('referenceImage:', referenceImage);
    console.log('userImage:', userImage);

    const inputData = {
        userInput: userInput,
        referenceImage: referenceImage? await getFileBuffer(referenceImage): null,
        userImage: userImage? await getFileBuffer(userImage): null,
        userEmail: user?.primaryEmailAddress?.emailAddress,
    }

    const result = await inngest.send({
        name: "ai/generate-thumbnail",
        data: inputData
    });

    return NextResponse.json({ runId: result.ids[0] })
}

/**
 * Converts a File object to a JSON object that can be sent over HTTP,
 * with the file's contents encoded as a base64 string.
 *
 * @param {File} file The file to convert.
 * @returns {Promise<{name: string; type: string; size: number; buffer: string}>} A promise
 * that resolves to an object with the file's name, type, size, and
 * contents encoded as a base64 string.
 */
const getFileBuffer = async(file:File)=>{
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    

    return {
        name: file.name,
        type: file.type,
        size: file.size,
        buffer: buffer.toString('base64')
    }
}

export async function GET(req:NextRequest) {
    const user = await currentUser()
    console.log('user:', user?.primaryEmailAddress?.emailAddress)
    const result = await db
        .select()
        .from(AiThumbnail)
        .where(
            //@ts-ignore
            eq(AiThumbnail.userEmail, user?.primaryEmailAddress?.emailAddress)
        )
        .orderBy(desc(AiThumbnail.createdAt))

    console.log('result:', result)

    return NextResponse.json(result)

    
}
