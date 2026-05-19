import { toast } from "sonner";

import { Button } from "@/components/button";
import { authClient } from "@/lib/auth-client";
import { createBrowserAuthRedirectUrls } from "@/lib/auth-redirects";

export function GoogleAuthButton() {
  const handleGoogleSignIn = async () => {
    const { error } = await authClient.signIn.social({
      provider: "google",
      ...createBrowserAuthRedirectUrls(),
    });

    if (error) {
      toast.error(error.message || error.statusText);
    }
  };

  return (
    <Button
      className="w-full gap-2"
      onClick={handleGoogleSignIn}
      type="button"
      variant="outline"
    >
      <span aria-hidden="true" className="font-semibold text-base">
        G
      </span>
      Mit Google fortfahren
    </Button>
  );
}
