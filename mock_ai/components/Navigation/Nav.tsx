import { NavItem } from "./NavItem";
import { UserAccountNav } from "./UserAccountNav";
export default function Nav() {
  return (
    <nav className="ml-auto flex gap-4 sm:gap-6">
      <NavItem href="/tips">Tips</NavItem>
      <NavItem href="/about">About</NavItem>
      <UserAccountNav />
    </nav>
  );
}
