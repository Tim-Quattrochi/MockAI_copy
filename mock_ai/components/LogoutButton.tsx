"use client";

import { Button, ButtonProps } from "@/components/ui/Button";
import { LogOut } from "lucide-react";

interface LogoutButtonProps extends ButtonProps {
  showIcon?: boolean;
}

export function LogoutButton({
  size,
  className,
  variant = "ghost",
  showIcon = true,
  ...props
}: LogoutButtonProps) {
  return (
    <form action="/auth/signout" method="post">
      <Button
        variant={variant}
        size={size}
        type="submit"
        className={`text-red-600 hover:text-red-700 hover:bg-red-50 ${className}`}
        {...props}
      >
        {showIcon && <LogOut className="mr-2 h-4 w-4" />}Sign out
      </Button>
    </form>
  );
}
