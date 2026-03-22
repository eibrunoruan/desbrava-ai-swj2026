"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Route,
  Upload,
  Loader2,
  CheckCircle2,
  BookOpen,
  Code2,
  BookMarked,
  Dumbbell,
  Zap,
  Clock,
  ArrowRight,
  FileUp,
  Trophy,
  Layers,
  Target,
  Lightbulb,
  ExternalLink,
  AlertTriangle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useUserStore } from "@/store/user";
import { PremiumGate } from "@/components/premium-gate";

// ─── Types ──────────────────────────────────────────────────────────
interface CourseRecommendation {
  id: string;
  title: string;
  url: string | null;
  platform: string | null;
  rating: number | null;
  price: number | null;
  duration: string | null;
  compatibility_score: number | null;
}

interface PdiItem {
  id: string;
  pdi_id: string;
  module: "foundation" | "specialization" | "consolidation";
  title: string;
  description: string | null;
  type: "course" | "project" | "reading" | "exercise";
  flow_potential: "high" | "medium" | "low";
  flow_strategy: string | null;
  status: "pending" | "in_progress" | "completed";
  due_date: string | null;
  completed_at: string | null;
  order: number;
  course_recommendations: CourseRecommendation[];
}

interface AiSuggestions {
  alignment_score?: number;
  alignment_analysis?: string;
  identified_gaps?: string[];
  enrichment_suggestions?: {
    title: string;
    description: string;
    reason: string;
    type: string;
  }[];
  timeline_adjustments?: string;
  personality_fit_notes?: string;
}

interface Pdi {
  id: string;
  user_id: string;
  type: "generated" | "imported";
  status: "draft" | "active" | "completed";
  modules: Record<string, { name: string; description: string }> | null;
  ai_suggestions: AiSuggestions | null;
  created_at: string;
  updated_at: string;
  items: PdiItem[];
}

type ModuleKey = "foundation" | "specialization" | "consolidation";

// ─── Constants ──────────────────────────────────────────────────────
const moduleConfig: Record<
  ModuleKey,
  {
    label: string;
    icon: React.ElementType;
    gradient: string;
    description: string;
  }
> = {
  foundation: {
    label: "Fundamentos",
    icon: Layers,
    gradient: "from-blue-500 to-cyan-500",
    description: "Preencha a base com habilidades essenciais",
  },
  specialization: {
    label: "Especializacao",
    icon: Target,
    gradient: "from-green-500 to-lime-500",
    description: "Mergulhe fundo em areas estrategicas",
  },
  consolidation: {
    label: "Consolidacao",
    icon: Trophy,
    gradient: "from-amber-500 to-orange-500",
    description: "Prove sua competencia com projetos reais",
  },
};

const typeConfig: Record<
  string,
  { label: string; icon: React.ElementType; className: string }
> = {
  course: {
    label: "Curso",
    icon: BookOpen,
    className: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  },
  project: {
    label: "Projeto",
    icon: Code2,
    className: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  },
  reading: {
    label: "Leitura",
    icon: BookMarked,
    className: "bg-lime-500/20 text-lime-400 border-lime-500/30",
  },
  exercise: {
    label: "Exercicio",
    icon: Dumbbell,
    className: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  },
};

const flowPotentialConfig: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  high: {
    label: "Alto",
    color: "text-emerald-400",
    bg: "bg-emerald-500/20",
  },
  medium: {
    label: "Medio",
    color: "text-amber-400",
    bg: "bg-amber-500/20",
  },
  low: { label: "Baixo", color: "text-red-400", bg: "bg-red-500/20" },
};

// ─── Component ──────────────────────────────────────────────────────
export default function PdiPage() {
  const user = useUserStore((s) => s.user);
  const [pdis, setPdis] = useState<Pdi[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [importing, setImporting] = useState(false);
  const [activeTab, setActiveTab] = useState<ModuleKey>("foundation");
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activePdi = pdis[0] || null;

  const fetchPdis = useCallback(async () => {
    if (!user?.id) return;
    try {
      const res = await fetch(`/api/pdi?userId=${user.id}`);
      const data = await res.json();
      if (data.pdis) {
        setPdis(data.pdis);
      }
    } catch (err) {
      console.error("Failed to fetch PDIs:", err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchPdis();
  }, [fetchPdis]);

  // ─── Generate PDI ──────────────────────────────────────────────────
  const handleGenerate = async () => {
    if (!user?.id) return;
    setGenerating(true);
    try {
      const res = await fetch("/api/pdi/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });
      const data = await res.json();
      if (data.pdi) {
        await fetchPdis();
      } else {
        console.error("Generate error:", data.error);
      }
    } catch (err) {
      console.error("Failed to generate PDI:", err);
    } finally {
      setGenerating(false);
    }
  };

  // ─── Import PDI ──────────────────────────────────────────────────
  const handleImport = async (file: File) => {
    if (!user?.id) return;
    setImporting(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("userId", user.id);

      const res = await fetch("/api/pdi/import", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.pdi) {
        await fetchPdis();
      } else {
        console.error("Import error:", data.error);
      }
    } catch (err) {
      console.error("Failed to import PDI:", err);
    } finally {
      setImporting(false);
    }
  };

  // ─── Update item status ──────────────────────────────────────────
  const handleStatusChange = async (item: PdiItem, checked: boolean) => {
    if (!activePdi) return;
    const newStatus = checked ? "completed" : "pending";

    setUpdatingItems((prev) => new Set(prev).add(item.id));

    try {
      const res = await fetch(`/api/pdi/${activePdi.id}/items`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId: item.id, status: newStatus }),
      });
      const data = await res.json();
      if (data.item) {
        setPdis((prev) =>
          prev.map((pdi) => {
            if (pdi.id !== activePdi.id) return pdi;
            return {
              ...pdi,
              items: pdi.items.map((i) =>
                i.id === item.id ? { ...i, ...data.item } : i
              ),
            };
          })
        );
      }
    } catch (err) {
      console.error("Failed to update item:", err);
    } finally {
      setUpdatingItems((prev) => {
        const next = new Set(prev);
        next.delete(item.id);
        return next;
      });
    }
  };

  // ─── Progress calculations ──────────────────────────────────────
  const getModuleItems = (module: ModuleKey): PdiItem[] =>
    activePdi?.items.filter((i) => i.module === module) || [];

  const getModuleProgress = (module: ModuleKey) => {
    const items = getModuleItems(module);
    if (items.length === 0) return 0;
    const completed = items.filter((i) => i.status === "completed").length;
    return Math.round((completed / items.length) * 100);
  };

  const getOverallProgress = () => {
    if (!activePdi?.items.length) return 0;
    const completed = activePdi.items.filter(
      (i) => i.status === "completed"
    ).length;
    return Math.round((completed / activePdi.items.length) * 100);
  };

  // ─── Premium gate ──────────────────────────────────────────────
  if (!user?.plan || user.plan === "free") {
    return (
      <PremiumGate
        feature="Desbloqueie seu PDI personalizado com IA"
        description="Com o plano Premium, voce recebe um Plano de Desenvolvimento Individual completo, gerado por inteligencia artificial com base no seu perfil, assessments e objetivos de carreira."
      />
    );
  }

  // ─── Loading state ──────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-green-400" />
      </div>
    );
  }

  // ─── Empty state: no PDI exists ──────────────────────────────────
  if (!activePdi) {
    return (
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="text-sm text-muted-foreground">PDI</span>
          </div>
          <h1 className="text-3xl font-bold">
            Plano de{" "}
            <span className="bg-gradient-to-r from-green-400 to-lime-400 bg-clip-text text-transparent">
              Desenvolvimento Individual
            </span>
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            Crie seu plano de desenvolvimento personalizado baseado no seu
            perfil ou importe um PDI existente para enriquece-lo com
            inteligencia artificial.
          </p>
        </div>

        {/* Two paths */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Generate Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="group relative h-full overflow-hidden border-white/10 bg-white/5 backdrop-blur-sm transition-all duration-300 hover:border-green-500/30 hover:shadow-lg hover:shadow-green-500/10">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-lime-500/5 opacity-0 transition-opacity group-hover:opacity-100" />
              <CardHeader className="relative">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-lime-600 shadow-lg shadow-green-500/25 mb-4">
                  <Sparkles className="h-7 w-7 text-white" />
                </div>
                <CardTitle className="text-xl">Gerar PDI com IA</CardTitle>
                <CardDescription className="text-sm leading-relaxed">
                  Nossa IA analisa seu perfil, assessments e objetivos para criar
                  um plano de desenvolvimento personalizado com 3 modulos
                  estrategicos.
                </CardDescription>
              </CardHeader>
              <CardContent className="relative space-y-4">
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Layers className="h-4 w-4 text-blue-400" />
                    <span>Fundamentos - preencha sua base</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-green-400" />
                    <span>Especializacao - mergulho profundo</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-amber-400" />
                    <span>Consolidacao - prove competencia</span>
                  </div>
                </div>
                <Separator className="bg-white/10" />
                <Button
                  onClick={handleGenerate}
                  disabled={generating || importing}
                  className="w-full bg-gradient-to-r from-green-600 to-lime-600 hover:from-green-500 hover:to-lime-500 text-white shadow-lg shadow-green-500/25"
                  size="lg"
                >
                  {generating ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Gerando seu PDI...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-5 w-5" />
                      Gerar Meu PDI
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Import Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="group relative h-full overflow-hidden border-white/10 bg-white/5 backdrop-blur-sm transition-all duration-300 hover:border-lime-500/30 hover:shadow-lg hover:shadow-lime-500/10">
              <div className="absolute inset-0 bg-gradient-to-br from-lime-500/5 via-transparent to-green-500/5 opacity-0 transition-opacity group-hover:opacity-100" />
              <CardHeader className="relative">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-lime-500 to-green-600 shadow-lg shadow-lime-500/25 mb-4">
                  <Upload className="h-7 w-7 text-white" />
                </div>
                <CardTitle className="text-xl">Importar PDI Existente</CardTitle>
                <CardDescription className="text-sm leading-relaxed">
                  Ja tem um PDI? Faca upload do seu documento e nossa IA vai
                  analisar, validar o alinhamento com seu perfil e sugerir
                  melhorias.
                </CardDescription>
              </CardHeader>
              <CardContent className="relative space-y-4">
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <FileUp className="h-4 w-4 text-lime-400" />
                    <span>Formatos aceitos: PDF, DOCX</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-amber-400" />
                    <span>Analise de alinhamento com seu perfil</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-emerald-400" />
                    <span>Sugestoes de enriquecimento com IA</span>
                  </div>
                </div>
                <Separator className="bg-white/10" />
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,.doc"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImport(file);
                  }}
                />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={importing || generating}
                  variant="outline"
                  className="w-full border-white/20 hover:bg-white/10"
                  size="lg"
                >
                  {importing ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Importando e analisando...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-5 w-5" />
                      Importar Documento
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  // ─── PDI exists: show full plan ──────────────────────────────────
  const overallProgress = getOverallProgress();
  const totalItems = activePdi.items.length;
  const completedItems = activePdi.items.filter(
    (i) => i.status === "completed"
  ).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Route className="h-5 w-5 text-primary" />
          <span className="text-sm text-muted-foreground">
            PDI{" "}
            {activePdi.type === "imported" ? "(Importado)" : "(Gerado por IA)"}
          </span>
        </div>
        <h1 className="text-3xl font-bold">
          Meu{" "}
          <span className="bg-gradient-to-r from-green-400 to-lime-400 bg-clip-text text-transparent">
            Plano de Desenvolvimento
          </span>
        </h1>
        <p className="text-muted-foreground max-w-2xl">
          Acompanhe seu progresso e complete cada etapa para alcancar seus
          objetivos profissionais.
        </p>
      </div>

      {/* Overall Progress Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-lime-600 shadow-lg">
                  <CheckCircle2 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="font-semibold">Progresso Geral</p>
                  <p className="text-sm text-muted-foreground">
                    {completedItems} de {totalItems} itens concluidos
                  </p>
                </div>
              </div>
              <span className="text-3xl font-bold bg-gradient-to-r from-green-400 to-lime-400 bg-clip-text text-transparent">
                {overallProgress}%
              </span>
            </div>
            <Progress value={overallProgress} className="h-3" />

            {/* Module progress mini */}
            <div className="grid grid-cols-3 gap-4 mt-4">
              {(
                ["foundation", "specialization", "consolidation"] as ModuleKey[]
              ).map((mod) => {
                const config = moduleConfig[mod];
                const progress = getModuleProgress(mod);
                const items = getModuleItems(mod);
                const done = items.filter(
                  (i) => i.status === "completed"
                ).length;

                return (
                  <button
                    key={mod}
                    onClick={() => setActiveTab(mod)}
                    className={`rounded-lg p-3 text-left transition-all ${
                      activeTab === mod
                        ? "bg-white/10 ring-1 ring-green-500/30"
                        : "bg-white/5 hover:bg-white/10"
                    }`}
                  >
                    <p className="text-xs font-medium truncate">
                      {config.label}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {done}/{items.length}
                    </p>
                    <Progress value={progress} className="h-1.5 mt-2" />
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* AI Suggestions for imported PDI */}
      {activePdi.type === "imported" && activePdi.ai_suggestions && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Card className="border-amber-500/20 bg-amber-500/5 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-amber-400" />
                <CardTitle className="text-lg">
                  Sugestoes da IA
                </CardTitle>
                {activePdi.ai_suggestions.alignment_score !== undefined && (
                  <Badge className="ml-auto bg-amber-500/20 text-amber-400 border-amber-500/30">
                    Alinhamento: {activePdi.ai_suggestions.alignment_score}%
                  </Badge>
                )}
              </div>
              {activePdi.ai_suggestions.alignment_analysis && (
                <CardDescription className="text-sm">
                  {activePdi.ai_suggestions.alignment_analysis}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Gaps */}
              {activePdi.ai_suggestions.identified_gaps &&
                activePdi.ai_suggestions.identified_gaps.length > 0 && (
                  <div>
                    <p className="text-sm font-medium flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-4 w-4 text-amber-400" />
                      Gaps Identificados
                    </p>
                    <ul className="space-y-1">
                      {activePdi.ai_suggestions.identified_gaps.map(
                        (gap, i) => (
                          <li
                            key={i}
                            className="text-sm text-muted-foreground flex items-start gap-2"
                          >
                            <span className="text-amber-400 mt-1">-</span>
                            {gap}
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                )}

              {/* Enrichment Suggestions */}
              {activePdi.ai_suggestions.enrichment_suggestions &&
                activePdi.ai_suggestions.enrichment_suggestions.length > 0 && (
                  <Accordion type="single" collapsible>
                    <AccordionItem value="enrichments" className="border-white/10">
                      <AccordionTrigger className="text-sm font-medium py-2">
                        <span className="flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-green-400" />
                          Sugestoes de Enriquecimento (
                          {activePdi.ai_suggestions.enrichment_suggestions.length})
                        </span>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-3 pt-2">
                          {activePdi.ai_suggestions.enrichment_suggestions.map(
                            (sug, i) => (
                              <div
                                key={i}
                                className="rounded-lg bg-white/5 p-3 space-y-1"
                              >
                                <p className="text-sm font-medium">{sug.title}</p>
                                <p className="text-xs text-muted-foreground">
                                  {sug.description}
                                </p>
                                <p className="text-xs text-green-400">
                                  Motivo: {sug.reason}
                                </p>
                              </div>
                            )
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                )}

              {/* Timeline & Personality Notes */}
              {(activePdi.ai_suggestions.timeline_adjustments ||
                activePdi.ai_suggestions.personality_fit_notes) && (
                <div className="grid gap-3 sm:grid-cols-2">
                  {activePdi.ai_suggestions.timeline_adjustments && (
                    <div className="rounded-lg bg-white/5 p-3">
                      <p className="text-xs font-medium flex items-center gap-1.5 mb-1">
                        <Clock className="h-3.5 w-3.5 text-blue-400" />
                        Ajuste de Timeline
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {activePdi.ai_suggestions.timeline_adjustments}
                      </p>
                    </div>
                  )}
                  {activePdi.ai_suggestions.personality_fit_notes && (
                    <div className="rounded-lg bg-white/5 p-3">
                      <p className="text-xs font-medium flex items-center gap-1.5 mb-1">
                        <Zap className="h-3.5 w-3.5 text-lime-400" />
                        Fit de Personalidade
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {activePdi.ai_suggestions.personality_fit_notes}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Module Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as ModuleKey)}
      >
        <TabsList className="grid w-full grid-cols-3 bg-white/5 border border-white/10">
          {(
            ["foundation", "specialization", "consolidation"] as ModuleKey[]
          ).map((mod) => {
            const config = moduleConfig[mod];
            const Icon = config.icon;
            return (
              <TabsTrigger
                key={mod}
                value={mod}
                className="data-[state=active]:bg-white/10 data-[state=active]:text-foreground gap-2"
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{config.label}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {(
          ["foundation", "specialization", "consolidation"] as ModuleKey[]
        ).map((mod) => {
          const config = moduleConfig[mod];
          const items = getModuleItems(mod);
          const progress = getModuleProgress(mod);

          return (
            <TabsContent key={mod} value={mod} className="space-y-4 mt-6">
              {/* Module header */}
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${config.gradient}`}
                  >
                    <config.icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">{config.label}</h2>
                    <p className="text-xs text-muted-foreground">
                      {config.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">
                    {items.filter((i) => i.status === "completed").length}/
                    {items.length}
                  </span>
                  <div className="w-24">
                    <Progress value={progress} className="h-2" />
                  </div>
                </div>
              </motion.div>

              <Separator className="bg-white/10" />

              {/* Module items */}
              <AnimatePresence mode="wait">
                <div className="space-y-4">
                  {items.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      Nenhum item neste modulo.
                    </p>
                  ) : (
                    items.map((item, index) => (
                      <PdiItemCard
                        key={item.id}
                        item={item}
                        index={index}
                        isUpdating={updatingItems.has(item.id)}
                        onStatusChange={handleStatusChange}
                      />
                    ))
                  )}
                </div>
              </AnimatePresence>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}

// ─── PDI Item Card ────────────────────────────────────────────────
function PdiItemCard({
  item,
  index,
  isUpdating,
  onStatusChange,
}: {
  item: PdiItem;
  index: number;
  isUpdating: boolean;
  onStatusChange: (item: PdiItem, checked: boolean) => void;
}) {
  const isCompleted = item.status === "completed";
  const typeConf = typeConfig[item.type] || typeConfig.course;
  const flowConf = flowPotentialConfig[item.flow_potential] || flowPotentialConfig.medium;
  const TypeIcon = typeConf.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Card
        className={`group overflow-hidden border-white/10 bg-white/5 backdrop-blur-sm transition-all duration-200 hover:border-white/20 ${
          isCompleted ? "opacity-70" : ""
        }`}
      >
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            {/* Checkbox */}
            <div className="pt-0.5">
              {isUpdating ? (
                <Loader2 className="h-5 w-5 animate-spin text-green-400" />
              ) : (
                <Checkbox
                  checked={isCompleted}
                  onCheckedChange={(checked) =>
                    onStatusChange(item, checked === true)
                  }
                  className="border-white/30 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 space-y-2">
              {/* Title row */}
              <div className="flex items-start justify-between gap-3">
                <h3
                  className={`font-medium leading-snug ${
                    isCompleted ? "line-through text-muted-foreground" : ""
                  }`}
                >
                  {item.title}
                </h3>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge
                    variant="outline"
                    className={`text-[10px] ${typeConf.className}`}
                  >
                    <TypeIcon className="h-3 w-3 mr-1" />
                    {typeConf.label}
                  </Badge>
                </div>
              </div>

              {/* Description */}
              {item.description && (
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              )}

              {/* Meta row */}
              <div className="flex flex-wrap items-center gap-3 text-xs">
                {/* Flow potential */}
                <span
                  className={`flex items-center gap-1 ${flowConf.color}`}
                >
                  <Zap className="h-3.5 w-3.5" />
                  Flow: {flowConf.label}
                </span>

                {/* Due date */}
                {item.due_date && (
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    {new Date(item.due_date + "T00:00:00").toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                )}

                {/* Completed at */}
                {item.completed_at && (
                  <span className="flex items-center gap-1 text-emerald-400">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Concluido em{" "}
                    {new Date(item.completed_at).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "short",
                    })}
                  </span>
                )}
              </div>

              {/* Flow strategy tip */}
              {item.flow_strategy && (
                <div className="rounded-lg bg-green-500/10 border border-green-500/20 p-3 mt-2">
                  <p className="text-xs font-medium text-green-300 flex items-center gap-1.5 mb-1">
                    <Sparkles className="h-3.5 w-3.5" />
                    Estrategia de Flow
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {item.flow_strategy}
                  </p>
                </div>
              )}

              {/* Course recommendations */}
              {item.course_recommendations &&
                item.course_recommendations.length > 0 && (
                  <Accordion type="single" collapsible className="mt-2">
                    <AccordionItem
                      value="courses"
                      className="border-white/10"
                    >
                      <AccordionTrigger className="text-xs py-2">
                        <span className="flex items-center gap-1.5">
                          <BookOpen className="h-3.5 w-3.5 text-blue-400" />
                          {item.course_recommendations.length} curso(s)
                          recomendado(s)
                        </span>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-2 pt-1">
                          {item.course_recommendations.map((course) => (
                            <div
                              key={course.id}
                              className="flex items-center justify-between rounded-lg bg-white/5 p-2.5"
                            >
                              <div className="space-y-0.5">
                                <p className="text-xs font-medium">
                                  {course.title}
                                </p>
                                <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                                  {course.platform && (
                                    <span>{course.platform}</span>
                                  )}
                                  {course.duration && (
                                    <span>{course.duration}</span>
                                  )}
                                  {course.rating && (
                                    <span>
                                      {course.rating.toFixed(1)} estrelas
                                    </span>
                                  )}
                                  {course.compatibility_score && (
                                    <Badge
                                      variant="outline"
                                      className="text-[9px] border-emerald-500/30 text-emerald-400"
                                    >
                                      {course.compatibility_score}% match
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              {course.url && (
                                <a
                                  href={course.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                  >
                                    <ExternalLink className="h-3.5 w-3.5" />
                                  </Button>
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
