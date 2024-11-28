import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

const supabase = createClient();

export function useLogout(revalidate: () => void) {
  const router = useRouter();

  const logout = async () => {
    await supabase.auth.signOut();
    revalidate();
    router.push("/signin");
    router.refresh();
  };

  return logout;
}
