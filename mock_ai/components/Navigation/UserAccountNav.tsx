import React from "react";
import { FaUser } from "react-icons/fa6";

import { createClient } from "@/supabase/server";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SignInButton } from "@/components/SigninButton";
import { LogoutButton } from "../LogoutButton";
import { Avatar, AvatarImage, AvatarFallback } from "../ui";
import Link from "next/link";

export async function UserAccountNav() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <SignInButton />;
  }

  return (
    <div className="w-max space-x-2 bg-[#8a7b96]">
      <DropdownMenu className="bg-[#8a7b96]">
        <DropdownMenuTrigger className="flex items-center space-x-1">
          <div className="bg-border grid size-7 place-items-center rounded-full">
            {user ? (
              <Avatar>
                <AvatarImage
                  src={user.user_metadata.avatar_url}
                  alt={user.user_metadata.full_name || "User Avatar"}
                />
                <AvatarFallback>
                  <FaUser className="text-muted-foreground" />
                </AvatarFallback>
              </Avatar>
            ) : (
              <FaUser className="text-muted-foreground" />
            )}
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <div className="flex items-center justify-start gap-2 p-2">
            <div className="flex flex-col space-y-1 leading-none">
              {user.email && (
                <p className="text-muted-foreground w-[200px] truncate text-sm ">
                  {user.email}
                </p>
              )}
            </div>
          </div>
          <DropdownMenuItem asChild className="cursor-pointer">
            <Link
              href="/user_account"
              className="rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:text-secondary-foreground/80 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 p-2 transition-colors"
            >
              Account
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild className="cursor-pointer">
            <LogoutButton variant="logout" className="bg-[#4A2B6A]" />
          </DropdownMenuItem>

          <DropdownMenuSeparator />
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
