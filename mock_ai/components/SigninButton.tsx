"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/Button";
import { LogIn } from "lucide-react";

export function SignInButton() {
  const pathname = usePathname();

  return pathname !== "/signin" ? (
    <Link
      href="/signin"
      className={cn(
        buttonVariants({ variant: "signin", size: "sm" })
      )}
    >
      <LogIn className="mr-2 size-3.5" />
      Sign in
    </Link>
  ) : null;
}
