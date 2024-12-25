import { NavItem } from "./NavItem";
import { UserAccountNav } from "./UserAccountNav";
export default function Nav() {
  return (
    <nav className="flex items-center gap-6 text-sm flex-1">
      <NavItem href="/tips">Tips</NavItem>
      <NavItem href="/about">About</NavItem>
      <div className="ml-auto">
        <UserAccountNav />
      </div>
    </nav>
  );
}
