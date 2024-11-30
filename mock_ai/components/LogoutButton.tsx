"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/supabase/client";
import { Button, ButtonProps } from "@/components/ui/Button";

interface LogoutButtonProps extends ButtonProps {}

export function LogoutButton({
  size,
  className,
  variant = "logout",
  ...props
}: LogoutButtonProps) {
  const supabase = createClient();
  const router = useRouter();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/auth/signout");
    router.refresh();
  }

  return (
    <div>
      <form action="/auth/signout" method="post">
        <Button
          variant={variant}
          size={size}
          className={`text-[#ff6db3] border-[#ff6db3] hover:bg-[#e888b7] rounded-md px-3 py-2 transition-colors ${className}`}
          onClick={handleLogout}
          {...props}
        >
          Sign out
        </Button>
      </form>
    </div>
  );
}
