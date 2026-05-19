import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/card";
import { Input } from "@/components/input";
import { Label } from "@/components/label";
import { apiClient } from "@/lib/api-client";

export function MarketCreateForm() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [closesAt, setClosesAt] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      await apiClient.createMarket({
        title,
        description,
        closesAt: new Date(closesAt).toISOString(),
      });
      toast.success("Markt erstellt");
      setTitle("");
      setDescription("");
      setClosesAt("");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Markt konnte nicht erstellt werden"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="rounded-[8px] border border-zinc-800 bg-[#11120f] py-0 text-zinc-100 ring-0">
      <CardHeader className="py-5">
        <CardTitle className="font-black text-xl uppercase">
          Markt erstellen
        </CardTitle>
        <CardDescription className="text-zinc-400">
          Titel, Kontext und Ablaufdatum reichen für die erste Version.
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-6">
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2">
            <Label className="text-zinc-400" htmlFor="market-title">
              Titel
            </Label>
            <Input
              className="h-11 border-zinc-700 bg-black/30 text-zinc-100"
              id="market-title"
              onChange={(event) => setTitle(event.target.value)}
              required
              value={title}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label className="text-zinc-400" htmlFor="market-description">
              Beschreibung
            </Label>
            <Input
              className="h-11 border-zinc-700 bg-black/30 text-zinc-100"
              id="market-description"
              onChange={(event) => setDescription(event.target.value)}
              required
              value={description}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label className="text-zinc-400" htmlFor="market-closes-at">
              Schließt am
            </Label>
            <Input
              className="h-11 border-zinc-700 bg-black/30 text-zinc-100"
              id="market-closes-at"
              onChange={(event) => setClosesAt(event.target.value)}
              required
              type="datetime-local"
              value={closesAt}
            />
          </div>
          <Button
            className="h-11 bg-[#c8ff00] font-black text-black uppercase hover:bg-[#c8ff00]/90"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? "Wird erstellt..." : "Markt erstellen"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
