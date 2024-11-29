import Link from "next/link";
import Image from "next/image";
import Nav from "./Navigation/Nav";

const Header = () => {
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
      <Nav />
    </header>
  );
};

export default Header;
