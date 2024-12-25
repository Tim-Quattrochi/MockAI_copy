"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/Button";
import { LogIn } from "lucide-react";

export function SignInButton() {
  const pathname = usePathname();

  if (pathname === "/auth/signin") {
    return null;
  }

  return (
    <Link href="/auth/signin">
      <Button
        variant="signin"
        size="sm"
        className={cn(
          "group relative overflow-hidden transition-all duration-300",
          "bg-gradient-to-r from-[#FFC857] to-[#FFB627]",
          "hover:from-[#FFB627] hover:to-[#FFC857]",
          "text-[#0A0B2E] font-medium",
          "shadow-md hover:shadow-lg",
          "transform hover:-translate-y-0.5"
        )}
      >
        <LogIn className="mr-2 h-4 w-4 transition-transform group-hover:scale-110" />
        <span className="relative z-10">Sign in</span>
      </Button>
    </Link>
  );
}
