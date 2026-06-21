import { getInngestRunsConfig } from "@/inngest/config";

export class InngestStatusError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code: string,
  ) {
    super(message);
    this.name = "InngestStatusError";
  }
}

export const RunStatus = async (id: string) => {
  const { isDev, eventsUrl } = await getInngestRunsConfig();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);

  try {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (!isDev) {
      if (!process.env.INNGEST_SIGNING_KEY) {
        throw new InngestStatusError(
          "Inngest status polling is not configured.",
          503,
          "INNGEST_NOT_CONFIGURED",
        );
      }

      headers.Authorization = `Bearer ${process.env.INNGEST_SIGNING_KEY}`;
    }

    const response = await fetch(
      `${eventsUrl}/${encodeURIComponent(id)}/runs`,
      {
        headers,
        cache: "no-store",
        signal: controller.signal,
      },
    );
    const json = await response.json().catch(() => null);

    if (!response.ok || json?.error) {
      throw new InngestStatusError(
        json?.error || "Failed to fetch generation status.",
        response.status >= 400 ? response.status : 502,
        "INNGEST_STATUS_ERROR",
      );
    }

    return json?.data ?? [];
  } catch (error) {
    if (error instanceof InngestStatusError) {
      throw error;
    }

    const isTimeout =
      error instanceof Error &&
      (error.name === "AbortError" || error.name === "TimeoutError");
    const message = isDev
      ? "The local Inngest Dev Server is not running. Start it with `npm run inngest`."
      : isTimeout
        ? "The generation status request timed out. Please try again."
        : "The generation service is temporarily unavailable. Please try again.";

    console.error("Unable to fetch Inngest run status:", {
      mode: isDev ? "local" : "cloud",
      error: error instanceof Error ? error.message : String(error),
    });

    throw new InngestStatusError(
      message,
      503,
      isDev ? "INNGEST_DEV_UNAVAILABLE" : "INNGEST_UNAVAILABLE",
    );
  } finally {
    clearTimeout(timeout);
  }
};
