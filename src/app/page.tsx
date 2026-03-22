"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  Brain,
  Target,
  BookOpen,
  TrendingUp,
  Compass,
  Sparkles,
  ArrowRight,
  User,
  ClipboardCheck,
  Route,
  BarChart3,
  Fingerprint,
  Heart,
  Layers,
  Star,
  Zap,
  Menu,
  X,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

/* ------------------------------------------------------------------ */
/*  Animation variants                                                 */
/* ------------------------------------------------------------------ */

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 },
};

const fadeInDown = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0 },
};

const fadeInLeft = {
  hidden: { opacity: 0, x: -40 },
  visible: { opacity: 1, x: 0 },
};

const fadeInRight = {
  hidden: { opacity: 0, x: 40 },
  visible: { opacity: 1, x: 0 },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1 },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12 },
  },
};

const staggerSlow = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 },
  },
};

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const features = [
  {
    icon: Brain,
    title: "Assessments de Autoconhecimento",
    description:
      "Descubra suas fortalezas, valores e estilo de trabalho com assessments baseados em ciência comportamental e IA.",
    gradient: "from-green-500 to-lime-500",
    accent: "purple",
  },
  {
    icon: Target,
    title: "PDI Personalizado com IA",
    description:
      "Receba um Plano de Desenvolvimento Individual criado sob medida para seus objetivos e realidade profissional.",
    gradient: "from-lime-500 to-blue-500",
    accent: "indigo",
  },
  {
    icon: BookOpen,
    title: "Curadoria Inteligente de Cursos",
    description:
      "Acesse recomendações de cursos, livros e conteúdos selecionados por IA para acelerar seu crescimento.",
    gradient: "from-lime-500 to-green-500",
    accent: "violet",
  },
  {
    icon: TrendingUp,
    title: "Acompanhamento e Evolução",
    description:
      "Monitore seu progresso com check-ins regulares e ajuste seu plano dinamicamente conforme evolui.",
    gradient: "from-fuchsia-500 to-lime-500",
    accent: "fuchsia",
  },
];

const steps = [
  {
    icon: User,
    label: "Cadastro",
    description: "Crie sua conta e conte-nos sobre seus objetivos",
  },
  {
    icon: ClipboardCheck,
    label: "Assessments",
    description: "Complete avaliações de autoconhecimento",
  },
  {
    icon: Compass,
    label: "Perfil Consolidado",
    description: "Receba seu perfil comportamental completo",
  },
  {
    icon: Route,
    label: "PDI Gerado",
    description: "Obtenha seu plano personalizado com IA",
  },
  {
    icon: BarChart3,
    label: "Acompanhamento",
    description: "Evolua com check-ins e ajustes contínuos",
  },
];

const assessments = [
  {
    icon: Fingerprint,
    name: "MBTI",
    description: "Descubra seu tipo de personalidade entre 16 perfis únicos baseados em preferências cognitivas.",
    questions: 20,
    color: "from-green-500 to-lime-500",
    detail: "Introversão vs Extroversão, Intuição vs Sensação, Pensamento vs Sentimento, Julgamento vs Percepção",
  },
  {
    icon: Layers,
    name: "Big Five",
    description: "Avalie cinco dimensões fundamentais da sua personalidade com base em pesquisa científica.",
    questions: 25,
    color: "from-lime-500 to-blue-500",
    detail: "Abertura, Conscienciosidade, Extroversão, Amabilidade, Neuroticismo",
  },
  {
    icon: Target,
    name: "DISC",
    description: "Entenda seu estilo comportamental no trabalho e como você se comunica com outros.",
    questions: 15,
    color: "from-lime-500 to-green-500",
    detail: "Dominância, Influência, Estabilidade, Conformidade",
  },
  {
    icon: Heart,
    name: "Ikigai",
    description: "Encontre a interseção entre paixão, missão, vocação e profissão.",
    questions: 18,
    color: "from-fuchsia-500 to-lime-500",
    detail: "O que você ama, o que o mundo precisa, pelo que pode ser pago, no que é bom",
  },
  {
    icon: Zap,
    name: "Flow",
    description: "Identifique as condições e atividades que te colocam em estado de fluxo máximo.",
    questions: 12,
    color: "from-green-600 to-fuchsia-500",
    detail: "Desafio vs Habilidade, Foco, Feedback, Controle",
  },
];

const floatingBadges = [
  { label: "MBTI", x: "10%", y: "20%", delay: 0, duration: 6 },
  { label: "Big Five", x: "85%", y: "15%", delay: 1, duration: 7 },
  { label: "DISC", x: "80%", y: "70%", delay: 2, duration: 5.5 },
  { label: "Ikigai", x: "5%", y: "65%", delay: 0.5, duration: 6.5 },
  { label: "Flow", x: "75%", y: "42%", delay: 1.5, duration: 5 },
];

/* ------------------------------------------------------------------ */
/*  Keyframe styles (injected via style tag)                           */
/* ------------------------------------------------------------------ */

const keyframeStyles = `
@keyframes blob-1 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  25% { transform: translate(30px, -50px) scale(1.1); }
  50% { transform: translate(-20px, 20px) scale(0.95); }
  75% { transform: translate(50px, 30px) scale(1.05); }
}
@keyframes blob-2 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  25% { transform: translate(-40px, 30px) scale(1.05); }
  50% { transform: translate(30px, -40px) scale(1.1); }
  75% { transform: translate(-20px, -20px) scale(0.95); }
}
@keyframes blob-3 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(40px, -30px) scale(1.08); }
  66% { transform: translate(-30px, 40px) scale(0.92); }
}
@keyframes gradient-shift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(3deg); }
}
@keyframes float-reverse {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(15px) rotate(-2deg); }
}
@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 20px rgba(139, 92, 246, 0.3); }
  50% { box-shadow: 0 0 40px rgba(139, 92, 246, 0.6), 0 0 80px rgba(139, 92, 246, 0.2); }
}
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
@keyframes particle-float {
  0%, 100% { transform: translateY(0) translateX(0) scale(1); opacity: 0.6; }
  25% { transform: translateY(-30px) translateX(10px) scale(1.2); opacity: 1; }
  50% { transform: translateY(-15px) translateX(-15px) scale(0.8); opacity: 0.4; }
  75% { transform: translateY(-40px) translateX(5px) scale(1.1); opacity: 0.8; }
}
@keyframes grid-pulse {
  0%, 100% { opacity: 0.03; }
  50% { opacity: 0.06; }
}
@keyframes timeline-draw {
  0% { width: 0%; }
  100% { width: 100%; }
}
`;

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      <style dangerouslySetInnerHTML={{ __html: keyframeStyles }} />

      {/* ============================================================ */}
      {/* NAVBAR                                                        */}
      {/* ============================================================ */}
      <nav className="fixed top-0 z-50 w-full border-b border-white/[0.06] bg-background/50 backdrop-blur-2xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <Image src="/logo.png" alt="Destrava.Ai" width={260} height={62} className="h-14 w-auto" />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#recursos" className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200">
              Recursos
            </a>
            <a href="#como-funciona" className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200">
              Como Funciona
            </a>
            <a href="#assessments" className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200">
              Assessments
            </a>
          </div>

          {/* Desktop Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                Login
              </Button>
            </Link>
            <Link href="/onboarding">
              <Button
                size="sm"
                className="bg-gradient-to-r from-green-600 to-lime-600 hover:from-green-500 hover:to-lime-500 shadow-lg shadow-green-500/20 transition-all duration-300 hover:shadow-green-500/40 hover:scale-105"
              >
                Começar Grátis
              </Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-muted-foreground hover:text-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-white/[0.06] bg-background/95 backdrop-blur-2xl"
          >
            <div className="flex flex-col gap-4 p-6">
              <a href="#recursos" className="text-sm text-muted-foreground hover:text-foreground" onClick={() => setMobileMenuOpen(false)}>Recursos</a>
              <a href="#como-funciona" className="text-sm text-muted-foreground hover:text-foreground" onClick={() => setMobileMenuOpen(false)}>Como Funciona</a>
              <a href="#assessments" className="text-sm text-muted-foreground hover:text-foreground" onClick={() => setMobileMenuOpen(false)}>Assessments</a>
              <div className="flex gap-3 pt-2">
                <Link href="/login" className="flex-1">
                  <Button variant="outline" size="sm" className="w-full border-white/10">Login</Button>
                </Link>
                <Link href="/onboarding" className="flex-1">
                  <Button size="sm" className="w-full bg-gradient-to-r from-green-600 to-lime-600">Começar Grátis</Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </nav>

      {/* ============================================================ */}
      {/* HERO SECTION                                                  */}
      {/* ============================================================ */}
      <section className="relative flex min-h-screen items-center justify-center px-6 pt-16 overflow-hidden">
        {/* Animated background orbs */}
        <div className="pointer-events-none absolute inset-0">
          <div
            className="absolute top-[15%] left-[20%] h-[500px] w-[500px] rounded-full bg-green-600/20 blur-[100px]"
            style={{ animation: "blob-1 12s ease-in-out infinite" }}
          />
          <div
            className="absolute top-[30%] right-[15%] h-[400px] w-[400px] rounded-full bg-lime-600/25 blur-[100px]"
            style={{ animation: "blob-2 15s ease-in-out infinite" }}
          />
          <div
            className="absolute bottom-[20%] left-[40%] h-[350px] w-[350px] rounded-full bg-lime-600/15 blur-[100px]"
            style={{ animation: "blob-3 10s ease-in-out infinite" }}
          />
          <div
            className="absolute top-[60%] left-[10%] h-[250px] w-[250px] rounded-full bg-fuchsia-600/10 blur-[80px]"
            style={{ animation: "blob-2 18s ease-in-out infinite" }}
          />
        </div>

        {/* Animated grid overlay */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle, rgba(139, 92, 246, 0.15) 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
            animation: "grid-pulse 4s ease-in-out infinite",
          }}
        />

        {/* Gradient top edge */}
        <div className="pointer-events-none absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-green-500/50 to-transparent" />

        {/* Floating assessment badges */}
        <div className="pointer-events-none absolute inset-0 hidden lg:block">
          {floatingBadges.map((badge) => (
            <motion.div
              key={badge.label}
              className="absolute"
              style={{ left: badge.x, top: badge.y }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: badge.delay + 0.8, duration: 0.6, type: "spring" }}
            >
              <div
                className="px-4 py-2 rounded-xl border border-white/10 bg-white/[0.04] backdrop-blur-md text-sm font-medium text-green-300/80 shadow-lg shadow-green-500/5"
                style={{ animation: `float ${badge.duration}s ease-in-out infinite`, animationDelay: `${badge.delay}s` }}
              >
                {badge.label}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Hero content */}
        <div className="relative z-10 mx-auto max-w-5xl text-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="space-y-8"
          >
            {/* Badge */}
            <motion.div variants={fadeInDown} transition={{ duration: 0.6 }}>
              <Badge
                variant="outline"
                className="mx-auto border-green-500/30 bg-green-500/10 px-5 py-2 text-sm text-green-300 backdrop-blur-sm"
              >
                <Sparkles className="mr-2 h-3.5 w-3.5" />
                Plataforma de Desenvolvimento Pessoal com IA
              </Badge>
            </motion.div>

            {/* Title */}
            <motion.h1
              variants={fadeInUp}
              transition={{ duration: 0.7 }}
              className="text-5xl font-extrabold tracking-tight sm:text-7xl lg:text-8xl leading-[1.1]"
            >
              <span className="block bg-gradient-to-r from-white via-white to-white/80 bg-clip-text text-transparent">
                Descubra seu potencial.
              </span>
              <span className="block mt-2 bg-gradient-to-r from-green-400 via-lime-400 to-lime-400 bg-clip-text text-transparent"
                style={{
                  backgroundSize: "200% 100%",
                  animation: "gradient-shift 6s ease-in-out infinite",
                }}
              >
                Construa seu futuro.
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              variants={fadeInUp}
              transition={{ duration: 0.6 }}
              className="mx-auto max-w-2xl text-lg text-muted-foreground sm:text-xl leading-relaxed"
            >
              Sua jornada de desenvolvimento pessoal e profissional começa aqui.
              Assessments inteligentes, PDI personalizado e curadoria de
              conteúdos — tudo guiado por inteligência artificial.
            </motion.p>

            {/* CTA buttons */}
            <motion.div
              variants={fadeInUp}
              transition={{ duration: 0.6 }}
              className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center pt-2"
            >
              <Link href="/onboarding">
                <Button
                  size="lg"
                  className="group h-14 px-10 text-lg bg-gradient-to-r from-green-600 to-lime-600 hover:from-green-500 hover:to-lime-500 shadow-xl shadow-green-500/25 transition-all duration-300 hover:shadow-green-500/40 hover:scale-[1.02]"
                  style={{ animation: "pulse-glow 3s ease-in-out infinite" }}
                >
                  Começar Jornada
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1.5" />
                </Button>
              </Link>
              <a href="#recursos">
                <Button
                  variant="outline"
                  size="lg"
                  className="h-14 px-10 text-lg border-green-500/20 hover:border-green-500/40 hover:bg-green-500/10 transition-all duration-300"
                >
                  Saiba Mais
                </Button>
              </a>
            </motion.div>

            {/* Stats bar */}
            <motion.div
              variants={fadeInUp}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="pt-12"
            >
              <div className="mx-auto inline-flex flex-wrap justify-center gap-8 sm:gap-12 rounded-2xl border border-white/[0.06] bg-white/[0.02] px-8 py-5 backdrop-blur-sm">
                {[
                  { value: "5", label: "Assessments" },
                  { value: "IA", label: "Personalizada" },
                  { value: "PDI", label: "Completo" },
                ].map((stat) => (
                  <div key={stat.label} className="text-center">
                    <div className="text-2xl font-bold bg-gradient-to-r from-green-400 to-lime-400 bg-clip-text text-transparent">
                      {stat.value}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Bottom gradient fade */}
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* ============================================================ */}
      {/* FEATURES SECTION                                              */}
      {/* ============================================================ */}
      <section id="recursos" className="relative px-6 py-32">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-green-500/30 to-transparent" />
          <div
            className="absolute top-1/2 left-[60%] h-[400px] w-[400px] rounded-full bg-green-600/8 blur-[120px]"
            style={{ animation: "blob-1 20s ease-in-out infinite" }}
          />
        </div>

        <div className="mx-auto max-w-7xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="text-center mb-20"
          >
            <motion.div variants={fadeInUp} transition={{ duration: 0.5 }}>
              <Badge
                variant="outline"
                className="border-green-500/30 bg-green-500/10 px-4 py-1.5 text-sm text-green-300"
              >
                <Sparkles className="mr-2 h-3.5 w-3.5" />
                Recursos
              </Badge>
            </motion.div>
            <motion.h2
              variants={fadeInUp}
              transition={{ duration: 0.5 }}
              className="mt-8 text-3xl font-bold sm:text-5xl lg:text-6xl"
            >
              Tudo que você precisa para{" "}
              <span
                className="bg-gradient-to-r from-green-400 via-lime-400 to-lime-400 bg-clip-text text-transparent"
                style={{
                  backgroundSize: "200% 100%",
                  animation: "gradient-shift 5s ease-in-out infinite",
                }}
              >
                evoluir
              </span>
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              transition={{ duration: 0.5 }}
              className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed"
            >
              Uma plataforma completa que combina ciência comportamental e
              inteligência artificial para acelerar seu desenvolvimento.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
          >
            {features.map((feature) => (
              <motion.div
                key={feature.title}
                variants={fadeInUp}
                transition={{ duration: 0.5 }}
              >
                <Card className="group relative h-full overflow-hidden border-white/[0.06] bg-white/[0.02] backdrop-blur-sm transition-all duration-500 hover:border-green-500/30 hover:bg-white/[0.06] hover:shadow-2xl hover:shadow-green-500/10 hover:-translate-y-1">
                  <CardContent className="p-7 space-y-5">
                    {/* Icon */}
                    <div className="relative">
                      <div
                        className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.gradient} shadow-lg transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3`}
                      >
                        <feature.icon className="h-7 w-7 text-white" />
                      </div>
                      <div
                        className={`absolute inset-0 h-14 w-14 rounded-2xl bg-gradient-to-br ${feature.gradient} blur-xl opacity-0 transition-opacity duration-500 group-hover:opacity-40`}
                      />
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-semibold transition-colors duration-300 group-hover:text-white">
                      {feature.title}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>

                    {/* Animated accent line */}
                    <div className="h-0.5 w-0 bg-gradient-to-r from-green-500 to-lime-500 transition-all duration-500 group-hover:w-full rounded-full" />
                  </CardContent>

                  {/* Hover glow overlay */}
                  <div className="absolute inset-0 rounded-xl opacity-0 transition-opacity duration-500 group-hover:opacity-100 pointer-events-none bg-gradient-to-br from-green-500/[0.03] to-transparent" />
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* HOW IT WORKS                                                  */}
      {/* ============================================================ */}
      <section id="como-funciona" className="relative px-6 py-32">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-lime-500/30 to-transparent" />
          <div
            className="absolute bottom-[20%] right-[5%] h-[350px] w-[350px] rounded-full bg-lime-600/10 blur-[100px]"
            style={{ animation: "blob-2 16s ease-in-out infinite" }}
          />
          <div
            className="absolute top-[30%] left-[5%] h-[250px] w-[250px] rounded-full bg-green-600/8 blur-[80px]"
            style={{ animation: "blob-3 14s ease-in-out infinite" }}
          />
        </div>

        <div className="mx-auto max-w-6xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="text-center mb-20"
          >
            <motion.div variants={fadeInUp} transition={{ duration: 0.5 }}>
              <Badge
                variant="outline"
                className="border-lime-500/30 bg-lime-500/10 px-4 py-1.5 text-sm text-lime-300"
              >
                <Route className="mr-2 h-3.5 w-3.5" />
                Como funciona
              </Badge>
            </motion.div>
            <motion.h2
              variants={fadeInUp}
              transition={{ duration: 0.5 }}
              className="mt-8 text-3xl font-bold sm:text-5xl lg:text-6xl"
            >
              Sua jornada em{" "}
              <span
                className="bg-gradient-to-r from-lime-400 via-lime-400 to-green-400 bg-clip-text text-transparent"
                style={{
                  backgroundSize: "200% 100%",
                  animation: "gradient-shift 5s ease-in-out infinite",
                }}
              >
                5 passos
              </span>
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerSlow}
            className="relative"
          >
            {/* Connection line - desktop */}
            <div className="absolute top-14 left-[10%] right-[10%] hidden lg:block">
              <div className="h-[2px] w-full bg-gradient-to-r from-green-500/10 via-lime-500/20 to-green-500/10 rounded-full" />
              <motion.div
                className="absolute top-0 left-0 h-[2px] rounded-full bg-gradient-to-r from-green-500 via-lime-500 to-green-500"
                initial={{ width: "0%" }}
                whileInView={{ width: "100%" }}
                viewport={{ once: true }}
                transition={{ duration: 1.5, delay: 0.5, ease: "easeInOut" }}
              />
            </div>

            {/* Connection line - mobile */}
            <div className="absolute top-0 bottom-0 left-[28px] lg:hidden">
              <div className="h-full w-[2px] bg-gradient-to-b from-green-500/10 via-lime-500/20 to-green-500/10 rounded-full" />
            </div>

            <div className="grid gap-10 lg:grid-cols-5 lg:gap-6">
              {steps.map((step, index) => (
                <motion.div
                  key={step.label}
                  variants={fadeInUp}
                  transition={{ duration: 0.5, delay: index * 0.15 }}
                  className="relative flex lg:flex-col items-start lg:items-center text-left lg:text-center gap-5 lg:gap-0"
                >
                  {/* Step circle */}
                  <div className="relative z-10 flex-shrink-0">
                    <div className="relative flex h-[56px] w-[56px] lg:h-24 lg:w-24 items-center justify-center rounded-2xl border border-white/10 bg-background shadow-xl shadow-green-500/5 transition-all duration-300 hover:border-green-500/30 hover:shadow-green-500/20">
                      <div className="absolute -top-2 -right-2 flex h-6 w-6 lg:h-7 lg:w-7 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-lime-500 text-[10px] lg:text-xs font-bold text-white shadow-lg shadow-green-500/30">
                        {index + 1}
                      </div>
                      <step.icon className="h-6 w-6 lg:h-10 lg:w-10 text-primary" />
                    </div>
                  </div>
                  {/* Label */}
                  <div className="lg:mt-4">
                    <h3 className="text-base font-semibold">{step.label}</h3>
                    <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* ASSESSMENTS PREVIEW                                           */}
      {/* ============================================================ */}
      <section id="assessments" className="relative px-6 py-32">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-lime-500/30 to-transparent" />
          <div
            className="absolute top-[40%] left-[50%] -translate-x-1/2 h-[500px] w-[500px] rounded-full bg-lime-600/8 blur-[120px]"
            style={{ animation: "blob-1 18s ease-in-out infinite" }}
          />
        </div>

        <div className="mx-auto max-w-7xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="text-center mb-20"
          >
            <motion.div variants={fadeInUp} transition={{ duration: 0.5 }}>
              <Badge
                variant="outline"
                className="border-lime-500/30 bg-lime-500/10 px-4 py-1.5 text-sm text-lime-300"
              >
                <Brain className="mr-2 h-3.5 w-3.5" />
                Assessments
              </Badge>
            </motion.div>
            <motion.h2
              variants={fadeInUp}
              transition={{ duration: 0.5 }}
              className="mt-8 text-3xl font-bold sm:text-5xl lg:text-6xl"
            >
              Conheça os{" "}
              <span
                className="bg-gradient-to-r from-lime-400 via-green-400 to-fuchsia-400 bg-clip-text text-transparent"
                style={{
                  backgroundSize: "200% 100%",
                  animation: "gradient-shift 5s ease-in-out infinite",
                }}
              >
                assessments
              </span>
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              transition={{ duration: 0.5 }}
              className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed"
            >
              Cinco avaliações científicas para construir um mapa completo
              do seu perfil pessoal e profissional.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
          >
            {assessments.map((assessment) => (
              <motion.div
                key={assessment.name}
                variants={scaleIn}
                transition={{ duration: 0.5 }}
              >
                <Card className="group relative h-full overflow-hidden border-white/[0.06] bg-white/[0.02] backdrop-blur-sm transition-all duration-500 hover:border-transparent hover:-translate-y-2 hover:shadow-2xl hover:shadow-green-500/10">
                  {/* Gradient border on hover */}
                  <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${assessment.color} opacity-0 transition-opacity duration-500 group-hover:opacity-100 p-[1px]`}>
                    <div className="h-full w-full rounded-[11px] bg-background" />
                  </div>

                  <CardContent className="relative z-10 p-6 space-y-4">
                    {/* Icon */}
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${assessment.color} shadow-lg transition-all duration-500 group-hover:scale-110 group-hover:shadow-xl`}
                    >
                      <assessment.icon className="h-6 w-6 text-white" />
                    </div>

                    {/* Name */}
                    <h3 className="text-xl font-bold">{assessment.name}</h3>

                    {/* Description */}
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {assessment.description}
                    </p>

                    {/* Questions count */}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <ClipboardCheck className="h-3.5 w-3.5" />
                      <span>{assessment.questions} perguntas</span>
                    </div>

                    {/* Hidden detail on hover */}
                    <div className="overflow-hidden max-h-0 group-hover:max-h-24 transition-all duration-500 ease-in-out">
                      <div className="pt-3 border-t border-white/[0.06]">
                        <p className="text-xs text-green-300/70 leading-relaxed">
                          {assessment.detail}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* CTA SECTION                                                   */}
      {/* ============================================================ */}
      <section className="relative px-6 py-32">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-green-500/30 to-transparent" />
        </div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="mx-auto max-w-4xl text-center"
        >
          <motion.div
            variants={scaleIn}
            transition={{ duration: 0.7 }}
            className="relative overflow-hidden rounded-3xl border border-white/[0.08]"
          >
            {/* CTA gradient background */}
            <div
              className="absolute inset-0 bg-gradient-to-br from-green-900/80 via-lime-900/60 to-lime-900/80"
              style={{
                backgroundSize: "200% 200%",
                animation: "gradient-shift 8s ease-in-out infinite",
              }}
            />

            {/* Floating particles - deterministic positions to avoid hydration mismatch */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              {[
                { w: 2, l: 12, t: 8, o: 0.2, d: 6, dl: 0 },
                { w: 3, l: 35, t: 52, o: 0.3, d: 7, dl: 1 },
                { w: 1, l: 61, t: 22, o: 0.15, d: 5, dl: 2 },
                { w: 2, l: 85, t: 74, o: 0.25, d: 8, dl: 0.5 },
                { w: 3, l: 48, t: 90, o: 0.2, d: 6, dl: 3 },
                { w: 1, l: 93, t: 15, o: 0.3, d: 4, dl: 1.5 },
                { w: 2, l: 25, t: 65, o: 0.18, d: 7, dl: 2.5 },
                { w: 3, l: 70, t: 38, o: 0.22, d: 5, dl: 0.8 },
                { w: 1, l: 5, t: 45, o: 0.28, d: 6, dl: 3.5 },
                { w: 2, l: 55, t: 12, o: 0.15, d: 8, dl: 1.2 },
                { w: 3, l: 40, t: 80, o: 0.2, d: 5, dl: 2.8 },
                { w: 1, l: 78, t: 55, o: 0.25, d: 7, dl: 0.3 },
                { w: 2, l: 15, t: 30, o: 0.3, d: 6, dl: 1.8 },
                { w: 3, l: 88, t: 42, o: 0.18, d: 4, dl: 3.2 },
                { w: 1, l: 32, t: 95, o: 0.22, d: 7, dl: 0.6 },
                { w: 2, l: 65, t: 5, o: 0.15, d: 5, dl: 2.2 },
                { w: 3, l: 50, t: 60, o: 0.28, d: 8, dl: 1.4 },
                { w: 1, l: 20, t: 18, o: 0.2, d: 6, dl: 3.8 },
                { w: 2, l: 72, t: 85, o: 0.25, d: 5, dl: 0.9 },
                { w: 3, l: 95, t: 35, o: 0.18, d: 7, dl: 2.6 },
              ].map((p, i) => (
                <div
                  key={i}
                  className="absolute rounded-full bg-white"
                  style={{
                    width: `${p.w}px`,
                    height: `${p.w}px`,
                    left: `${p.l}%`,
                    top: `${p.t}%`,
                    opacity: p.o,
                    animation: `particle-float ${p.d}s ease-in-out infinite`,
                    animationDelay: `${p.dl}s`,
                  }}
                />
              ))}
              {/* Large glow spots */}
              <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-green-500/20 blur-[80px]" />
              <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-lime-500/20 blur-[80px]" />
            </div>

            {/* Content */}
            <div className="relative z-10 py-16 px-8 sm:py-20 sm:px-16 space-y-8">
              <motion.div
                variants={fadeInUp}
                transition={{ duration: 0.5 }}
              >
                <Star className="mx-auto h-12 w-12 text-green-300" style={{ animation: "float 4s ease-in-out infinite" }} />
              </motion.div>

              <motion.h2
                variants={fadeInUp}
                transition={{ duration: 0.5 }}
                className="text-3xl font-bold sm:text-5xl lg:text-6xl leading-tight"
              >
                Pronto para se{" "}
                <span className="bg-gradient-to-r from-green-300 via-lime-300 to-lime-300 bg-clip-text text-transparent">
                  descobrir
                </span>
                ?
              </motion.h2>

              <motion.p
                variants={fadeInUp}
                transition={{ duration: 0.5 }}
                className="text-lg text-green-100/70 max-w-xl mx-auto leading-relaxed"
              >
                Comece agora sua jornada de autoconhecimento e desenvolvimento
                profissional com o poder da inteligência artificial.
              </motion.p>

              <motion.div variants={fadeInUp} transition={{ duration: 0.5 }}>
                <Link href="/onboarding">
                  <Button
                    size="lg"
                    className="group h-16 px-12 text-lg bg-white text-green-900 font-semibold hover:bg-white/90 shadow-2xl shadow-black/20 transition-all duration-300 hover:scale-105 hover:shadow-white/20"
                  >
                    Comece Agora
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1.5" />
                  </Button>
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ============================================================ */}
      {/* EMPRESAS                                                      */}
      {/* ============================================================ */}
      <section className="relative px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-sm"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 via-transparent to-lime-500/5" />
            <div className="relative flex flex-col items-center gap-6 px-8 py-14 text-center sm:flex-row sm:text-left sm:px-14">
              <div className="flex-1 space-y-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-green-500/20 bg-green-500/10 px-3 py-1 text-xs font-medium text-green-400">
                  <Building2 className="h-3.5 w-3.5" />
                  Para Empresas
                </div>
                <h3 className="text-2xl font-bold text-white sm:text-3xl">
                  Quer aplicar na sua empresa?
                </h3>
                <p className="text-muted-foreground max-w-lg">
                  Desenvolva seus colaboradores com assessments de autoconhecimento, PDIs personalizados e acompanhamento contínuo em escala.
                </p>
              </div>
              <div className="shrink-0">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-green-600 to-lime-600 hover:from-green-500 hover:to-lime-500 text-black font-semibold shadow-lg shadow-green-500/20 px-8"
                >
                  Fale Conosco
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* FOOTER                                                        */}
      {/* ============================================================ */}
      <footer className="border-t border-white/[0.06] px-6 py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2 group">
            <Image src="/logo.png" alt="Destrava.Ai" width={260} height={62} className="h-14 w-auto" />
          </div>
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Destrava.Ai. Todos os direitos
            reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
