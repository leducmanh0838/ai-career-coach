import { defineConfig, loadEnv } from "vite";
import vinext from "vinext";
import { cloudflare } from "@cloudflare/vite-plugin";
import { imagesOptimizer } from "@vinext/cloudflare/images/images-optimizer";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const googleClientId =
    env.GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID || "";

  return {
    define: {
      "process.env.GOOGLE_CLIENT_ID": JSON.stringify(googleClientId),
    },
    plugins: [
      vinext({
        images: { optimizer: imagesOptimizer() },
      }),
      cloudflare({
        viteEnvironment: {
          name: "rsc",
          childEnvironments: ["ssr"],
        },
      }),
    ],
  };
});