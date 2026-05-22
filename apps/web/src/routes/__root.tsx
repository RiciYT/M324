import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
} from "@tanstack/react-router";
import { Empty404Page } from "@/components/empty-404";
import Header from "@/components/header";
import { Toaster } from "@/components/sonner";
import { ThemeProvider } from "@/components/theme-provider";

import "../index.css";

export type RouterAppContext = Record<keyof never, never>;

export const Route = createRootRouteWithContext<RouterAppContext>()({
  component: RootComponent,
  head: () => ({
    meta: [
      {
        title: "ShitMarket",
      },
      {
        name: "description",
        content: "ShitMarket ist die Prognosemarkt-Parodie für absurde Wetten.",
      },
    ],
    links: [
      {
        rel: "icon",
        href: "/favicon.ico",
      },
    ],
  }),
  notFoundComponent: Empty404Page,
});

// react-doctor-disable-next-line react-doctor/only-export-components
function RootComponent() {
  return (
    <>
      <HeadContent />
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        disableTransitionOnChange
        storageKey="vite-ui-theme"
      >
        <div className="grid h-svh grid-rows-[auto_1fr]">
          <a
            className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-[6px] focus:bg-[#c8ff00] focus:px-3 focus:py-2 focus:text-black"
            href="#main-content"
          >
            Zum Inhalt springen
          </a>
          <Header />
          <div className="min-w-0 overflow-x-hidden" id="main-content">
            <Outlet />
          </div>
        </div>
        <Toaster richColors />
      </ThemeProvider>
    </>
  );
}
