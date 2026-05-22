import { Link } from "@tanstack/react-router";
import { Button } from "@/components/button";

export function Empty404Page() {
  return (
    <main className="min-h-0 overflow-y-auto bg-[#050604] text-zinc-100">
      <div className="mx-auto flex min-h-full max-w-2xl flex-col justify-center px-5 py-16 sm:px-8">
        <p className="font-mono text-sm text-zinc-500">404</p>
        <h1 className="mt-4 font-semibold text-3xl leading-tight">
          Diese Seite gibt es nicht.
        </h1>
        <p className="mt-3 max-w-md text-sm text-zinc-400 leading-6">
          Der Link ist vielleicht veraltet oder die Seite wurde verschoben.
          Prüfe die URL oder geh zurück zur Startseite.
        </p>

        <div className="mt-7 flex flex-wrap items-center gap-2">
          <Button onClick={() => window.history.back()} variant="outline">
            Zurück
          </Button>
          <Button
            className="bg-[#c8ff00] text-black hover:bg-[#b7eb00]"
            render={<Link to="/" />}
          >
            Startseite
          </Button>
        </div>
      </div>
    </main>
  );
}
