"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/supabase/client";
import { Button, CardHeader } from "@/components/ui";
import { Card } from "@/components/ui";
import { Icons } from "@/components/ui/icons";
import { toast } from "@/hooks/useToast";
import {
  CardContent,
  CardDescription,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";

function SignInForm() {
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
    <Card className="flex flex-col items-center justify-center h-screen">
      <CardHeader>
        <CardTitle>Sign In</CardTitle>
      </CardHeader>
      <CardContent>
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
          <CardDescription>Sign in with Google</CardDescription>
        </Button>
      </CardContent>
      <CardFooter>
        <CardDescription>
          Sign in to access your account
        </CardDescription>
      </CardFooter>
    </Card>
  );
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <Icons.loaderCircle className="mr-2 size-4 animate-spin" />
      }
    >
      <SignInForm />
    </Suspense>
  );
}
