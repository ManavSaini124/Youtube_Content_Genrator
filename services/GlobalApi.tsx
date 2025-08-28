export const RunStatus = async (id: string) => {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_INNGEST_SERVER_URL;
    const headers = {
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_INNGEST_SIGNING_KEY}`,
      "Content-Type": "json",
    };

    // 1. Try to fetch as if it's a runId directly(Why the hell its not returning json)
    let response = await fetch(`${baseUrl}/${id}/runs`, { headers });
    console.log("Initial fetch response:", response);

    // If the response isn't JSON, assume it's actually an eventId
    const contentType = response.headers.get("content-type");
    const text = await response.text();
    console.log("Raw response text:", text);
    console.log("Content-Type:", contentType);

    if (!contentType?.includes("application/json")) {
      console.warn("Got non-JSON. Assuming this is an Event ID, resolving to Run ID…");

      // 2. Resolve eventId → runId
      const runsRes = await fetch(`${baseUrl}/${id}/runs`, { headers });
      if (!runsRes.ok) {
        const text = await runsRes.text();
        console.error("Error resolving Event ID to Run ID:", text); 
        throw new Error(`Failed to resolve Event ID to Run ID: ${text}`);
      }

      console.log("Resolved Event ID → Run ID response:", runsRes.json);
      console.log("Type->", typeof runsRes);

      const runsJson = await runsRes.json();
      console.log("Resolved Event ID → Run ID JSON:", runsJson);
      const runId = runsJson.data?.[0]?.id;
      console.log("Resolved Event ID → Run ID:", runId);

      if (!runId) throw new Error("No run found for this event");
      console.log("Resolved Event ID → Run ID:", runId);

      // 3. Fetch the run status properly
      response = await fetch(`${baseUrl}/${runId}/runs`, { headers });
    }

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Inngest API error: ${response.status} ${text}`);
    }

    const json = await response.json();
    console.log("Inngest run status response:", json);
    return json.data;

  } catch (error) {
    console.error("Error fetching run status:", error);
    throw error;
  }
};

// export async function RunStatus(eventId:string) {
//   const response = await fetch(process.env.NEXT_PUBLIC_INNGEST_SERVER_URL+`/${eventId}/runs`, {
//     headers: {
//       Authorization: `Bearer ${process.env.NEXT_PUBLIC_INNGEST_SIGNING_KEY}`,
//     },
//   });
//   console.log("Response:", response);
//   const json = await response.json();
//   return json.data;
// }
