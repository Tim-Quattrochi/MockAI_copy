"use client";
import { Button } from "@/components/ui/Button";
import { motion } from "framer-motion";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative bg-gradient-to-b from-gray-900 to-gray-800 text-white py-20 lg:py-32">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400"
          >
            Master Your Interview Skills with AI
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-300 mb-8"
          >
            Practice with our AI interviewer and get instant feedback
            to land your dream job.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button
              asChild
              size="lg"
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Link href="/interview">Start Free Practice</Link>
            </Button>

            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-gray-300 text-gray-300 hover:bg-gray-800"
            >
              <Link href="/about">Learn More (coming soon)</Link>
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
