// UserAccount.server.tsx
import { handleGetallResults } from "./actions";
import { createClient } from "@/supabase/server";
import { UserResponse, User } from "@supabase/supabase-js";
import UserAccountClient from "@/components/UserAccount";
import { JoinedInterviewResult } from "@/types";

export default async function UserAccount() {
  const supabase = await createClient();
  const { data: user, error }: UserResponse =
    await supabase.auth.getUser();

  const userInfo: User = user?.user!;

  let fullUserHistory: JoinedInterviewResult[] | [] = [];
  if (userInfo?.id && !error) {
    fullUserHistory = await handleGetallResults(userInfo?.id);
  }

  const resultsPerPage = 5;

  return (
    <UserAccountClient
      fullUserHistory={fullUserHistory}
      resultsPerPage={resultsPerPage}
      userError={error}
      user={userInfo}
    />
  );
}
