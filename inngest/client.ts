import { Inngest } from "inngest";
import { getInngestRuntimeConfig } from "./config";

const runtimeConfig = getInngestRuntimeConfig();

export const inngest = new Inngest({
  id: "AIShorts",
  ...(typeof runtimeConfig.isDev === "boolean"
    ? { isDev: runtimeConfig.isDev }
    : {}),
  ...(runtimeConfig.baseUrl ? { baseUrl: runtimeConfig.baseUrl } : {}),
});
