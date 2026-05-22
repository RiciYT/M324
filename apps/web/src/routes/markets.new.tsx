import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/button";
import { MarketCreateForm } from "@/components/market-create-form";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/markets/new")({
  component: NewMarketRoute,
});

function NewMarketRoute() {
  const navigate = Route.useNavigate();
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return (
      <main className="min-h-0 overflow-y-auto bg-[#050604] text-zinc-100">
        <section className="mx-auto flex max-w-3xl flex-col gap-6 px-5 py-8 sm:px-8 lg:px-14">
          <div className="border-[#20231b] border-b pb-6">
            <h1 className="font-semibold text-4xl tracking-normal">
              Neuer Markt
            </h1>
            <p className="mt-2 text-sm text-zinc-400 leading-6">
              Session wird geprüft…
            </p>
          </div>
        </section>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="min-h-0 overflow-y-auto bg-[#050604] text-zinc-100">
        <section className="mx-auto flex max-w-3xl flex-col gap-6 px-5 py-8 sm:px-8 lg:px-14">
          <div className="border-[#20231b] border-b pb-6">
            <h1 className="font-semibold text-4xl tracking-normal">
              Login erforderlich
            </h1>
            <p className="mt-2 text-sm text-zinc-400 leading-6">
              Du musst angemeldet sein, um einen neuen Markt zu erstellen.
            </p>
          </div>
          <Button
            className="h-11 w-fit bg-[#c8ff00] px-5 text-black hover:bg-[#b7eb00]"
            render={<Link search={{ mode: "signin" }} to="/login" />}
          >
            Zum Login
          </Button>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-0 overflow-y-auto bg-[#050604] text-zinc-100">
      <section className="mx-auto flex max-w-3xl flex-col gap-6 px-5 py-8 sm:px-8 lg:px-14">
        <div className="border-[#20231b] border-b pb-6">
          <h1 className="font-semibold text-4xl tracking-normal">
            Neuer Markt
          </h1>
          <p className="mt-2 text-sm text-zinc-400 leading-6">
            Frage, Kontext und Ablaufdatum reichen.
          </p>
        </div>
        <MarketCreateForm
          onCreated={() => {
            navigate({ to: "/markets" });
          }}
        />
      </section>
    </main>
  );
}
