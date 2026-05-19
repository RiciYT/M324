import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/button";
import { Input } from "@/components/input";
import { Label } from "@/components/label";
import { apiClient, type MarketSide } from "@/lib/api-client";

interface BetFormProps {
  marketId: string;
}

export function BetForm({ marketId }: BetFormProps) {
  const [amount, setAmount] = useState("50");
  const [side, setSide] = useState<MarketSide>("yes");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      await apiClient.placeBet({
        amount: Number(amount),
        marketId,
        side,
      });
      toast.success("Wette platziert");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Wette konnte nicht platziert werden"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <div className="grid grid-cols-2 gap-2">
        <Button
          aria-pressed={side === "yes"}
          className={
            side === "yes"
              ? "h-11 rounded-[6px] bg-[#c8ff00] font-black text-black uppercase hover:bg-[#c8ff00]/90"
              : "h-11 rounded-[6px] border-zinc-700 bg-black/20 font-black text-zinc-200 uppercase hover:bg-zinc-900"
          }
          onClick={() => setSide("yes")}
          type="button"
          variant={side === "yes" ? "default" : "outline"}
        >
          Ja
        </Button>
        <Button
          aria-pressed={side === "no"}
          className={
            side === "no"
              ? "h-11 rounded-[6px] bg-destructive font-black text-white uppercase hover:bg-destructive/90"
              : "h-11 rounded-[6px] border-zinc-700 bg-black/20 font-black text-zinc-200 uppercase hover:bg-zinc-900"
          }
          onClick={() => setSide("no")}
          type="button"
          variant={side === "no" ? "default" : "outline"}
        >
          Nein
        </Button>
      </div>

      <div className="flex flex-col gap-2">
        <Label className="text-zinc-400" htmlFor="bet-amount">
          Einsatz
        </Label>
        <Input
          className="h-11 rounded-[6px] border-zinc-700 bg-black/30 font-mono text-zinc-100"
          id="bet-amount"
          min="1"
          onChange={(event) => setAmount(event.target.value)}
          type="number"
          value={amount}
        />
      </div>

      <Button
        className="h-11 rounded-[6px] bg-[#c8ff00] font-black text-black uppercase hover:bg-[#c8ff00]/90"
        disabled={isSubmitting}
        type="submit"
      >
        {isSubmitting ? "Wird gesetzt..." : "Wette setzen"}
      </Button>
    </form>
  );
}
