import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/markets")({
  component: MarketsLayout,
});

// react-doctor-disable-next-line react-doctor/only-export-components
function MarketsLayout() {
  return <Outlet />;
}
