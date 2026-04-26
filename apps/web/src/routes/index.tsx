import { buttonVariants } from "@M324/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@M324/ui/components/card";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Activity,
  ArrowRight,
  Database,
  Server,
  ShieldCheck,
} from "lucide-react";

export const Route = createFileRoute("/")({
  component: HomeComponent,
});

const statusItems = [
  {
    label: "API",
    value: "Ready",
    detail: "Server endpoint reachable",
    icon: Server,
  },
  {
    label: "Auth",
    value: "Configured",
    detail: "Better Auth client active",
    icon: ShieldCheck,
  },
  {
    label: "Database",
    value: "Linked",
    detail: "Schema package available",
    icon: Database,
  },
] as const;

function HomeComponent() {
  return (
    <main className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:px-8 lg:py-16">
      <section className="flex min-h-[460px] flex-col justify-between rounded-lg border bg-card p-6 shadow-sm sm:p-8">
        <div className="space-y-6">
          <div className="inline-flex w-fit items-center gap-2 rounded-md border bg-muted/50 px-3 py-1 font-medium text-muted-foreground text-xs">
            <Activity className="size-3.5" />
            M324 Application Stack
          </div>
          <div className="max-w-2xl space-y-4">
            <h1 className="font-semibold text-4xl tracking-tight sm:text-5xl">
              Better Stack
            </h1>
            <p className="text-base text-muted-foreground leading-7 sm:text-lg">
              A compact full-stack workspace with routing, authentication,
              database packages, and shared UI primitives ready for the module
              work.
            </p>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link
            className={buttonVariants({ className: "w-full sm:w-fit" })}
            to="/dashboard"
          >
            Open dashboard
            <ArrowRight className="size-4" />
          </Link>
          <Link
            className={buttonVariants({
              className: "w-full sm:w-fit",
              variant: "outline",
            })}
            to="/login"
          >
            Sign in
          </Link>
        </div>
      </section>

      <section className="grid content-start gap-4">
        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {statusItems.map(({ detail, icon: Icon, label, value }) => (
              <div
                className="grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-md border bg-background p-3"
                key={label}
              >
                <div className="flex size-9 items-center justify-center rounded-md bg-muted text-muted-foreground">
                  <Icon className="size-4" />
                </div>
                <div>
                  <p className="font-medium text-sm">{label}</p>
                  <p className="text-muted-foreground text-xs">{detail}</p>
                </div>
                <span className="rounded-md border px-2 py-1 font-medium text-xs">
                  {value}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="rounded-lg border bg-muted/30 p-4">
          <p className="font-medium text-sm">Next step</p>
          <p className="mt-1 text-muted-foreground text-sm leading-6">
            Sign in to access the protected dashboard and verify the auth flow.
          </p>
        </div>
      </section>
    </main>
  );
}
