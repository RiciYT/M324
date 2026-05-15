import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/card";
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
        closesAt,
      });
      toast.success("Mock market created");
      setTitle("");
      setDescription("");
      setClosesAt("");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not create market"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Market</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2">
            <Label htmlFor="market-title">Title</Label>
            <Input
              id="market-title"
              onChange={(event) => setTitle(event.target.value)}
              required
              value={title}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="market-description">Description</Label>
            <Input
              id="market-description"
              onChange={(event) => setDescription(event.target.value)}
              required
              value={description}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="market-closes-at">Closes at</Label>
            <Input
              id="market-closes-at"
              onChange={(event) => setClosesAt(event.target.value)}
              required
              type="datetime-local"
              value={closesAt}
            />
          </div>
          <Button disabled={isSubmitting} type="submit">
            {isSubmitting ? "Creating..." : "Create mock market"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
