"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Icons } from "./ui/icons";
import {
  Card,
  CardContent,
  CardTitle,
  CardHeader,
  CardDescription,
} from "@/components/ui/card";

export function LoginCard({
  onGoogleSignIn,
}: {
  onGoogleSignIn: () => void;
}) {
  const [error, setError] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  async function handleSigninWithGoogle() {
    setIsLoading(true);
    try {
      await onGoogleSignIn();
    } catch (error) {
      console.log("error signing in with Google: ", error);
      setError({ google: "Failed to sign in with Google" });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto overflow-hidden shadow-xl">
      <div className="bg-black p-8">
        <CardHeader className="text-center p-0">
          <CardTitle className="text-3xl font-normal mb-2 text-white">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-white/90 text-lg">
            Sign in to continue to Mock Interview AI
          </CardDescription>
        </CardHeader>
      </div>
      <CardContent className="p-6 bg-card">
        <Button
          type="button"
          variant="outline"
          className="w-full bg-white hover:bg-gray-50 text-gray-600 font-normal py-6 px-4 border border-gray-300 rounded-md shadow-sm transition-all duration-200 ease-in-out"
          onClick={handleSigninWithGoogle}
          disabled={isLoading}
        >
          {isLoading ? (
            <Icons.loaderCircle className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Icons.google className="mr-2 h-5 w-5" />
          )}
          <span>
            {isLoading ? "Signing in..." : "Sign in with Google"}
          </span>
        </Button>
      </CardContent>
    </Card>
  );
}
