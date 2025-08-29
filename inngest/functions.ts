import OpenAI from 'openai';
import { inngest } from "./client";
import ImageKit from 'imagekit'
import Replicate from "replicate"
import { db } from '@/configs/db';
import { AiContentTable, AiThumbnail } from '@/configs/schema';
import moment from 'moment';
import axios from "axios";
import sharp from 'sharp';
import { steps } from 'framer-motion';

const HF_API_TOKEN = process.env.HUGGING_FACE_ACCESS_TOKEN; // add your token in .env
const HF_MODEL_ID = "stabilityai/stable-diffusion-2";
const AiModelForContent = "mistralai/mistral-small-3.2-24b-instruct:free"
const AiModelForThumbnail = "google/gemini-2.0-flash-exp:free"

// DOESNT WORK 
export async function HFgenerateImage(prompt?: string) {
  const decode = (data: ArrayBuffer) =>
    Buffer.from(data).toString("utf8");

  try {
    const response = await axios.post(
      `https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2`,
      {
        inputs: prompt
      },
      {
        headers: {
          Authorization: `Bearer ${HF_API_TOKEN}`,
          "Content-Type": "application/json",
          Accept: "image/png"
        },
        responseType: "arraybuffer", // because HF returns images as binary
      }
    );

    const contentType = response.headers["content-type"];
    if (contentType?.includes("application/json")) {
      const errorJson = JSON.parse(Buffer.from(response.data).toString("utf8"));
      console.error("HF API error:", errorJson);
      throw new Error(errorJson.error || "HF request failed");
    }


    if(response.status !== 200){
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

  const maxPromptLength = 2048;
  if (prompt.length > maxPromptLength) {
    console.warn(`Prompt length (${prompt.length}) exceeds ${maxPromptLength} characters. Truncating...`);
    prompt = prompt.substring(0, maxPromptLength - 50);
  }

  try {
    const response = await axios.post(
      `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/ai/run/@cf/black-forest-labs/flux-1-schnell`,
      {
        prompt: prompt ?? '',
        steps: 8,
        guidance: 7.5,
        seed: Math.floor(Math.random() * 1000000000),
      },
      {
        headers: {
          Authorization: `Bearer ${CLOUDFLARE_API_TOKEN}`,
          "Content-Type": "application/json"
        }
      }
    );

    if(response.status !== 200){
      console.log("I want to cry now");
      throw new Error(`Cloudflare AI error ${response.status}: ${JSON.stringify(response.data)}`);
    }

    const base64Image = response.data.result.image;
    if (!base64Image) {
      throw new Error("No image generated in response");
    }

    let imageBuffer:Buffer<ArrayBufferLike> = Buffer.from(base64Image, 'base64');
    // imageBuffer = await sharp(imageBuffer)
    //   .resize(1024, 576, { fit: 'cover' })  // Crop to fit if needed
    //   .toFormat('png') // Convert to PNG with quality
    //   .toBuffer();

    console.log("CloudflareGenerateImage DONE ---------------------");
    return imageBuffer;

  } catch (error: any) {
    console.error("Error generating image with Cloudflare AI:", error.response?.data || error.message);
    throw new Error("Cloudflare image generation failed");
  }
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
        instances: [
          {
            prompt: prompt ?? ""
          }
        ],
        parameters: {
          sampleCount: 1  // Generate 1 image (up to 4; keep low for free tier efficiency)
        }
      },
      {
        headers: {
          "Content-Type": "application/json"
        }
      }
    );

    if (response.status !== 200) {
      throw new Error(`Gemini API error ${response.status}: ${JSON.stringify(response.data)}`);
    }

    // Extract base64 image from response (in predictions array)
    const base64Image = response.data.predictions?.[0]?.imageBytes;
    if (!base64Image) {
      throw new Error("No image generated in response");
    }

    let imageBuffer:Buffer<ArrayBufferLike> = Buffer.from(base64Image, 'base64');

    // Optional: Resize to 16:9 (1024x576) for thumbnails
    // imageBuffer = await sharp(imageBuffer)
    //   .resize(1024, 576, { fit: 'cover' })  // Crop to fit if needed
    //   .toFormat('png')  // Ensure PNG format
    //   .toBuffer();

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

export const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPEN_ROUTER_API_KEY,
});

export const replicate  = new Replicate({
  auth: process.env.REPLICATE_API_KEY,
})
// TODO: change prompt to include the prompt form image in tags and extract that out
export const GenrateAiThumbnail = inngest.createFunction(
    {id: "ai/generate-thumbnail"},
    {event: "ai/generate-thumbnail"},
    async ({event, step}) => {
        const {userInput, referenceImage, userImage, userEmail} = await event.data;

        // image to cloud
        const uploadImageUrls = await step.run(
          "UploadImage",
          async ()=>{
            if(!referenceImage) return null;
            const refernceImageUrl = await imageKit.upload({
                file: referenceImage?.buffer??'',
                fileName: referenceImage?.name??'',
                isPublished: true,
                useUniqueFileName: false,
            })
            return refernceImageUrl.url
          }
        )
        
        // Genrate Prompt 
        const generateThumbnailPrompt = await step.run(
          'generateThumbnailPrompt',
          async()=>{
            
            const maxPromptLength = 2048;// just for cloudfare
            const completion = await openai.chat.completions.create({
              model: AiModelForThumbnail,
              messages: [
                {
                  role: 'user',
                  content: [
                    {
                      "type": "text",
                      "text": uploadImageUrls
                        ? `Analyze the reference image at this URL: "${uploadImageUrls}". Extract its style (color scheme, mood, layout, key elements, lighting) and create a detailed, descriptive text prompt (max 2048 characters) for an AI image generator to produce a viral YouTube thumbnail adapted to the user theme: "${userInput}".
                          Match the reference's aesthetic while enhancing for click appeal: add emotional expressions, dynamic actions, and curiosity-evoking symbols.
                          Structure the prompt strictly with sections: Background, Central Elements, Foreground, Text Overlay, Composition, Lighting and Effects, Style.
                          Ensure bold, eye-catching design optimized for 16:9 aspect (1280x720 resolution), high contrast, vibrant colors, and large, legible sans-serif text without distortion.
                          Include a prominent play button icon, minimal icons (e.g., arrows, sparks for emphasis), and dynamic effects (e.g., gradients, glows, shadows).
                          Example structure: "Hyper-realistic YouTube thumbnail in 16:9 aspect: Background: Vibrant orange-to-red gradient evoking excitement. Central Elements: Person with surprised expression holding a glowing gadget. Foreground: Metallic play button bottom left, subtle question mark icons floating. Text Overlay: Large bold white sans-serif 'Top 10 Must-Know Tips!' centered with glow. Composition: Rule of thirds with focal point on face. Lighting and Effects: Dramatic spotlights, high contrast shadows. Style: Cinematic, HD quality, viral YouTube aesthetic."
                          Return ONLY the text prompt string, no extra text, explanations, or thinking.`
                        : `Create a detailed, descriptive text prompt (max 2048 characters) for an AI image generator to produce a viral YouTube thumbnail based on the user theme: "${userInput}".
                          Enhance for click appeal: add emotional expressions, dynamic actions, and curiosity-evoking symbols.
                          Structure the prompt strictly with sections: Background, Central Elements, Foreground, Text Overlay, Composition, Lighting and Effects, Style.
                          Ensure bold, eye-catching design optimized for 16:9 aspect (1280x720 resolution), high contrast, vibrant colors, and large, legible sans-serif text without distortion.
                          Include a prominent play button icon, minimal icons (e.g., arrows, sparks for emphasis), and dynamic effects (e.g., gradients, glows, shadows).
                          Example structure: "Hyper-realistic YouTube thumbnail in 16:9 aspect: Background: Vibrant orange-to-red gradient evoking excitement. Central Elements: Person with surprised expression holding a glowing gadget. Foreground: Metallic play button bottom left, subtle question mark icons floating. Text Overlay: Large bold white sans-serif 'Top 10 Must-Know Tips!' centered with glow. Composition: Rule of thirds with focal point on face. Lighting and Effects: Dramatic spotlights, high contrast shadows. Style: Cinematic, HD quality, viral YouTube aesthetic."
                          Return ONLY the text prompt string, no extra text, explanations, or thinking.`
                    },
                    //@ts-ignore
                    ...(uploadImageUrls?
                      [
                        {
                          "type": "image_url",
                          "image_url": {
                            "url": uploadImageUrls??""
                          }
                        }
                      ]
                      : []
                    )
                  ]
                },
              ],
            });

            let prompt = completion.choices[0].message.content;
            console.log("Generated prompt length:", prompt?.length || 0);
            console.log("Generated prompt:", prompt);
            if (!prompt) {
              throw new Error("No prompt generated by Moonshot AI");
            }

            if (prompt.length > maxPromptLength) {
              console.warn(`Prompt length (${prompt.length}) exceeds ${maxPromptLength} characters. Truncating...`);
              prompt = prompt.substring(0, maxPromptLength - 50); // Leave buffer for safety
              console.log("Truncated prompt length:", prompt.length);
              console.log("Truncated prompt:", prompt);
            }
            
            console.log("generateThumbnailPrompt DONE ------------------------------" )
            return prompt
          }
        )

        // Genrate Thumbnail
        const generateImage = await step.run(
          'generateImage',
          async ()=>{
            // const input = {
            //   prompt: generateThumbnailPrompt,
            //   aspect_ratio: "16:9",
            //   output_format: "png",
            //   safety_filter_level: 'block_only_high'
            // };
            // const output = await replicate.run("stability-ai/stable-diffusion", {
            //   input
            // });
            // console.log(output);
            //  //@ts-ignore
            // return output.url()
            console.log("generateImage started ---------------------")
            const base64Image = await CloudflareGenerateImage(generateThumbnailPrompt ?? "");
            // const base64Image = await GoogleGenerateImage(generateThumbnailPrompt ?? ""); // DOESNT WORK
            console.log("generateImage DONE ---------------------")
            console.log("base64Image ---------------------",base64Image)
            return base64Image;
          }
        )

        // save image to cloud
        const uploadThumbnail = await step.run('Upload Thubnail',async()=>{
          const thumbnailUrl = await imageKit.upload({
            // file: generateImage?.buffer??'',
            file: Buffer.isBuffer(generateImage) ? generateImage : Buffer.from(generateImage.data ?? generateImage),
            fileName: Date.now().toString()+'.png',
            isPublished: true,
            useUniqueFileName: false,
          }) as any;

          return thumbnailUrl.url;
        })

        // save thumbnail to db
        const saveThumbnail = await step.run('Save Thumbnail', async()=>{
          const result = await db.insert(AiThumbnail).values({
            userInput: userInput,
            thumbnailUrl: uploadThumbnail,
            refImage: uploadImageUrls,
            userEmail: userEmail,
            createdAt: moment().format('YYYY-MM-DD')
             //@ts-ignore
          }).returning(AiThumbnail)
          
          return result; 
        })

        return saveThumbnail;

    },
)

const contentGentrationPrompt = (userInput: string)=>{
  return `
    You are an expert YouTube SEO strategist and Al creative assistant. Based on the user input below, generate a JSON response only (no explanation, no markdown, no commentary), containing:
    1. Three YouTube video titles optimized for SEO.
    2. SEO Score for each title ( 1 to 100).
    3. A compelling YouTube video description based on the topic.
    4. 10 relevant YouTube video tags.
    5. Two YouTube thumbnail image prompts, each including:
      Professional illustration style based on the video title
      A short 3-5 word heading that will appear on the thumbnail image
      Visually compelling layout concept to grab attention
    User Input: ${userInput} 
    Return format (JSON only):
    JsonCopyEdit{
      "title": {
        "Title 1",
        "seo score": 87
      }
      "title": {
        "Title 2",
        "sen score": 82
      }
      "title": {  
        "Title 3",
        "seo scorn": 78
      }
      "description": "Write a professional and engaging YouTube viden description here based on the input.",
      "tags": ["tag", "tag", "tag", "tag", "tags", "tag", "tag7", "tag", "tag", "tag18"],
      "image_prompts":[
      {
        "heading": "Heading Text 1"
        "prompt": "Professional illustration for thumbnail image based on Title 1. Include elements such as..."
      },
      {
        "heading": "Heading Text 2",
        "prompt: "Professional illustration for thumbnail image based on Title 2. Include elements such as..."
      }
    ]} 
    Make sure the thumbnail image prompt reflects the respective title context, includes visual style (3D/flat/vector), character/action/objects (if needed), background design, and text position ideas
  `
}


export const GenrateAiContent = inngest.createFunction(
  {id: 'ai/generate-content'},
  {event: 'ai/generate-content'},
  async({event, step})=>{
    const {userInput, userEmail} = await event.data;

    // await step.run('wait', async()=>{
    //   await new Promise(resolve => setTimeout(resolve, 6000));
    // })

    // return "Content generation is paused for now.";

    // to genrate title , discription , tags and thumbnail prompt
    const gerateAiContent = await step.run(
      'generateContent',
      async()=>{
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
        const formatJsonString = RawJson?.replace('```json', "").trim().replace('```', '').trim(); // remove new lines
        const formatedJson = formatJsonString && JSON.parse(formatJsonString)
        return formatedJson;
      }
    )
    // TO genrate thumbnail prompt
    const generateImage = await step.run(
      'generateImage',
      async ()=>{
          // const input = {
          //   prompt: generateThumbnailPrompt,
          //   aspect_ratio: "16:9",
          //   output_format: "png",
          //   safety_filter_level: 'block_only_high'
          // };

          // const output = await replicate.run("stability-ai/stable-diffusion", {
          //   input
          // });
          // console.log(output);
          //  //@ts-ignore
          // return output.url()
          console.log("generateImage started ---------------------")
          const base64Image = await CloudflareGenerateImage(gerateAiContent?.image_prompts[0].prompt ?? "");
          // const base64Image = await GoogleGenerateImage(generateThumbnailPrompt ?? ""); // DOESNT WORK
          console.log("generateImage DONE ---------------------")
          console.log("base64Image ---------------------",base64Image)
          return base64Image;
        }
      )

    // save image to cloud
    const uploadThumbnail = await step.run('Upload Thubnail',async()=>{
      const thumbnailUrl = await imageKit.upload({
        // file: generateImage?.buffer??'',
        file: Buffer.isBuffer(generateImage) ? generateImage : Buffer.from(generateImage.data ?? generateImage),
        fileName: Date.now().toString()+'.png',
        isPublished: true,
        useUniqueFileName: false,
      }) as any;

      return thumbnailUrl.url;
    })

    const saveContent = await step.run(
      'save to Database',
      async()=>{
        const result = await db.insert(AiContentTable).values({
          content: gerateAiContent,
          createdAt: moment().format('YYYY-MM-DD'),
          thumbnailUrl: uploadThumbnail,
          userEmail: userEmail,
          userInput: userInput,
          //@ts-ignore
        }).returning(AiContentTable)

        console.log("result -from saveContent --------------------",result)

        return result;
      }
    )
    return saveContent;
  }
)


