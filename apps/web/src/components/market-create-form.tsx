import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/button";
import { Input } from "@/components/input";
import { Label } from "@/components/label";
import { apiClient, type Market } from "@/lib/api-client";
import { marketQueryKeys } from "@/lib/query-client";

interface MarketCreateFormProps {
  onCreated?: (market: Market) => void;
}

export function MarketCreateForm({ onCreated }: MarketCreateFormProps) {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [closesAt, setClosesAt] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const market = await apiClient.createMarket({
        title,
        description,
        closesAt: new Date(closesAt).toISOString(),
      });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: marketQueryKeys.markets }),
        queryClient.invalidateQueries({
          queryKey: marketQueryKeys.userCount,
        }),
      ]);
      toast.success("Markt erstellt");
      setTitle("");
      setDescription("");
      setClosesAt("");
      onCreated?.(market);
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
    <form
      className="flex flex-col gap-4 border-zinc-800 border-y py-6"
      onSubmit={handleSubmit}
    >
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
        className="h-11 w-fit bg-[#c8ff00] px-5 text-black hover:bg-[#b7eb00]"
        disabled={isSubmitting}
        type="submit"
      >
        {isSubmitting ? "Wird erstellt…" : "Markt erstellen"}
      </Button>
    </form>
  );
}
