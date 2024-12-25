"use client";
import { Laptop, Brain, Clock, Target } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui";
import Link from "next/link";

const features = [
  {
    icon: <Brain className="h-6 w-6 stroke-pink-400" />,
    title: "AI-Powered Feedback",
    description:
      "Gain a competitive edge with instant, in-depth feedback on your answers, tone, and delivery, pinpointing areas for improvement.",
  },
  {
    icon: <Target className="h-6 w-6 stroke-red-500" />,
    title: "Role-Specific Practice",
    description:
      "Master your target industry with interview questions tailored to your desired role and experience level, ensuring you're prepared for anything.",
  },
  {
    icon: <Laptop className="h-6 w-6 stroke-emerald-600" />,
    title: "Real-Time Analysis (Coming Soon)",
    description:
      "Refine your communication skills with instant analysis of your verbal and non-verbal cues, helping you project confidence and make a lasting impression.",
  },
  {
    icon: <Clock className="h-6 w-6 stroke-blue-500" />,
    title: "Flexible Practice",
    description:
      "Practice on your own terms, anytime, anywhere. Fit interview prep seamlessly into your busy schedule and learn at your own pace.",
  },
];

export default function Features() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Land Your Dream Job with MockAI
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            MockAI empowers you to conquer your interviews. Our
            AI-powered platform delivers tailored feedback, actionable
            recommendations, and industry-specific practice scenarios,
            giving you the confidence and skills to impress any hiring
            manager.
          </p>
          <Button
            asChild
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 m-2"
          >
            <Link href="/interview">Try MockAI for Free</Link>
          </Button>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 text-primary">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">
                {feature.title}
              </h3>
              <p className="text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
