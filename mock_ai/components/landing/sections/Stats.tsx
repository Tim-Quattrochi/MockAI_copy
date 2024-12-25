"use client";
import { motion } from "framer-motion";
const stats = [
  { number: "200+", label: "Help Us Reach 200+ Practice Interviews" },
  { number: "∞", label: "Refine Your Delivery, Continuously" },
  { number: "24/7", label: "AI-Powered Practice, Anytime, Anywhere" },
];

export default function Stats() {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-3 md:grid-cols-3 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="text-center"
            >
              <div className="text-4xl font-bold text-primary mb-2">
                {stat.number}
              </div>
              <div className="text-gray-600">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
