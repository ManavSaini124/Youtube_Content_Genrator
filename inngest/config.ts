const DEFAULT_INNGEST_DEV_SERVER_URL = "http://127.0.0.1:8288";

const isHttpUrl = (value: string) => /^https?:\/\//i.test(value);
const parseBoolean = (value?: string) => {
  if (!value) return undefined;
  if (value === "1" || value.toLowerCase() === "true") return true;
  if (value === "0" || value.toLowerCase() === "false") return false;
  return undefined;
};

export const getInngestRuntimeConfig = () => {
  const devSetting = process.env.INNGEST_DEV?.trim();
  const configuredDevServerUrl = process.env.INNGEST_DEVSERVER_URL?.trim();
  const explicitMode = devSetting && isHttpUrl(devSetting)
    ? true
    : parseBoolean(devSetting);
  const devServerUrl =
    devSetting && isHttpUrl(devSetting)
      ? devSetting
      : configuredDevServerUrl || DEFAULT_INNGEST_DEV_SERVER_URL;

  return {
    isDev: explicitMode,
    baseUrl: explicitMode === true ? devServerUrl : undefined,
    devServerUrl,
  };
};

const isDevServerAvailable = async (url: string) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 1_500);

  try {
    const response = await fetch(new URL("/dev", url), {
      cache: "no-store",
      signal: controller.signal,
    });

    if (!response.ok) return false;
    await response.json();
    return true;
  } catch {
    return false;
  } finally {
    clearTimeout(timeout);
  }
};

export const getInngestRunsConfig = async () => {
  const runtimeConfig = getInngestRuntimeConfig();
  const useDevServer =
    runtimeConfig.isDev ??
    (process.env.NODE_ENV !== "production" &&
      await isDevServerAvailable(runtimeConfig.devServerUrl));
  const configuredUrl = useDevServer
    ? runtimeConfig.devServerUrl
    : process.env.INNGEST_SERVER_URL?.trim() || "https://api.inngest.com";

  if (!configuredUrl) {
    throw new Error("Inngest server URL is not configured.");
  }

  const normalizedUrl = configuredUrl.replace(/\/$/, "");

  return {
    ...runtimeConfig,
    isDev: useDevServer,
    eventsUrl: normalizedUrl.endsWith("/v1/events")
      ? normalizedUrl
      : `${normalizedUrl}/v1/events`,
  };
};

export const getInngestUnavailableMessage = () =>
  getInngestRuntimeConfig().isDev === true
    ? "The local Inngest Dev Server is not running. Start it with `npm run inngest`."
    : "The generation service is temporarily unavailable. Please try again.";
