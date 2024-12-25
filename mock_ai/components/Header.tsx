import Link from "next/link";
import Image from "next/image";
import Nav from "./Navigation/Nav";

const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <Link className="flex items-center justify-center" href="/">
          <Image
            className="rounded-2xl shadow-lg  w-14 z-10 m-1"
            src="/mockAILogo.jpeg"
            alt="Mockai Logo"
            priority={true}
            width={32}
            height={32}
          />
          <span className="sr-only">Mockai</span>
        </Link>
        <Nav />
      </div>
    </header>
  );
};

export default Header;
