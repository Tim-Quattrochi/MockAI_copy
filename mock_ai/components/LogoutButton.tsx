"use client";

import { useRouter } from "next/navigation";

import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/Button";

export function LogoutButton() {
  const supabase = createClient();
  const router = useRouter();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/signin");
    router.refresh();
  }

  return (
    <Button
      variant="logout"
      className="w-full text-muted-foreground hover:text-white hover:bg-[#FFC857] rounded-md px-3 py-2 transition-colors"
      onClick={handleLogout}
    >
      Sign out
    </Button>
  );
}
