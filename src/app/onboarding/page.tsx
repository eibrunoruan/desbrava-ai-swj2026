"use client";

import { useState, useCallback, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/store/user";
import {
  User,
  Target,
  FileUp,
  ChevronRight,
  ChevronLeft,
  X,
  Upload,
  Loader2,
  Check,
  Sparkles,
  Lock,
  Crown,
  CreditCard,
  Zap,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ─── Schema ──────────────────────────────────────────────────────────
const onboardingSchema = z.object({
  // Step 1
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("E-mail invalido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  job_role: z.string().optional(),
  area: z.string().optional(),
  experience_years: z.coerce.number().min(0).max(50).optional(),
  education_level: z.string().optional(),
  education_course: z.string().optional(),
  education_institution: z.string().optional(),
  languages: z.array(z.string()).default(["Portugues"]),
  // Step 2
  target_role: z.string().optional(),
  target_timeline: z.string().optional(),
  motivation: z.string().optional(),
});

type OnboardingFormData = z.infer<typeof onboardingSchema>;

// ─── Constants ───────────────────────────────────────────────────────
const EDUCATION_LEVELS = [
  "Ensino Medio",
  "Graduacao",
  "Pos-Graduacao",
  "Mestrado",
  "Doutorado",
];

const TIMELINE_OPTIONS = [
  { value: "6_months", label: "6 meses" },
  { value: "1_year", label: "1 ano" },
  { value: "2_years", label: "2 anos" },
];

const LANGUAGE_OPTIONS = [
  "Portugues",
  "English",
  "Espanol",
  "Francais",
  "Deutsch",
  "Italiano",
  "Mandarin",
  "Nihongo",
];

const ROLE_SUGGESTIONS = [
  "Tech Lead",
  "Product Manager",
  "Data Scientist",
  "UX Designer",
  "Engineering Manager",
  "CTO",
  "Full-Stack Developer",
  "DevOps Engineer",
  "Scrum Master",
  "Analista de Dados",
];

const STEPS = [
  { label: "Dados Pessoais", icon: User },
  { label: "Plano", icon: CreditCard },
  { label: "Objetivo", icon: Target },
  { label: "Curriculo", icon: FileUp },
];

const FREE_FEATURES = [
  "5 Assessments de Autoconhecimento",
  "Perfil Consolidado com IA",
  "Diagnóstico Cruzado de Personalidade",
  "Insights de Personalidade",
];

const PREMIUM_FEATURES = [
  "Tudo do plano Gratuito",
  "PDI Personalizado com IA",
  "Curadoria Inteligente de Cursos",
  "Acompanhamento e Check-ins",
  "Trajetória Comparada",
  "Suporte Prioritário",
];

// ─── Animation variants ─────────────────────────────────────────────
const pageVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
    scale: 0.95,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 300 : -300,
    opacity: 0,
    scale: 0.95,
  }),
};

const pageTransition = {
  type: "spring" as const,
  stiffness: 300,
  damping: 30,
};

// ─── CV extracted data type ──────────────────────────────────────────
interface CvExtractedData {
  hard_skills: string[];
  soft_skills: string[];
  experiences: { role: string; company: string; period: string }[];
  education: { degree: string; institution: string; year: string }[];
}

// ─── Component ───────────────────────────────────────────────────────
export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Plan state
  const [selectedPlan, setSelectedPlan] = useState<"free" | "premium">("free");

  // CV state
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvProcessing, setCvProcessing] = useState(false);
  const [cvExtracted, setCvExtracted] = useState<CvExtractedData | null>(null);
  const [cvError, setCvError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    trigger,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      job_role: "",
      area: "",
      experience_years: undefined,
      education_level: "",
      education_course: "",
      education_institution: "",
      languages: ["Portugues"],
      target_role: "",
      target_timeline: "",
      motivation: "",
    },
    mode: "onBlur",
  });

  const languages = watch("languages");

  // ── Step navigation ──────────────────────────────────────────────
  const totalSteps = 4;
  const goNext = async () => {
    let fieldsToValidate: (keyof OnboardingFormData)[] = [];
    if (step === 0) {
      fieldsToValidate = ["name", "email", "password"];
    }
    if (fieldsToValidate.length > 0) {
      const isValid = await trigger(fieldsToValidate);
      if (!isValid) return;
    }
    setDirection(1);
    setStep((s) => Math.min(s + 1, totalSteps - 1));
  };

  const goBack = () => {
    setDirection(-1);
    setStep((s) => Math.max(s - 1, 0));
  };

  // ── Language toggle ──────────────────────────────────────────────
  const toggleLanguage = (lang: string) => {
    const current = getValues("languages");
    if (current.includes(lang)) {
      if (current.length > 1) {
        setValue(
          "languages",
          current.filter((l) => l !== lang)
        );
      }
    } else {
      setValue("languages", [...current, lang]);
    }
  };

  // ── CV handling ──────────────────────────────────────────────────
  const handleFileDrop = useCallback(
    async (file: File) => {
      const validTypes = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      if (!validTypes.includes(file.type)) {
        setCvError("Formato invalido. Use PDF ou DOCX.");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setCvError("Arquivo muito grande. Maximo 10MB.");
        return;
      }

      setCvFile(file);
      setCvError(null);
      setCvProcessing(true);
      setCvExtracted(null);

      try {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/cv-extract", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          throw new Error("Falha ao processar o curriculo");
        }

        const data = await res.json();
        setCvExtracted(data);
      } catch {
        setCvError("Erro ao processar o curriculo. Tente novamente.");
      } finally {
        setCvProcessing(false);
      }
    },
    []
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFileDrop(file);
    },
    [handleFileDrop]
  );

  const onFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFileDrop(file);
    },
    [handleFileDrop]
  );

  // ── Submit ───────────────────────────────────────────────────────
  const onSubmit = async (data: OnboardingFormData) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("data", JSON.stringify({ ...data, plan: selectedPlan }));
      if (cvFile) {
        formData.append("cv", cvFile);
      }
      if (cvExtracted) {
        formData.append("cv_extracted_data", JSON.stringify(cvExtracted));
      }

      const res = await fetch("/api/onboarding", {
        method: "POST",
        body: formData,
      });

      const body = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(body.error || "Erro ao salvar dados");
      }

      useUserStore.getState().setUser(body.user);
      router.push("/assessments");
    } catch (err) {
      console.error("Onboarding error:", err);
      alert(
        err instanceof Error ? err.message : "Erro inesperado. Tente novamente."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Render helpers ───────────────────────────────────────────────
  const progressValue = ((step + 1) / totalSteps) * 100;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Step indicator */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        {/* Step dots */}
        <div className="flex items-center justify-center gap-2 mb-4">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const isActive = i === step;
            const isComplete = i < step;
            return (
              <div key={s.label} className="flex items-center gap-2">
                <motion.div
                  animate={{
                    scale: isActive ? 1.1 : 1,
                    backgroundColor: isActive
                      ? "rgb(139 92 246)"
                      : isComplete
                        ? "rgb(99 102 241)"
                        : "rgb(30 27 75)",
                  }}
                  className="w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors"
                  style={{
                    borderColor: isActive
                      ? "rgb(167 139 250)"
                      : isComplete
                        ? "rgb(129 140 248)"
                        : "rgb(55 48 107)",
                  }}
                >
                  {isComplete ? (
                    <Check className="w-4 h-4 text-white" />
                  ) : (
                    <Icon className="w-4 h-4 text-white/80" />
                  )}
                </motion.div>
                <span
                  className={`text-sm hidden sm:inline ${isActive ? "text-green-300 font-medium" : "text-green-500/50"}`}
                >
                  {s.label}
                </span>
                {i < STEPS.length - 1 && (
                  <div
                    className={`w-8 h-0.5 mx-1 ${isComplete ? "bg-lime-500" : "bg-green-900/50"}`}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Progress bar */}
        <Progress
          value={progressValue}
          className="h-1.5 bg-green-900/30 [&>div]:bg-gradient-to-r [&>div]:from-green-500 [&>div]:to-lime-500"
        />
        <p className="text-center text-xs text-green-400/60 mt-2">
          Passo {step + 1} de {totalSteps}
        </p>
      </motion.div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <AnimatePresence mode="wait" custom={direction}>
          {step === 0 && (
            <motion.div
              key="step1"
              custom={direction}
              variants={pageVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={pageTransition}
            >
              <Card className="bg-white/5 border-green-500/10 backdrop-blur-xl shadow-2xl shadow-green-900/20">
                <CardHeader>
                  <CardTitle className="text-2xl text-white">
                    Dados Pessoais e Profissionais
                  </CardTitle>
                  <CardDescription className="text-green-300/60">
                    Conte-nos um pouco sobre voce e sua carreira atual.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  {/* Name & Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-green-200">
                        Nome <span className="text-red-400">*</span>
                      </Label>
                      <Input
                        {...register("name")}
                        placeholder="Seu nome completo"
                        className="bg-white/5 border-green-500/20 text-white placeholder:text-green-400/30 focus-visible:ring-green-500/50"
                      />
                      {errors.name && (
                        <p className="text-red-400 text-xs">
                          {errors.name.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-green-200">
                        E-mail <span className="text-red-400">*</span>
                      </Label>
                      <Input
                        {...register("email")}
                        type="email"
                        placeholder="voce@email.com"
                        className="bg-white/5 border-green-500/20 text-white placeholder:text-green-400/30 focus-visible:ring-green-500/50"
                      />
                      {errors.email && (
                        <p className="text-red-400 text-xs">
                          {errors.email.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Password */}
                  <div className="space-y-2">
                    <Label className="text-green-200">
                      Senha <span className="text-red-400">*</span>
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-green-400/40" />
                      <Input
                        {...register("password")}
                        type="password"
                        placeholder="Crie uma senha segura"
                        className="pl-10 bg-white/5 border-green-500/20 text-white placeholder:text-green-400/30 focus-visible:ring-green-500/50"
                      />
                    </div>
                    {errors.password && (
                      <p className="text-red-400 text-xs">
                        {errors.password.message}
                      </p>
                    )}
                  </div>

                  {/* Role & Area */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-green-200">Cargo atual</Label>
                      <Input
                        {...register("job_role")}
                        placeholder="Ex: Desenvolvedor Pleno"
                        className="bg-white/5 border-green-500/20 text-white placeholder:text-green-400/30 focus-visible:ring-green-500/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-green-200">
                        Area de atuacao
                      </Label>
                      <Input
                        {...register("area")}
                        placeholder="Ex: Tecnologia"
                        className="bg-white/5 border-green-500/20 text-white placeholder:text-green-400/30 focus-visible:ring-green-500/50"
                      />
                    </div>
                  </div>

                  {/* Experience */}
                  <div className="space-y-2">
                    <Label className="text-green-200">
                      Anos de experiencia
                    </Label>
                    <Input
                      {...register("experience_years")}
                      type="number"
                      min={0}
                      max={50}
                      placeholder="Ex: 5"
                      className="bg-white/5 border-green-500/20 text-white placeholder:text-green-400/30 focus-visible:ring-green-500/50 w-32"
                    />
                  </div>

                  {/* Education */}
                  <div className="space-y-3">
                    <Label className="text-green-200 text-base">
                      Formacao
                    </Label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label className="text-green-300/70 text-xs">
                          Nivel
                        </Label>
                        <Controller
                          control={control}
                          name="education_level"
                          render={({ field }) => (
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <SelectTrigger className="bg-white/5 border-green-500/20 text-white focus:ring-green-500/50 [&>span]:text-green-300/60">
                                <SelectValue placeholder="Selecione" />
                              </SelectTrigger>
                              <SelectContent>
                                {EDUCATION_LEVELS.map((level) => (
                                  <SelectItem key={level} value={level}>
                                    {level}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-green-300/70 text-xs">
                          Curso
                        </Label>
                        <Input
                          {...register("education_course")}
                          placeholder="Ex: Eng. de Software"
                          className="bg-white/5 border-green-500/20 text-white placeholder:text-green-400/30 focus-visible:ring-green-500/50"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-green-300/70 text-xs">
                          Instituicao
                        </Label>
                        <Input
                          {...register("education_institution")}
                          placeholder="Ex: USP"
                          className="bg-white/5 border-green-500/20 text-white placeholder:text-green-400/30 focus-visible:ring-green-500/50"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Languages */}
                  <div className="space-y-2">
                    <Label className="text-green-200">Idiomas</Label>
                    <div className="flex flex-wrap gap-2">
                      {LANGUAGE_OPTIONS.map((lang) => {
                        const isSelected = languages.includes(lang);
                        return (
                          <button
                            key={lang}
                            type="button"
                            onClick={() => toggleLanguage(lang)}
                            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                              isSelected
                                ? "bg-green-500/30 text-green-200 border border-green-400/40"
                                : "bg-white/5 text-green-400/50 border border-green-500/10 hover:border-green-500/30 hover:text-green-300"
                            }`}
                          >
                            {lang}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="step-plan"
              custom={direction}
              variants={pageVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={pageTransition}
            >
              <Card className="bg-white/5 border-green-500/10 backdrop-blur-xl shadow-2xl shadow-green-900/20">
                <CardHeader>
                  <CardTitle className="text-2xl text-white">
                    Escolha seu Plano
                  </CardTitle>
                  <CardDescription className="text-green-300/60">
                    Comece gratuitamente ou desbloqueie todo o potencial da plataforma.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Free Plan */}
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => setSelectedPlan("free")}
                      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setSelectedPlan("free"); }}
                      className={`cursor-pointer relative rounded-xl p-5 border-2 transition-all ${
                        selectedPlan === "free"
                          ? "border-green-400 bg-green-500/10 shadow-lg shadow-green-500/10"
                          : "border-white/10 bg-white/5 hover:border-white/20"
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10">
                          <Zap className="h-5 w-5 text-green-400" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white">Gratuito</h3>
                          <p className="text-2xl font-bold text-green-400">R$0</p>
                        </div>
                      </div>
                      <ul className="space-y-2">
                        {FREE_FEATURES.map((f) => (
                          <li key={f} className="flex items-start gap-2 text-sm text-green-200/70">
                            <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                            {f}
                          </li>
                        ))}
                      </ul>
                      {selectedPlan === "free" && (
                        <div className="absolute top-3 right-3">
                          <div className="h-5 w-5 rounded-full bg-green-500 flex items-center justify-center">
                            <Check className="h-3 w-3 text-black" />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Premium Plan */}
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => setSelectedPlan("premium")}
                      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setSelectedPlan("premium"); }}
                      className={`cursor-pointer relative rounded-xl p-5 border-2 transition-all ${
                        selectedPlan === "premium"
                          ? "border-lime-400 bg-lime-500/10 shadow-lg shadow-lime-500/10"
                          : "border-white/10 bg-white/5 hover:border-white/20"
                      }`}
                    >
                      <div className="absolute -top-3 left-4">
                        <span className="px-3 py-0.5 bg-gradient-to-r from-green-500 to-lime-500 text-black text-[10px] font-bold uppercase tracking-wider rounded-full">
                          Recomendado
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-lime-500">
                          <Crown className="h-5 w-5 text-black" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white">Premium</h3>
                          <p className="text-2xl font-bold text-lime-400">
                            R$29,90<span className="text-sm font-normal text-lime-400/60">/mês</span>
                          </p>
                        </div>
                      </div>
                      <ul className="space-y-2">
                        {PREMIUM_FEATURES.map((f) => (
                          <li key={f} className="flex items-start gap-2 text-sm text-green-200/70">
                            <Check className="h-4 w-4 text-lime-500 mt-0.5 shrink-0" />
                            {f}
                          </li>
                        ))}
                      </ul>
                      {selectedPlan === "premium" && (
                        <div className="absolute top-3 right-3">
                          <div className="h-5 w-5 rounded-full bg-lime-500 flex items-center justify-center">
                            <Check className="h-3 w-3 text-black" />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-center text-xs text-green-400/40 mt-4">
                    Voce pode mudar de plano a qualquer momento.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              custom={direction}
              variants={pageVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={pageTransition}
            >
              <Card className="bg-white/5 border-green-500/10 backdrop-blur-xl shadow-2xl shadow-green-900/20">
                <CardHeader>
                  <CardTitle className="text-2xl text-white">
                    Objetivo de Carreira
                  </CardTitle>
                  <CardDescription className="text-green-300/60">
                    Para onde voce quer ir? Vamos construir o caminho juntos.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  {/* Target role */}
                  <div className="space-y-2">
                    <Label className="text-green-200">
                      Cargo ou posicao desejada
                    </Label>
                    <Input
                      {...register("target_role")}
                      placeholder="Ex: Tech Lead, Product Manager"
                      className="bg-white/5 border-green-500/20 text-white placeholder:text-green-400/30 focus-visible:ring-green-500/50"
                    />
                    {/* Suggestions */}
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {ROLE_SUGGESTIONS.map((role) => (
                        <button
                          key={role}
                          type="button"
                          onClick={() => setValue("target_role", role)}
                          className="px-2.5 py-1 rounded-md text-xs bg-white/5 text-green-400/60 border border-green-500/10 hover:border-green-500/30 hover:text-green-300 transition-colors"
                        >
                          {role}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="space-y-2">
                    <Label className="text-green-200">
                      Em quanto tempo?
                    </Label>
                    <Controller
                      control={control}
                      name="target_timeline"
                      render={({ field }) => (
                        <div className="grid grid-cols-3 gap-3">
                          {TIMELINE_OPTIONS.map((opt) => {
                            const isSelected = field.value === opt.value;
                            return (
                              <button
                                key={opt.value}
                                type="button"
                                onClick={() => field.onChange(opt.value)}
                                className={`py-3 rounded-xl text-sm font-medium transition-all border ${
                                  isSelected
                                    ? "bg-green-500/20 border-green-400/40 text-green-200 shadow-lg shadow-green-500/10"
                                    : "bg-white/5 border-green-500/10 text-green-400/50 hover:border-green-500/30"
                                }`}
                              >
                                {opt.label}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    />
                  </div>

                  {/* Motivation */}
                  <div className="space-y-2">
                    <Label className="text-green-200">
                      Por que voce quer chegar la?
                    </Label>
                    <Textarea
                      {...register("motivation")}
                      placeholder="Compartilhe o que te motiva a buscar essa mudanca..."
                      rows={4}
                      className="bg-white/5 border-green-500/20 text-white placeholder:text-green-400/30 focus-visible:ring-green-500/50 resize-none"
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              custom={direction}
              variants={pageVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={pageTransition}
            >
              <Card className="bg-white/5 border-green-500/10 backdrop-blur-xl shadow-2xl shadow-green-900/20">
                <CardHeader>
                  <CardTitle className="text-2xl text-white">
                    Upload de Curriculo
                  </CardTitle>
                  <CardDescription className="text-green-300/60">
                    Opcional. Envie seu CV para extrairmos automaticamente suas
                    habilidades e experiencias.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  {/* Drop zone */}
                  {!cvFile && (
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragging(true);
                      }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={onDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${
                        isDragging
                          ? "border-green-400 bg-green-500/10"
                          : "border-green-500/20 hover:border-green-500/40 hover:bg-white/5"
                      }`}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.docx"
                        onChange={onFileChange}
                        className="hidden"
                      />
                      <Upload className="w-10 h-10 text-green-400/40 mx-auto mb-3" />
                      <p className="text-green-200 font-medium">
                        Arraste seu CV aqui ou clique para selecionar
                      </p>
                      <p className="text-green-400/50 text-sm mt-1">
                        PDF ou DOCX, ate 10MB
                      </p>
                    </div>
                  )}

                  {/* File selected */}
                  {cvFile && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-green-500/10">
                        <FileUp className="w-8 h-8 text-green-400" />
                        <div className="flex-1 min-w-0">
                          <p className="text-green-200 font-medium truncate">
                            {cvFile.name}
                          </p>
                          <p className="text-green-400/50 text-xs">
                            {(cvFile.size / 1024).toFixed(0)} KB
                          </p>
                        </div>
                        {cvProcessing ? (
                          <Loader2 className="w-5 h-5 text-green-400 animate-spin" />
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setCvFile(null);
                              setCvExtracted(null);
                              setCvError(null);
                            }}
                            className="text-green-400/50 hover:text-red-400 transition-colors"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        )}
                      </div>

                      {/* Processing indicator */}
                      {cvProcessing && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex items-center gap-3 p-4 bg-lime-500/10 rounded-xl border border-lime-500/20"
                        >
                          <Sparkles className="w-5 h-5 text-lime-400 animate-pulse" />
                          <div>
                            <p className="text-lime-200 text-sm font-medium">
                              Analisando seu curriculo com IA...
                            </p>
                            <p className="text-lime-400/50 text-xs">
                              Extraindo habilidades e experiencias
                            </p>
                          </div>
                        </motion.div>
                      )}

                      {/* Error */}
                      {cvError && (
                        <p className="text-red-400 text-sm">{cvError}</p>
                      )}

                      {/* Extracted data preview */}
                      {cvExtracted && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="space-y-3"
                        >
                          <div className="flex items-center gap-2 text-green-400">
                            <Check className="w-4 h-4" />
                            <span className="text-sm font-medium">
                              Dados extraidos com sucesso
                            </span>
                          </div>

                          {cvExtracted.hard_skills?.length > 0 && (
                            <div>
                              <p className="text-green-300/70 text-xs font-medium mb-1.5">
                                Hard Skills
                              </p>
                              <div className="flex flex-wrap gap-1.5">
                                {cvExtracted.hard_skills.map((skill) => (
                                  <span
                                    key={skill}
                                    className="px-2 py-0.5 bg-green-500/15 text-green-300 text-xs rounded-md border border-green-500/20"
                                  >
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {cvExtracted.soft_skills?.length > 0 && (
                            <div>
                              <p className="text-green-300/70 text-xs font-medium mb-1.5">
                                Soft Skills
                              </p>
                              <div className="flex flex-wrap gap-1.5">
                                {cvExtracted.soft_skills.map((skill) => (
                                  <span
                                    key={skill}
                                    className="px-2 py-0.5 bg-lime-500/15 text-lime-300 text-xs rounded-md border border-lime-500/20"
                                  >
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {cvExtracted.experiences?.length > 0 && (
                            <div>
                              <p className="text-green-300/70 text-xs font-medium mb-1.5">
                                Experiencias
                              </p>
                              <div className="space-y-1">
                                {cvExtracted.experiences.map((exp, i) => (
                                  <p
                                    key={i}
                                    className="text-green-200/80 text-xs"
                                  >
                                    {exp.role} - {exp.company}{" "}
                                    <span className="text-green-400/40">
                                      ({exp.period})
                                    </span>
                                  </p>
                                ))}
                              </div>
                            </div>
                          )}

                          {cvExtracted.education?.length > 0 && (
                            <div>
                              <p className="text-green-300/70 text-xs font-medium mb-1.5">
                                Formacao
                              </p>
                              <div className="space-y-1">
                                {cvExtracted.education.map((edu, i) => (
                                  <p
                                    key={i}
                                    className="text-green-200/80 text-xs"
                                  >
                                    {edu.degree} - {edu.institution}{" "}
                                    <span className="text-green-400/40">
                                      ({edu.year})
                                    </span>
                                  </p>
                                ))}
                              </div>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex justify-between items-center mt-6"
        >
          {step > 0 ? (
            <Button
              type="button"
              variant="ghost"
              onClick={goBack}
              className="text-green-300 hover:text-white hover:bg-white/10"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Voltar
            </Button>
          ) : (
            <div />
          )}

          {step < totalSteps - 1 ? (
            <Button
              type="button"
              onClick={goNext}
              className="bg-gradient-to-r from-green-600 to-lime-600 hover:from-green-500 hover:to-lime-500 text-white shadow-lg shadow-green-500/25"
            >
              Proximo
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <div className="flex gap-3">
              {!cvFile && (
                <Button
                  type="submit"
                  variant="ghost"
                  disabled={isSubmitting}
                  className="text-green-300 hover:text-white hover:bg-white/10"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : null}
                  Pular e continuar
                </Button>
              )}
              <Button
                type="submit"
                disabled={isSubmitting || cvProcessing}
                className="bg-gradient-to-r from-green-600 to-lime-600 hover:from-green-500 hover:to-lime-500 text-white shadow-lg shadow-green-500/25"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4 mr-2" />
                )}
                Comecar jornada
              </Button>
            </div>
          )}
        </motion.div>
      </form>
    </div>
  );
}
