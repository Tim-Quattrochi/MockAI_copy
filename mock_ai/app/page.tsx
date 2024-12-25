import { Features, Hero, Stats } from "@/components/landing/sections";

export default function Home() {
  return (
    <main className="flex-1">
      <Hero />
      <Stats />
      <Features />
    </main>
  );
}
