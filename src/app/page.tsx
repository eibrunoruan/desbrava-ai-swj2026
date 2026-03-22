"use client";

import { motion } from "framer-motion";
import Link from "next/link";
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
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const features = [
  {
    icon: Brain,
    title: "Assessments de Autoconhecimento",
    description:
      "Descubra suas fortalezas, valores e estilo de trabalho com assessments baseados em ciência comportamental e IA.",
    gradient: "from-purple-500 to-indigo-500",
  },
  {
    icon: Target,
    title: "PDI Personalizado",
    description:
      "Receba um Plano de Desenvolvimento Individual criado sob medida para seus objetivos e realidade profissional.",
    gradient: "from-indigo-500 to-blue-500",
  },
  {
    icon: BookOpen,
    title: "Curadoria Inteligente de Cursos",
    description:
      "Acesse recomendações de cursos, livros e conteúdos selecionados por IA para acelerar seu crescimento.",
    gradient: "from-violet-500 to-purple-500",
  },
  {
    icon: TrendingUp,
    title: "Acompanhamento Contínuo",
    description:
      "Monitore seu progresso com check-ins regulares e ajuste seu plano dinamicamente conforme evolui.",
    gradient: "from-fuchsia-500 to-violet-500",
  },
];

const steps = [
  {
    icon: User,
    label: "Onboarding",
    description: "Conte-nos sobre você e seus objetivos",
  },
  {
    icon: ClipboardCheck,
    label: "Assessments",
    description: "Complete avaliações de autoconhecimento",
  },
  {
    icon: Compass,
    label: "Perfil",
    description: "Receba seu perfil comportamental completo",
  },
  {
    icon: Route,
    label: "PDI",
    description: "Obtenha seu plano personalizado",
  },
  {
    icon: BarChart3,
    label: "Acompanhamento",
    description: "Evolua com check-ins e ajustes contínuos",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 z-50 w-full border-b border-white/10 bg-background/60 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
              Desbrava.Ai
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Entrar
              </Button>
            </Link>
            <Link href="/onboarding">
              <Button size="sm" className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700">
                Começar Grátis
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative flex min-h-screen items-center justify-center px-6 pt-16">
        {/* Background effects */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-purple-600/20 blur-3xl" />
          <div className="absolute top-1/3 right-1/4 h-96 w-96 rounded-full bg-indigo-600/20 blur-3xl" />
          <div className="absolute bottom-1/4 left-1/2 h-64 w-64 rounded-full bg-violet-600/15 blur-3xl" />
        </div>

        <div className="relative z-10 mx-auto max-w-5xl text-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="space-y-8"
          >
            <motion.div variants={fadeInUp} transition={{ duration: 0.6 }}>
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 shadow-lg shadow-purple-500/25">
                <Compass className="h-10 w-10 text-white" />
              </div>
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              transition={{ duration: 0.6 }}
              className="text-5xl font-extrabold tracking-tight sm:text-7xl"
            >
              <span className="bg-gradient-to-r from-purple-400 via-violet-400 to-indigo-400 bg-clip-text text-transparent">
                Desbrava.Ai
              </span>
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              transition={{ duration: 0.6 }}
              className="mx-auto max-w-2xl text-xl text-muted-foreground sm:text-2xl"
            >
              Descubra seu potencial.{" "}
              <span className="font-semibold text-foreground">
                Construa seu futuro.
              </span>
            </motion.p>

            <motion.p
              variants={fadeInUp}
              transition={{ duration: 0.6 }}
              className="mx-auto max-w-xl text-base text-muted-foreground/80"
            >
              Sua jornada de desenvolvimento pessoal e profissional começa aqui.
              Assessments inteligentes, PDI personalizado e curadoria de
              conteúdos guiados por IA.
            </motion.p>

            <motion.div
              variants={fadeInUp}
              transition={{ duration: 0.6 }}
              className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
            >
              <Link href="/onboarding">
                <Button
                  size="lg"
                  className="group h-14 px-8 text-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-lg shadow-purple-500/25 transition-all hover:shadow-purple-500/40"
                >
                  Começar Jornada
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Button
                variant="outline"
                size="lg"
                className="h-14 px-8 text-lg border-purple-500/30 hover:bg-purple-500/10"
              >
                Saiba Mais
              </Button>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <ChevronRight className="h-6 w-6 rotate-90 text-muted-foreground/50" />
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="relative px-6 py-32">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />
        </div>

        <div className="mx-auto max-w-7xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.div variants={fadeInUp} transition={{ duration: 0.5 }}>
              <span className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-1.5 text-sm text-purple-300">
                <Sparkles className="h-4 w-4" />
                Recursos
              </span>
            </motion.div>
            <motion.h2
              variants={fadeInUp}
              transition={{ duration: 0.5 }}
              className="mt-6 text-3xl font-bold sm:text-5xl"
            >
              Tudo que você precisa para{" "}
              <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
                evoluir
              </span>
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              transition={{ duration: 0.5 }}
              className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto"
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
                <Card className="group relative h-full overflow-hidden border-white/10 bg-white/5 backdrop-blur-sm transition-all duration-300 hover:border-purple-500/30 hover:bg-white/10 hover:shadow-lg hover:shadow-purple-500/10">
                  <CardContent className="p-6 space-y-4">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.gradient} shadow-lg`}
                    >
                      <feature.icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                  <div className="absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none bg-gradient-to-br from-purple-500/5 to-transparent" />
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section className="relative px-6 py-32">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />
          <div className="absolute bottom-1/3 right-0 h-80 w-80 rounded-full bg-indigo-600/10 blur-3xl" />
        </div>

        <div className="mx-auto max-w-5xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.div variants={fadeInUp} transition={{ duration: 0.5 }}>
              <span className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-sm text-indigo-300">
                <Route className="h-4 w-4" />
                Como funciona
              </span>
            </motion.div>
            <motion.h2
              variants={fadeInUp}
              transition={{ duration: 0.5 }}
              className="mt-6 text-3xl font-bold sm:text-5xl"
            >
              Sua jornada em{" "}
              <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                5 passos
              </span>
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            className="relative"
          >
            {/* Connection line */}
            <div className="absolute top-12 left-8 right-8 hidden h-0.5 bg-gradient-to-r from-purple-500/30 via-indigo-500/30 to-purple-500/30 lg:block" />

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
              {steps.map((step, index) => (
                <motion.div
                  key={step.label}
                  variants={fadeInUp}
                  transition={{ duration: 0.5 }}
                  className="relative flex flex-col items-center text-center"
                >
                  <div className="relative z-10 mb-4 flex h-24 w-24 items-center justify-center rounded-2xl border border-white/10 bg-background shadow-xl shadow-purple-500/10">
                    <div className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 text-xs font-bold text-white">
                      {index + 1}
                    </div>
                    <step.icon className="h-10 w-10 text-primary" />
                  </div>
                  <h3 className="text-base font-semibold">{step.label}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {step.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative px-6 py-32">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />
        </div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="mx-auto max-w-3xl text-center"
        >
          <motion.div
            variants={fadeInUp}
            transition={{ duration: 0.5 }}
            className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-purple-900/50 via-indigo-900/50 to-violet-900/50 p-12 backdrop-blur-sm"
          >
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute -top-20 -right-20 h-60 w-60 rounded-full bg-purple-500/20 blur-3xl" />
              <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-indigo-500/20 blur-3xl" />
            </div>

            <div className="relative z-10 space-y-6">
              <Sparkles className="mx-auto h-10 w-10 text-purple-400" />
              <h2 className="text-3xl font-bold sm:text-4xl">
                Pronto para desbravar seu{" "}
                <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
                  potencial
                </span>
                ?
              </h2>
              <p className="text-muted-foreground text-lg">
                Comece agora sua jornada de autoconhecimento e desenvolvimento
                profissional com o poder da inteligência artificial.
              </p>
              <Link href="/onboarding">
                <Button
                  size="lg"
                  className="group mt-2 h-14 px-10 text-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-lg shadow-purple-500/25"
                >
                  Começar Jornada
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 px-6 py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="font-semibold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
              Desbrava.Ai
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Desbrava.Ai. Todos os direitos
            reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
