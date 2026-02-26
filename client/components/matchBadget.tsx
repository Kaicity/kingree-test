"use client";

import { motion } from "framer-motion";

export default function MatchBadge() {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 15 }}
      className="px-3 py-2 bg-pink-400 text-white text-sm font-semibold rounded-full shadow-lg"
    >
      💖 It&apos;s a Match!
    </motion.div>
  );
}
