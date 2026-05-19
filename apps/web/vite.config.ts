import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import { withRelatedProject } from "@vercel/related-projects";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv, type UserConfig } from "vite";

const LOCAL_SERVER_URL = "http://localhost:3000";
const SERVER_PROJECT_NAME = "m324-server";

const getServerUrl = (mode: string): string => {
  const env = loadEnv(mode, process.cwd(), "");
  const vercelEnvironment = env.VERCEL_ENV || process.env.VERCEL_ENV;
  const explicitServerUrl = env.VITE_SERVER_URL || process.env.VITE_SERVER_URL;
  const isVercelPreview = vercelEnvironment === "preview";
  const relatedServerUrl = withRelatedProject({
    projectName: SERVER_PROJECT_NAME,
    defaultHost: "",
  });

  if (isVercelPreview && relatedServerUrl) {
    return relatedServerUrl;
  }

  if (explicitServerUrl) {
    return explicitServerUrl;
  }

  if (relatedServerUrl) {
    return relatedServerUrl;
  }

  return LOCAL_SERVER_URL;
};

export default defineConfig(({ mode }): UserConfig => {
  const serverUrl = getServerUrl(mode);

  return {
    server: {
      port: 3001,
    },
    build: {
      rolldownOptions: {
        output: {
          codeSplitting: true,
          manualChunks(id) {
            if (!id.includes("node_modules")) {
              return;
            }

            if (id.includes("react") || id.includes("scheduler")) {
              return "vendor-react";
            }

            if (id.includes("@tanstack")) {
              return "vendor-tanstack";
            }

            if (id.includes("better-auth")) {
              return "vendor-auth";
            }

            if (id.includes("@base-ui") || id.includes("lucide-react")) {
              return "vendor-ui";
            }

            return "vendor";
          },
        },
      },
    },
    define: {
      "import.meta.env.VITE_SERVER_URL": JSON.stringify(serverUrl),
    },
    resolve: {
      tsconfigPaths: true,
    },
    plugins: [
      tailwindcss(),
      tanstackRouter({
        target: "react",
        autoCodeSplitting: true,
      }),
      react(),
    ],
  };
});
