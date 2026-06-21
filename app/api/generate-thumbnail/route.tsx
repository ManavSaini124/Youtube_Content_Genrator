
import { db } from "@/configs/db";
import { AiThumbnail } from "@/configs/schema";
import { inngest } from "@/inngest/client";
import { getInngestUnavailableMessage } from "@/inngest/config";
import { currentUser } from "@clerk/nextjs/server";
import { desc, eq } from "drizzle-orm";
import ImageKit from "imagekit";
import { NextRequest, NextResponse } from "next/server";

const imageKit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY as string,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY as string,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT as string,
})

export async function POST(req: NextRequest) {
    const formData = await req.formData();
    const referenceImage = getImageFile(formData.get('referenceImage'));
    const userImage = getImageFile(formData.get('userImage'));
    const userInput = String(formData.get('userInput') || '').trim();
    const user = await currentUser();

    if (!userInput) {
        return NextResponse.json(
            { error: "Please describe the thumbnail you want to generate." },
            { status: 400 },
        );
    }

    try {
        const [referenceImageUrl, userImageUrl] = await Promise.all([
            referenceImage ? uploadImage(referenceImage, "reference") : Promise.resolve(null),
            userImage ? uploadImage(userImage, "creator") : Promise.resolve(null),
        ]);

        const result = await inngest.send({
            name: "ai/generate-thumbnail",
            data: {
                userInput,
                referenceImageUrl,
                userImageUrl,
                userEmail: user?.primaryEmailAddress?.emailAddress,
            }
        });
        const runId = result.ids[0];

        if (!runId) {
            throw new Error("Inngest did not return an event ID.");
        }

        return NextResponse.json({ runId });
    } catch (error) {
        console.error("Unable to dispatch thumbnail generation:", {
            error: error instanceof Error ? error.message : String(error),
        });
        return NextResponse.json(
            { error: getInngestUnavailableMessage() },
            { status: 503 },
        );
    }
}

const getImageFile = (value: FormDataEntryValue | null) => {
    if (!value || typeof value === "string") return null;
    if (!["image/jpeg", "image/png"].includes(value.type)) return null;
    return value;
}

const uploadImage = async (file: File, kind: "reference" | "creator") => {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const safeName = file.name.replace(/[^\w.-]/g, "_") || `${kind}.png`;
    const uploaded = await imageKit.upload({
        file: buffer,
        fileName: `${Date.now()}-${kind}-${safeName}`,
        folder: "/thumbnail-inputs",
        isPublished: true,
        useUniqueFileName: true,
    });

    return uploaded.url;
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
        .orderBy(desc(AiThumbnail.createdAt), desc(AiThumbnail.id))

    console.log('result:', result)

    return NextResponse.json(result)

    
}
