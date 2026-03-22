"use client";

import { motion } from "framer-motion";

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-950 via-lime-950 to-slate-950 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-green-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-lime-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 right-1/3 w-96 h-96 bg-lime-500/10 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 py-6 px-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-lime-600 flex items-center justify-center shadow-lg shadow-green-500/25"
          >
            <span className="text-white font-bold text-lg">D</span>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-xl font-bold bg-gradient-to-r from-green-300 to-lime-300 bg-clip-text text-transparent">
              Desbrava.Ai
            </h1>
            <p className="text-xs text-green-400/60">
              Seu plano de carreira inteligente
            </p>
          </motion.div>
        </div>
      </header>

      {/* Content */}
      <main className="relative z-10 px-4 pb-12">{children}</main>
    </div>
  );
}
