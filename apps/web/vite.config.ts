import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import { withRelatedProject } from "@vercel/related-projects";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv, type UserConfig } from "vite";

const LOCAL_SERVER_URL = "http://localhost:3000";
const SERVER_PROJECT_NAME = "m324-server";
const REACT_PACKAGES = new Set(["react", "react-dom", "scheduler"]);
const AUTH_PACKAGES = new Set(["better-auth"]);
const CHART_PACKAGES = new Set(["recharts"]);
const ANIMATION_PACKAGES = new Set(["gsap", "@gsap/react"]);
const VALIDATION_PACKAGES = new Set(["zod", "@t3-oss/env-core"]);
const UI_PACKAGES = new Set([
  "lucide-react",
  "sonner",
  "next-themes",
  "class-variance-authority",
  "clsx",
  "tailwind-merge",
]);

const getPackageName = (id: string): string | undefined => {
  const normalizedId = id.replaceAll("\\", "/");
  const nodeModulesIndex = normalizedId.lastIndexOf("/node_modules/");

  if (nodeModulesIndex === -1) {
    return;
  }

  const packagePath = normalizedId.slice(
    nodeModulesIndex + "/node_modules/".length
  );
  const [scopeOrName, name] = packagePath.split("/");

  if (!scopeOrName) {
    return;
  }

  if (scopeOrName.startsWith("@") && name) {
    return `${scopeOrName}/${name}`;
  }

  return scopeOrName;
};

const getManualChunkName = (packageName: string): string => {
  if (REACT_PACKAGES.has(packageName)) {
    return "vendor-react";
  }

  if (packageName.startsWith("@tanstack/")) {
    return "vendor-tanstack";
  }

  if (AUTH_PACKAGES.has(packageName)) {
    return "vendor-auth";
  }

  if (CHART_PACKAGES.has(packageName) || packageName.startsWith("d3-")) {
    return "vendor-charts";
  }

  if (ANIMATION_PACKAGES.has(packageName)) {
    return "vendor-animation";
  }

  if (VALIDATION_PACKAGES.has(packageName)) {
    return "vendor-validation";
  }

  if (packageName.startsWith("@base-ui/") || UI_PACKAGES.has(packageName)) {
    return "vendor-ui";
  }

  return "vendor";
};

const getServerUrl = (mode: string): string => {
  const env = loadEnv(mode, process.cwd(), "");
  const explicitServerUrl = env.VITE_SERVER_URL || process.env.VITE_SERVER_URL;
  const relatedServerUrl = withRelatedProject({
    projectName: SERVER_PROJECT_NAME,
    defaultHost: "",
  });

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

  console.info(`Using API server URL: ${serverUrl}`);

  return {
    server: {
      port: 3001,
    },
    build: {
      rolldownOptions: {
        output: {
          codeSplitting: true,
          manualChunks(id) {
            const packageName = getPackageName(id);

            if (!packageName) {
              return;
            }

            return getManualChunkName(packageName);
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
