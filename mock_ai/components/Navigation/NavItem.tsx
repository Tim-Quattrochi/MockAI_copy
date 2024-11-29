"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

type NavItemProps = {
  href: string;
  children: React.ReactNode;
};

export function NavItem({ href, children }: NavItemProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={cn(
        "text-sm font-medium hover:text-[#ff3b9a] transition-colors px-2 py-1",
        {
          "text-[#FFC857] font-semibold underline decoration-2 underline-offset-4 bg-[#FFC857]/20 rounded-md  transition-all duration-300 ease-in-out":
            isActive,
        }
      )}
    >
      {children}
    </Link>
  );
}
