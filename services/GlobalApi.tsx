export const RunStatus = async (id: string) => {
  try {
    const isDevelopment = process.env.NODE_ENV !== "production";
    const configuredUrl = isDevelopment
      ? process.env.INNGEST_DEVSERVER_URL || "http://127.0.0.1:8288"
      : process.env.INNGEST_SERVER_URL;

    if (!configuredUrl) {
      throw new Error("INNGEST_SERVER_URL is not configured");
    }

    const normalizedUrl = configuredUrl.replace(/\/$/, "");
    const baseUrl = normalizedUrl.endsWith("/v1/events")
      ? normalizedUrl
      : `${normalizedUrl}/v1/events`;

    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (!isDevelopment) {
      if (!process.env.INNGEST_SIGNING_KEY) {
        throw new Error("INNGEST_SIGNING_KEY is not configured");
      }

      headers.Authorization = `Bearer ${process.env.INNGEST_SIGNING_KEY}`;
    }

    const response = await fetch(`${baseUrl}/${id}/runs`, {
      headers,
      cache: "no-store",
    });
    const json = await response.json();

    // The Dev Server can report API errors in a successful HTTP response.
    if (!response.ok || json.error) {
      throw new Error(
        `Inngest API error: ${json.status || response.status} ${json.error || "Unknown error"}`
      );
    }

    console.log("Inngest run status response:", json);
    return json.data; // Returns array of runs for the event
  } catch (error) {
    console.error("Error fetching run status:", error);
    throw error;
  }
};
