"use client";
import Link from "next/link";
import Image from "next/image";
import { useUser } from "@auth0/nextjs-auth0/client";

const Header = () => {
  const { user } = useUser();

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
            <a
              className="text-sm font-medium hover:text-[#ff3b9a] transition-colors"
              href="/api/auth/logout"
            >
              Logout
            </a>
          </>
        ) : (
          <a
            className="text-sm font-medium hover:text-[#ff3b9a] transition-colors"
            href="/api/auth/login"
          >
            Login
          </a>
        )}
      </nav>
    </header>
  );
};

export default Header;
