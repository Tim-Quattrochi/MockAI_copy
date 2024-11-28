import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

const supabase = createClient();

export async function handleLogout(revalidate: () => void) {
  const router = useRouter();
  await supabase.auth.signOut();
  revalidate();
  router.push("/signin");
  router.refresh();
}
