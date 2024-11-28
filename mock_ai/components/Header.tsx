"use client";
import Link from "next/link";
import Image from "next/image";
import { useUser } from "@/hooks/useUser";
import { useRouter } from "next/navigation";
import NavItem from "@/components/NavItem";
import { Button } from "./ui";

import { createClient } from "@/utils/supabase/client";

const Header = () => {
  const { loading, error, user, role, revalidate } = useUser();

  const supabase = createClient();
  const router = useRouter();

  async function handleLogout() {
    await supabase.auth.signOut();
    revalidate();
    router.push("/signin");
    router.refresh();
  }

  return (
    <header className="px-4 lg:px-6  flex items-center">
      <Link className="flex items-center justify-center" href="/">
        <Image
          className="rounded-lg shadow-lg bg-white z-10 m-1 w-auto h-auto sm:w-24 sm:h-20"
          src="/mockAILogo.jpeg"
          alt="Mockai Logo"
          priority={true}
          width={80}
          height={65}
        />
        <span className="sr-only">Mockai</span>
      </Link>
      <nav className="ml-auto flex gap-4 sm:gap-6">
        <Link
          className="text-sm font-medium hover:text-[#ff3b9a] transition-colors"
          href="/tips"
        >
          Tips
        </Link>
        <Link
          className="text-sm font-medium hover:text-[#ff3b9a] transition-colors"
          href="/about"
        >
          About
        </Link>
        {user ? (
          <>
            <Link
              className="text-sm font-medium hover:text-[#ff3b9a] transition-colors"
              href="/user_account"
            >
              Account
            </Link>
            <Link
              className="text-sm font-medium hover:text-[#ff3b9a] transition-colors cursor-pointer"
              onClick={() => handleLogout()}
              href="/"
            >
              Logout
            </Link>
          </>
        ) : (
          <Link
            className="text-sm font-medium hover:text-[#ff3b9a] transition-colors"
            href="/signin"
          >
            Login
          </Link>
        )}
      </nav>
    </header>
  );
};

export default Header;
