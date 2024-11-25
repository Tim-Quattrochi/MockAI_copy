"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui";

import { Icons } from "@/components/ui/icons";
import { toast } from "@/hooks/useToast";

export default function SignInPage() {
  const [isGoogleLoading, setIsGoogleLoading] =
    useState<boolean>(false);
  const supabase = createClient();

  const searchParams = useSearchParams();

  const next = searchParams.get("next");

  async function signInWithGoogle() {
    setIsGoogleLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback${
            next ? `?next=${encodeURIComponent(next)}` : ""
          }`,
        },
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      toast({
        title: "Please try again.",
        description: "There was an error logging in with Google.",
        variant: "destructive",
      });
      setIsGoogleLoading(false);
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      onClick={signInWithGoogle}
      disabled={isGoogleLoading}
    >
      {isGoogleLoading ? (
        <Icons.loaderCircle className="mr-2 size-4 animate-spin" />
      ) : (
        <Icons.google className="mr-2 size-6" />
      )}{" "}
      Sign in with Google
    </Button>
  );
}
