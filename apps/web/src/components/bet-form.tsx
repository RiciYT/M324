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
      toast.success("Mock bet placed");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not place bet"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <div className="grid grid-cols-2 gap-2">
        <Button
          onClick={() => setSide("yes")}
          type="button"
          variant={side === "yes" ? "default" : "outline"}
        >
          YES
        </Button>
        <Button
          onClick={() => setSide("no")}
          type="button"
          variant={side === "no" ? "default" : "outline"}
        >
          NO
        </Button>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="bet-amount">Amount</Label>
        <Input
          id="bet-amount"
          min="1"
          onChange={(event) => setAmount(event.target.value)}
          type="number"
          value={amount}
        />
      </div>

      <Button disabled={isSubmitting} type="submit">
        {isSubmitting ? "Placing..." : "Place mock bet"}
      </Button>
    </form>
  );
}
