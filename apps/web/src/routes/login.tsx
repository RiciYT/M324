import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import SignInForm from "@/components/sign-in-form";
import SignUpForm from "@/components/sign-up-form";

export const Route = createFileRoute("/login")({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>) => ({
    mode: search.mode === "signin" ? "signin" : "signup",
  }),
});

function RouteComponent() {
  const { mode } = Route.useSearch();
  const [showSignIn, setShowSignIn] = useState(mode === "signin");

  return showSignIn ? (
    <SignInForm onSwitchToSignUp={() => setShowSignIn(false)} />
  ) : (
    <SignUpForm onSwitchToSignIn={() => setShowSignIn(true)} />
  );
}
