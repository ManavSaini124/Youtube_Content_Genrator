import OpenAI from 'openai';
import { inngest } from "./client";
import ImageKit from 'imagekit'
import Replicate from "replicate"
import { db } from '@/configs/db';
import { AiContentTable, AiThumbnail } from '@/configs/schema';
import moment from 'moment';
import axios from "axios";
import sharp from "sharp";

// Keep the model configurable so upgrades do not require a code deployment.
const AiModelForContent = process.env.GEMINI_TEXT_MODEL || "gemini-3.5-flash"
const AiModelForThumbnail = process.env.GEMINI_TEXT_MODEL || "gemini-3.5-flash"
const MAX_IMAGE_PROMPT_LENGTH = 2048;
const CLOUDFLARE_IMAGE_MODEL =
  process.env.CLOUDFLARE_IMAGE_MODEL || "@cf/leonardo/phoenix-1.0";
const CLOUDFLARE_FALLBACK_IMAGE_MODEL =
  "@cf/black-forest-labs/flux-2-klein-4b";

type ThumbnailConcept = {
  heading: string;
  prompt: string;
};

const createThumbnailHeading = (userInput: string) => {
  const words = userInput
    .replace(/[^\w\s'-]/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  return (words.slice(0, 5).join(" ") || "MUST WATCH").toUpperCase();
};

const createThumbnailPrompt = (userInput: string) =>
  `Professional high-click-through YouTube thumbnail scene about "${userInput}". Show a complete visual story, not a portrait: ` +
  "a clear main subject interacting with two or three large topic-specific objects, visible action, a surprising consequence, " +
  "and one unanswered visual question. Medium-wide cinematic framing; the subject occupies no more than 40% of the image. " +
  "Use foreground, midground, and background depth, strong diagonal movement, dramatic scale contrast, saturated complementary colors, " +
  "bright rim light and deep shadows. Keep the entire LEFT 38% as simple dark environmental background with no people or important objects; " +
  "place every character, prop, and action entirely in the RIGHT 62%. Every visible object must communicate the topic. " +
  "No isolated face, no headshot, no passport-photo framing, no empty studio portrait, no generic stock photo, no clutter, " +
  "no collage, no split screen, no text, no letters, no logo, no watermark, no UI.";

async function generateThumbnailConcept(
  userInput: string,
  referenceImageUrl?: string | null,
  userImageUrl?: string | null
): Promise<ThumbnailConcept> {
  const imageInputs: Array<{
    type: "image_url";
    image_url: { url: string };
  }> = [];

  if (referenceImageUrl) {
    imageInputs.push({
      type: "image_url",
      image_url: { url: referenceImageUrl },
    });
  }

  if (userImageUrl) {
    imageInputs.push({
      type: "image_url",
      image_url: { url: userImageUrl },
    });
  }

  const completion = await openai.chat.completions.create({
    model: AiModelForThumbnail,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `Act as a senior YouTube thumbnail creative director. Design one attention-grabbing thumbnail concept for:
"${userInput}"

Return JSON only:
{
  "heading": "2 to 4 punchy words",
  "prompt": "Detailed image-generation prompt"
}

The prompt must describe a complete visual story rather than a face:
- One main subject shown from the waist up or wider, never an isolated headshot.
- The subject must interact with 2-3 large, topic-specific objects.
- Include visible action, stakes, transformation, danger, reward, contrast, or an unanswered visual question.
- Use foreground, midground, and background. The subject occupies at most 40% of the frame.
- Keep the entire LEFT 38% as simple dark environmental background with no people, faces, hands, or important objects.
- Put every character, prop, and action entirely inside the RIGHT 62% so the headline never covers the story.
- Specify camera angle, composition, colors, lighting, and the exact meaningful objects.
- Make it understandable at phone size with one focal story and no tiny details.
- Do not include text, letters, logos, watermarks, UI, collage, split screen, arrows, circles, or generic stock imagery.
- Avoid generic phrases unless followed by concrete visual details.
${referenceImageUrl ? "- Match the reference image's visual style and color treatment, but improve its story and composition." : ""}
${userImageUrl ? "- If a creator portrait is supplied, use it only as identity/reference material. Avoid a static headshot." : ""}`,
          },
          ...imageInputs,
        ],
      },
    ],
  });

  const rawConcept = completion.choices[0].message.content;
  if (!rawConcept) {
    throw new Error("No thumbnail concept generated");
  }

  const concept = JSON.parse(rawConcept) as Partial<ThumbnailConcept>;
  return {
    heading: createThumbnailHeading(concept.heading || userInput),
    prompt: `${concept.prompt || createThumbnailPrompt(userInput)} No isolated face or headshot.`,
  };
}

const XML_ENTITIES: Record<string, string> = {
    "<": "&lt;",
    ">": "&gt;",
    "&": "&amp;",
    "'": "&apos;",
    "\"": "&quot;",
};

const escapeXml = (value: string) =>
  value.replace(/[<>&'"]/g, (character) => XML_ENTITIES[character] ?? character);

async function formatAsYouTubeThumbnail(imageBuffer: Buffer, heading: string) {
  const words = heading.split(/\s+/);
  const splitAt = words.length > 2
    ? Array.from({ length: words.length - 1 }, (_, index) => index + 1)
      .reduce((best, current) => {
        const currentDifference = Math.abs(
          words.slice(0, current).join(" ").length -
          words.slice(current).join(" ").length
        );
        const bestDifference = Math.abs(
          words.slice(0, best).join(" ").length -
          words.slice(best).join(" ").length
        );
        return currentDifference < bestDifference ? current : best;
      }, 1)
    : words.length;
  const lines = [
    words.slice(0, splitAt).join(" "),
    words.slice(splitAt).join(" "),
  ].filter(Boolean);
  const longestLine = Math.max(...lines.map((line) => line.length));
  const fontSize = Math.max(52, Math.min(92, Math.floor(530 / (longestLine * 0.62))));
  const lineHeight = Math.round(fontSize * 1.08);
  const startY = 360 - ((lines.length - 1) * lineHeight) / 2;
  const text = lines
    .map(
      (line, index) =>
        `<tspan x="64" y="${startY + index * lineHeight}">${escapeXml(line)}</tspan>`
    )
    .join("");

  const overlay = Buffer.from(`
    <svg width="1280" height="720" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="shade" x1="0" x2="1">
          <stop offset="0%" stop-color="#050505" stop-opacity="0.92"/>
          <stop offset="48%" stop-color="#050505" stop-opacity="0.45"/>
          <stop offset="76%" stop-color="#050505" stop-opacity="0"/>
        </linearGradient>
        <filter id="shadow">
          <feDropShadow dx="5" dy="7" stdDeviation="5" flood-color="#000" flood-opacity="0.9"/>
        </filter>
      </defs>
      <rect width="1280" height="720" fill="url(#shade)"/>
      <rect x="54" y="${startY - fontSize}" width="12" height="${lines.length * lineHeight + 20}" rx="6" fill="#ff7917"/>
      <text fill="#fff" font-family="Arial, Helvetica, sans-serif" font-size="${fontSize}"
        font-weight="900" letter-spacing="-2" filter="url(#shadow)">${text}</text>
    </svg>
  `);

  return sharp(imageBuffer)
    .resize(1280, 720, { fit: "cover", position: "attention" })
    .modulate({ saturation: 1.18 })
    .sharpen()
    .composite([{ input: overlay, top: 0, left: 0 }])
    .jpeg({ quality: 90, chromaSubsampling: "4:4:4" })
    .toBuffer();
}

// DOESNT WORK 
export async function HFgenerateImage(prompt?: string) {
  const HF_API_TOKEN = process.env.HUGGING_FACE_ACCESS_TOKEN;
  try {
    const response = await axios.post(
      `https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2`,
      { inputs: prompt },
      {
        headers: {
          Authorization: `Bearer ${HF_API_TOKEN}`,
          "Content-Type": "application/json",
          Accept: "image/png"
        },
        responseType: "arraybuffer",
      }
    );

    const contentType = response.headers["content-type"];
    if (contentType?.includes("application/json")) {
      const errorJson = JSON.parse(Buffer.from(response.data).toString("utf8"));
      console.error("HF API error:", errorJson);
      throw new Error(errorJson.error || "HF request failed");
    }

    if (response.status !== 200) {
      const textError = Buffer.from(response.data).toString("utf8");
      throw new Error(`HF error ${response.status}: ${textError}`);
    }

    return Buffer.from(response.data);
  } catch (error: any) {
    console.error("Error generating image:", error.response?.data || error.message);
    throw new Error("Image generation failed");
  }
}

export async function CloudflareGenerateImage(prompt?: string) {
  const CLOUDFLARE_API_TOKEN = process.env.CLOUDFARE_API_KEY;
  const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;

  if (!CLOUDFLARE_API_TOKEN || !CLOUDFLARE_ACCOUNT_ID) {
    throw new Error("Missing Cloudflare API token or account ID in .env");
  }

  if (!prompt) {
    throw new Error("No prompt provided for image generation");
  }

  if (prompt.length > MAX_IMAGE_PROMPT_LENGTH) {
    console.warn(`Prompt length (${prompt.length}) exceeds ${MAX_IMAGE_PROMPT_LENGTH} characters. Truncating...`);
    prompt = prompt.substring(0, MAX_IMAGE_PROMPT_LENGTH - 50);
  }

  try {
    const startedAt = Date.now();
    let imageBuffer: Buffer;

    try {
      imageBuffer = await generateWithPhoenix(
        prompt,
        CLOUDFLARE_ACCOUNT_ID,
        CLOUDFLARE_API_TOKEN
      );
      console.log(`Cloudflare ${CLOUDFLARE_IMAGE_MODEL} generated an image`);
    } catch (primaryError: any) {
      console.warn(
        `Primary image model failed; falling back to ${CLOUDFLARE_FALLBACK_IMAGE_MODEL}:`,
        primaryError.response?.data || primaryError.message
      );
      imageBuffer = await generateWithFlux2Klein(
        prompt,
        CLOUDFLARE_ACCOUNT_ID,
        CLOUDFLARE_API_TOKEN
      );
    }

    console.log(`Cloudflare image generated in ${Date.now() - startedAt}ms`);
    return imageBuffer;

  } catch (error: any) {
    console.error("Error generating image with Cloudflare AI:", error.response?.data || error.message);
    throw new Error("Cloudflare image generation failed");
  }
}

function getCloudflareImage(responseData: any) {
  const base64Image = responseData?.result?.image ?? responseData?.image;
  if (!base64Image) {
    throw new Error("Cloudflare returned no image");
  }

  return Buffer.from(base64Image, "base64");
}

async function generateWithPhoenix(
  prompt: string,
  accountId: string,
  apiToken: string
) {
  const response = await axios.post(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${CLOUDFLARE_IMAGE_MODEL}`,
    {
      prompt,
      negative_prompt:
        "isolated face, close-up headshot, portrait photography, passport photo, selfie, " +
        "empty background, generic stock photo, cropped head, giant face, text, letters, logo, " +
        "watermark, UI, split screen, collage, clutter, tiny objects, low contrast",
      width: 1024,
      height: 576,
      guidance: 7,
      num_steps: 35,
      seed: Math.floor(Math.random() * 1_000_000_000),
    },
    {
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
        Accept: "image/jpeg",
      },
      responseType: "arraybuffer",
      timeout: 120_000,
    }
  );

  const contentType = response.headers["content-type"];
  if (contentType?.includes("application/json")) {
    throw new Error(Buffer.from(response.data).toString("utf8"));
  }

  return Buffer.from(response.data);
}

async function generateWithFlux2Klein(
  prompt: string,
  accountId: string,
  apiToken: string
) {
  const formData = new FormData();
  formData.append("prompt", prompt);
  formData.append("width", "1024");
  formData.append("height", "576");
  formData.append("steps", "20");
  formData.append("seed", String(Math.floor(Math.random() * 1_000_000_000)));

  const response = await axios.post(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${CLOUDFLARE_FALLBACK_IMAGE_MODEL}`,
    formData,
    {
      headers: {
        Authorization: `Bearer ${apiToken}`,
      },
      timeout: 90_000,
    }
  );

  return getCloudflareImage(response.data);
}

async function generateAndUploadThumbnail(prompt: string, heading: string) {
  const startedAt = Date.now();
  const imageBuffer = await CloudflareGenerateImage(prompt);
  const thumbnailBuffer = await formatAsYouTubeThumbnail(imageBuffer, heading);
  const thumbnail = await imageKit.upload({
    file: thumbnailBuffer,
    fileName: `${Date.now()}.jpg`,
    isPublished: true,
    useUniqueFileName: true,
  });

  console.log(`Thumbnail generated and uploaded in ${Date.now() - startedAt}ms`);
  return thumbnail.url;
}

export async function GoogleGenerateImage(prompt?: string) {
  const GOOGLE_GEMINI_API_KEY = process.env.GEMINI_API_KEY;

  if (!GOOGLE_GEMINI_API_KEY) {
    throw new Error("Missing Google Gemini API key in .env");
  }

  if (!prompt) {
    throw new Error("No prompt provided for image generation");
  }

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${GOOGLE_GEMINI_API_KEY}`,
      {
        instances: [{ prompt: prompt ?? "" }],
        parameters: { sampleCount: 1 }
      },
      { headers: { "Content-Type": "application/json" } }
    );

    if (response.status !== 200) {
      throw new Error(`Gemini API error ${response.status}: ${JSON.stringify(response.data)}`);
    }

    const base64Image = response.data.predictions?.[0]?.imageBytes;
    if (!base64Image) {
      throw new Error("No image generated in response");
    }

    const imageBuffer: Buffer = Buffer.from(base64Image, 'base64');
    console.log("GoogleGenerateImage DONE ---------------------");
    return imageBuffer;
  } catch (error: any) {
    console.error("Error generating image with Google Gemini API:", error.response?.data || error.message);
    throw new Error("Google image generation failed");
  }
}

const imageKit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY as string,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY as string,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT as string,
})

// ✅ Switched to Google AI Studio (free, OpenAI-SDK compatible)
export const openai = new OpenAI({
  baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
  apiKey: process.env.GEMINI_API_KEY,
});

export const replicate = new Replicate({
  auth: process.env.REPLICATE_API_KEY,
})

// ✅ Fixed JSON structure - valid titles array, no duplicate keys
const contentGentrationPrompt = (userInput: string) => `
You are an expert YouTube SEO strategist and AI creative assistant. Based on the user input below, generate a JSON response only (no explanation, no markdown, no commentary, no backticks).

User Input: ${userInput}

Return ONLY this exact JSON structure:
{
  "titles": [
    { "title": "First SEO optimized title here", "seo_score": 87 },
    { "title": "Second SEO optimized title here", "seo_score": 82 },
    { "title": "Third SEO optimized title here", "seo_score": 78 }
  ],
  "description": "A compelling 150-200 word YouTube video description with keywords naturally included.",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5", "tag6", "tag7", "tag8", "tag9", "tag10"],
  "image_prompts": [
    {
      "heading": "Short 4 Word Heading",
      "prompt": "Hyper-realistic YouTube thumbnail 16:9 aspect ratio 1280x720: Background: vibrant gradient evoking the topic mood. Central Elements: main subject with strong emotional expression. Foreground: metallic play button bottom left, minimal accent icons. Text Overlay: bold white sans-serif heading with glow effect. Composition: rule of thirds with focal point on subject. Lighting: dramatic spotlights high contrast shadows. Style: Cinematic HD viral YouTube aesthetic."
    },
    {
      "heading": "Another Short Heading",
      "prompt": "Hyper-realistic YouTube thumbnail 16:9 aspect ratio 1280x720: Background: contrasting bold color scheme. Central Elements: dynamic action scene related to topic. Foreground: glowing accent elements arrows or sparks. Text Overlay: large bold sans-serif text with drop shadow. Composition: centered focal point drawing the eye. Lighting: bright studio lighting with dramatic shadows. Style: Cinematic HD viral YouTube aesthetic."
    }
  ]
}
`

export const GenrateAiThumbnail = inngest.createFunction(
  { id: "ai/generate-thumbnail" },
  { event: "ai/generate-thumbnail" },
  async ({ event, step }) => {
    const {
      userInput,
      referenceImage,
      referenceImageUrl,
      userImageUrl,
      userEmail,
    } = await event.data;

    // New events pass URLs so the Inngest payload stays below its size limit.
    // This fallback only supports older queued events that still contain base64 data.
    const uploadImageUrls = referenceImageUrl || (referenceImage
      ? await step.run(
        "UploadImage",
        async () => {
          const refernceImageUrl = await imageKit.upload({
            file: referenceImage?.buffer ?? '',
            fileName: referenceImage?.name ?? '',
            isPublished: true,
            useUniqueFileName: false,
          })
          return refernceImageUrl.url
        }
      )
      : null);

    const thumbnailConcept = await step.run(
      "plan-thumbnail-concept",
      async () => generateThumbnailConcept(
        String(userInput ?? ""),
        uploadImageUrls,
        userImageUrl
      )
    );

    // Keep the binary image inside one step. Inngest serializes step return values as JSON,
    // so returning only the URL avoids moving a large Buffer between durable steps.
    const uploadThumbnail = await step.run(
      'generate-and-upload-image',
      async () => {
        return generateAndUploadThumbnail(
          thumbnailConcept.prompt,
          thumbnailConcept.heading
        );
      }
    )

    // Save thumbnail to db
    const saveThumbnail = await step.run('Save Thumbnail', async () => {
      // ✅ Fixed: .returning() takes no arguments in Drizzle
      const result = await db.insert(AiThumbnail).values({
        userInput: userInput,
        thumbnailUrl: uploadThumbnail,
        refImage: uploadImageUrls || userImageUrl,
        userEmail: userEmail,
        createdAt: moment().format('YYYY-MM-DD')
      }).returning()

      return result[0];
    })

    return {
      ...saveThumbnail,
      thumbnailUrl: uploadThumbnail,
    };
  },
)

export const GenrateAiContent = inngest.createFunction(
  { id: 'ai/generate-content' },
  { event: 'ai/generate-content' },
  async ({ event, step }) => {
    const { userInput, userEmail } = await event.data;

    const [gerateAiContent, thumbnailConcept] = await Promise.all([
      step.run(
        'generateContent',
        async () => {
          const completion = await openai.chat.completions.create({
            model: AiModelForContent,
            messages: [
              {
                role: 'user',
                content: contentGentrationPrompt(userInput),
              }
            ],
          });

          const RawJson = completion.choices[0].message.content;
          console.log("Generated Content:", RawJson);

          const match = RawJson?.match(/```(?:json)?\s*([\s\S]*?)```/);
          const cleanJson = match ? match[1].trim() : RawJson?.trim();

          if (!cleanJson) throw new Error("No content generated");

          return JSON.parse(cleanJson);
        }
      ),
      step.run(
        "plan-thumbnail-concept",
        async () => generateThumbnailConcept(userInput)
      ),
    ])

    const uploadThumbnail = await step.run(
      'generate-and-upload-image',
      async () => generateAndUploadThumbnail(
        thumbnailConcept.prompt,
        thumbnailConcept.heading
      )
    )

    const saveContent = await step.run(
      'save to Database',
      async () => {
        // ✅ Fixed: .returning() takes no arguments in Drizzle
        const result = await db.insert(AiContentTable).values({
          content: gerateAiContent,
          createdAt: moment().format('YYYY-MM-DD'),
          thumbnailUrl: uploadThumbnail,
          userEmail: userEmail,
          userInput: userInput,
        }).returning()

        console.log("result -from saveContent --------------------", result)
        return result[0];
      }
    )

    return saveContent;
  }
)
