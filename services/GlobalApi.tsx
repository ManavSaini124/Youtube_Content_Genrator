export const RunStatus = async (id: string) => {
  try {
    const baseUrl = process.env.INNGEST_SERVER_URL; // https://api.inngest.com/v1/events
    const headers = {
      Authorization: `Bearer ${process.env.INNGEST_SIGNING_KEY}`,
      "Content-Type": "application/json",
    };

    const response = await fetch(`${baseUrl}/${id}/runs`, { headers });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Inngest API error: ${response.status} ${text}`);
    }

    const json = await response.json();
    console.log("Inngest run status response:", json);
    return json.data; // Returns array of runs for the event
  } catch (error) {
    console.error("Error fetching run status:", error);
    throw error;
  }
};