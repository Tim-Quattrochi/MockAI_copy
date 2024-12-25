import { User, CircleUser } from "lucide-react";
import { createClient } from "@/supabase/server";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { SignInButton } from "@/components/SigninButton";
import { LogoutButton } from "../LogoutButton";
import { Button } from "../ui";
import { Avatar, AvatarImage, AvatarFallback } from "../ui";
import Link from "next/link";

export async function UserAccountNav() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="m-2">
        <SignInButton />
      </div>
    );
  }

  async function handleSignout() {
    try {
      const res = await supabase.auth.signOut();
      if (res.error) {
        console.log(res.error);
      }
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-8 w-8 rounded-full"
        >
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={user.user_metadata.avatar_url}
              alt={user.user_metadata.full_name || "User Avatar"}
            />
            <AvatarFallback className="bg-primary/10">
              <CircleUser className="h-w w-4 text-primary" />
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {user.user_metadata.full_name}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link href="/user_account" className="flex items-start">
            <User className="mr-2 h-4 w-4" />
            Account
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          asChild
          className="w-full text-red-600 focus:bg-red-50 focus:text-red-600"
        >
          <LogoutButton className="flex items-center" />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
