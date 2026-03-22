"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";
import {
  Brain,
  Target,
  Zap,
  TrendingUp,
  Lightbulb,
  Sparkles,
  RefreshCw,
  User,
  Briefcase,
  GraduationCap,
  AlertCircle,
  CheckCircle2,
  ArrowUpRight,
  Flame,
  Eye,
  Shield,
  Heart,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useUserStore } from "@/store/user";

// ---- Types ----

interface PersonalityMap {
  mbti_summary: string;
  mbti_type: string;
  mbti_dimensions: Record<string, number>;
  big_five_summary: string;
  big_five_scores: {
    openness: number;
    conscientiousness: number;
    extraversion: number;
    agreeableness: number;
    neuroticism: number;
  };
  disc_summary: string;
  disc_scores: { dominance: number; influence: number; steadiness: number; compliance: number };
  disc_primary: string;
  disc_secondary: string;
  integrated_narrative: string;
}

interface Purpose {
  ikigai_summary: string;
  loves: string[];
  skills: string[];
  world_needs: string[];
  paid_for: string[];
  passion_zone: string;
  mission_zone: string;
  vocation_zone: string;
  profession_zone: string;
  career_alignment: string;
  purpose_statement: string;
}

interface FlowActivity {
  name: string;
  zone: string;
  challenge: number;
  skill: number;
}

interface FlowZone {
  summary: string;
  flow_score: number;
  flow_activities: FlowActivity[];
  triggers: string[];
  blockers: string[];
  ideal_conditions: string;
  recommendations: string[];
}

interface GapItem {
  skill?: string;
  area?: string;
  current_level: number;
  target_level: number;
  priority: string;
  description: string;
}

interface GapAnalysis {
  summary: string;
  job_role: string;
  target_role: string;
  technical_gaps: GapItem[];
  behavioral_gaps: GapItem[];
  experiential_gaps: GapItem[];
}

interface Insight {
  title: string;
  description: string;
  type: "strength" | "opportunity" | "attention" | "synergy";
  related_assessments: string[];
}

interface ProfileData {
  id: string;
  user_id: string;
  personality_map: PersonalityMap;
  purpose: Purpose;
  flow_zone: FlowZone;
  gap_analysis: GapAnalysis;
  readiness_score: number;
  insights: {
    items: Insight[];
    readiness_breakdown: {
      technical: number;
      behavioral: number;
      experiential: number;
      purpose_alignment: number;
      flow_optimization: number;
    };
  };
  created_at: string;
  updated_at: string;
}

interface UserData {
  id: string;
  name: string;
  email: string;
  job_role: string | null;
  target_role: string | null;
  area: string | null;
  experience_years: number | null;
  photo_url: string | null;
  education_level: string | null;
}

// ---- Helpers ----

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.1 } },
};

const zoneColors: Record<string, { bg: string; text: string; border: string }> = {
  flow: { bg: "bg-emerald-500/20", text: "text-emerald-400", border: "border-emerald-500/30" },
  control: { bg: "bg-green-500/20", text: "text-green-400", border: "border-green-500/30" },
  arousal: { bg: "bg-yellow-500/20", text: "text-yellow-400", border: "border-yellow-500/30" },
  anxiety: { bg: "bg-red-500/20", text: "text-red-400", border: "border-red-500/30" },
  worry: { bg: "bg-orange-500/20", text: "text-orange-400", border: "border-orange-500/30" },
  boredom: { bg: "bg-amber-500/20", text: "text-amber-400", border: "border-amber-500/30" },
  apathy: { bg: "bg-gray-500/20", text: "text-gray-400", border: "border-gray-500/30" },
  relaxation: { bg: "bg-blue-500/20", text: "text-blue-400", border: "border-blue-500/30" },
};

const zoneLabels: Record<string, string> = {
  flow: "Flow",
  control: "Controle",
  arousal: "Excitação",
  anxiety: "Ansiedade",
  worry: "Preocupação",
  boredom: "Tédio",
  apathy: "Apatia",
  relaxation: "Relaxamento",
};

const insightIcons: Record<string, typeof Sparkles> = {
  strength: CheckCircle2,
  opportunity: ArrowUpRight,
  attention: AlertCircle,
  synergy: Sparkles,
};

const insightColors: Record<string, string> = {
  strength: "text-emerald-400 bg-emerald-500/20 border-emerald-500/30",
  opportunity: "text-blue-400 bg-blue-500/20 border-blue-500/30",
  attention: "text-amber-400 bg-amber-500/20 border-amber-500/30",
  synergy: "text-purple-400 bg-purple-500/20 border-purple-500/30",
};

const priorityColors: Record<string, string> = {
  high: "bg-red-500/20 text-red-400 border-red-500/30",
  medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  low: "bg-green-500/20 text-green-400 border-green-500/30",
};

// ---- Skeleton ----

function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-lg bg-white/10 ${className ?? ""}`} />
  );
}

function ProfileSkeleton() {
  return (
    <div className="space-y-8">
      <div className="flex items-center gap-6">
        <Skeleton className="h-20 w-20 rounded-full" />
        <div className="space-y-3">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        <Skeleton className="h-48" />
        <Skeleton className="h-48" />
        <Skeleton className="h-48" />
      </div>
      <Skeleton className="h-96" />
    </div>
  );
}

// ---- Circular Progress ----

function CircularProgress({ value, size = 180, strokeWidth = 12 }: { value: number; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  const getColor = (v: number) => {
    if (v >= 75) return { stroke: "#10b981", glow: "0 0 20px rgba(16, 185, 129, 0.5)" };
    if (v >= 50) return { stroke: "#f59e0b", glow: "0 0 20px rgba(245, 158, 11, 0.5)" };
    if (v >= 25) return { stroke: "#f97316", glow: "0 0 20px rgba(249, 115, 22, 0.5)" };
    return { stroke: "#ef4444", glow: "0 0 20px rgba(239, 68, 68, 0.5)" };
  };

  const color = getColor(value);

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color.stroke}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          style={{ filter: `drop-shadow(${color.glow})` }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <motion.span
          className="text-4xl font-bold"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {value}
        </motion.span>
        <span className="text-sm text-muted-foreground">de 100</span>
      </div>
    </div>
  );
}

// ---- Main Component ----

export default function ProfilePage() {
  const storeUser = useUserStore((s) => s.user);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [completedCount, setCompletedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/profile?userId=${userId}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error);
        return;
      }

      setUserData(data.user);
      setProfile(data.profile);
      setCompletedCount(data.completedCount);
    } catch {
      setError("Erro ao carregar perfil.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (storeUser?.id) {
      fetchProfile(storeUser.id);
    }
  }, [storeUser?.id, fetchProfile]);

  const handleGenerate = async () => {
    if (!storeUser?.id) return;
    try {
      setGenerating(true);
      setError(null);
      const res = await fetch("/api/profile/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: storeUser.id }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error);
        return;
      }

      // Refresh profile data
      await fetchProfile(storeUser.id);
    } catch {
      setError("Erro ao gerar perfil. Tente novamente.");
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          <span className="text-sm text-muted-foreground">Perfil Consolidado</span>
        </div>
        <ProfileSkeleton />
      </div>
    );
  }

  const pm = profile?.personality_map;
  const purpose = profile?.purpose;
  const flowZone = profile?.flow_zone;
  const gapAnalysis = profile?.gap_analysis;
  const insights = profile?.insights?.items ?? [];
  const breakdown = profile?.insights?.readiness_breakdown;

  // Chart data
  const bigFiveData = pm?.big_five_scores
    ? [
        { trait: "Abertura", value: pm.big_five_scores.openness, fullMark: 100 },
        { trait: "Conscienciosidade", value: pm.big_five_scores.conscientiousness, fullMark: 100 },
        { trait: "Extroversão", value: pm.big_five_scores.extraversion, fullMark: 100 },
        { trait: "Amabilidade", value: pm.big_five_scores.agreeableness, fullMark: 100 },
        { trait: "Neuroticismo", value: pm.big_five_scores.neuroticism, fullMark: 100 },
      ]
    : [];

  const discData = pm?.disc_scores
    ? [
        { name: "Dominância", value: pm.disc_scores.dominance, color: "#ef4444" },
        { name: "Influência", value: pm.disc_scores.influence, color: "#f59e0b" },
        { name: "Estabilidade", value: pm.disc_scores.steadiness, color: "#10b981" },
        { name: "Conformidade", value: pm.disc_scores.compliance, color: "#3b82f6" },
      ]
    : [];

  const readinessData = breakdown
    ? [
        { name: "Técnico", value: breakdown.technical },
        { name: "Comportamental", value: breakdown.behavioral },
        { name: "Experiência", value: breakdown.experiential },
        { name: "Propósito", value: breakdown.purpose_alignment },
        { name: "Flow", value: breakdown.flow_optimization },
      ]
    : [];

  return (
    <motion.div className="space-y-8 pb-12" initial="initial" animate="animate" variants={stagger}>
      {/* Header */}
      <motion.div {...fadeUp}>
        <div className="flex items-center gap-2 mb-4">
          <Brain className="h-5 w-5 text-primary" />
          <span className="text-sm text-muted-foreground">Intelligence Layer</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 text-2xl font-bold text-white shadow-lg shadow-purple-500/25">
              {userData?.name?.charAt(0)?.toUpperCase() ?? "?"}
            </div>
            <div>
              <h1 className="text-2xl font-bold sm:text-3xl">
                <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
                  {userData?.name ?? "Carregando..."}
                </span>
              </h1>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                {userData?.job_role && (
                  <Badge variant="secondary" className="gap-1">
                    <Briefcase className="h-3 w-3" /> {userData.job_role}
                  </Badge>
                )}
                {userData?.target_role && (
                  <Badge variant="outline" className="gap-1 border-purple-500/30 text-purple-400">
                    <Target className="h-3 w-3" /> Alvo: {userData.target_role}
                  </Badge>
                )}
                {userData?.experience_years != null && (
                  <Badge variant="outline" className="gap-1 border-white/20">
                    <GraduationCap className="h-3 w-3" /> {userData.experience_years} anos
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={generating}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-lg shadow-purple-500/25"
          >
            {generating ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Gerando...
              </>
            ) : profile ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Regerar Perfil
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Gerar Perfil
              </>
            )}
          </Button>
        </div>
      </motion.div>

      {/* Error */}
      {error && (
        <motion.div {...fadeUp}>
          <Card className="border-red-500/30 bg-red-500/10">
            <CardContent className="flex items-center gap-3 p-4">
              <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
              <p className="text-sm text-red-300">{error}</p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* No profile state */}
      {!profile && !error && (
        <motion.div {...fadeUp}>
          <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
            <CardContent className="flex flex-col items-center justify-center p-12 text-center">
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-purple-500/20 to-indigo-500/20">
                <Brain className="h-10 w-10 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Perfil ainda não gerado</h3>
              <p className="text-muted-foreground max-w-md mb-2">
                Complete seus assessments e clique em &quot;Gerar Perfil&quot; para criar sua
                análise consolidada com inteligência artificial.
              </p>
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-purple-400">{completedCount}/5</span> assessments completados
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Profile content */}
      {profile && (
        <>
          {/* Readiness Score Section */}
          <motion.div {...fadeUp} className="grid gap-6 lg:grid-cols-3">
            <Card className="border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-sm lg:col-span-1">
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-lg">Readiness Score</CardTitle>
                <CardDescription>Prontidão para o cargo alvo</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center gap-4">
                <CircularProgress value={profile.readiness_score ?? 0} />
                {userData?.target_role && (
                  <p className="text-center text-sm text-muted-foreground">
                    Para: <span className="font-medium text-foreground">{userData.target_role}</span>
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-sm lg:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Breakdown da Prontidão</CardTitle>
                <CardDescription>Decomposição por dimensão</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {readinessData.map((item) => (
                  <div key={item.name} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span>{item.name}</span>
                      <span className="font-medium text-purple-400">{item.value}%</span>
                    </div>
                    <Progress value={item.value} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          <Separator className="bg-white/10" />

          {/* Personality Map */}
          <motion.div {...fadeUp}>
            <div className="flex items-center gap-2 mb-4">
              <User className="h-5 w-5 text-purple-400" />
              <h2 className="text-xl font-bold">Mapa de Personalidade</h2>
            </div>

            <Tabs defaultValue="integrated" className="space-y-4">
              <TabsList className="bg-white/5 border border-white/10">
                <TabsTrigger value="integrated">Integrado</TabsTrigger>
                <TabsTrigger value="mbti">MBTI</TabsTrigger>
                <TabsTrigger value="bigfive">Big Five</TabsTrigger>
                <TabsTrigger value="disc">DISC</TabsTrigger>
              </TabsList>

              <TabsContent value="integrated">
                <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="prose prose-invert max-w-none">
                      {pm?.integrated_narrative?.split("\n").map((p, i) => (
                        <p key={i} className="text-sm leading-relaxed text-muted-foreground mb-3">
                          {p}
                        </p>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="mbti">
                <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 text-lg font-bold">
                        {pm?.mbti_type ?? "?"}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{pm?.mbti_type ?? "MBTI"}</CardTitle>
                        <CardDescription>Tipo de personalidade Myers-Briggs</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">{pm?.mbti_summary}</p>
                    {pm?.mbti_dimensions && (
                      <div className="grid grid-cols-2 gap-4">
                        {(
                          [
                            ["E", "I", "Extroversão", "Introversão"],
                            ["S", "N", "Sensação", "Intuição"],
                            ["T", "F", "Pensamento", "Sentimento"],
                            ["J", "P", "Julgamento", "Percepção"],
                          ] as const
                        ).map(([a, b, labelA, labelB]) => (
                          <div key={a} className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className={pm.mbti_dimensions[a] >= 50 ? "font-bold text-purple-400" : "text-muted-foreground"}>
                                {a} - {labelA}
                              </span>
                              <span className={pm.mbti_dimensions[b] >= 50 ? "font-bold text-indigo-400" : "text-muted-foreground"}>
                                {b} - {labelB}
                              </span>
                            </div>
                            <div className="relative h-2 w-full overflow-hidden rounded-full bg-white/10">
                              <div
                                className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-500"
                                style={{ width: `${pm.mbti_dimensions[a]}%` }}
                              />
                            </div>
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>{pm.mbti_dimensions[a]}%</span>
                              <span>{pm.mbti_dimensions[b]}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="bigfive">
                <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-lg">Big Five (OCEAN)</CardTitle>
                    <CardDescription>Cinco grandes fatores de personalidade</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">{pm?.big_five_summary}</p>
                    {bigFiveData.length > 0 && (
                      <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                          <RadarChart data={bigFiveData}>
                            <PolarGrid stroke="rgba(255,255,255,0.1)" />
                            <PolarAngleAxis
                              dataKey="trait"
                              tick={{ fill: "rgba(255,255,255,0.7)", fontSize: 12 }}
                            />
                            <PolarRadiusAxis
                              angle={90}
                              domain={[0, 100]}
                              tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }}
                            />
                            <Radar
                              name="Score"
                              dataKey="value"
                              stroke="#a855f7"
                              fill="#a855f7"
                              fillOpacity={0.3}
                              strokeWidth={2}
                            />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="disc">
                <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <Badge className="bg-gradient-to-r from-red-500 to-blue-500 text-white border-0 text-lg px-3 py-1">
                        {pm?.disc_primary}{pm?.disc_secondary}
                      </Badge>
                      <div>
                        <CardTitle className="text-lg">Perfil DISC</CardTitle>
                        <CardDescription>Estilo comportamental e de comunicação</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">{pm?.disc_summary}</p>
                    {discData.length > 0 && (
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={discData} barSize={40}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                            <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.7)", fontSize: 12 }} />
                            <YAxis domain={[0, 100]} tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }} />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "rgba(0,0,0,0.8)",
                                border: "1px solid rgba(255,255,255,0.1)",
                                borderRadius: "8px",
                                color: "white",
                              }}
                            />
                            <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                              {discData.map((entry, idx) => (
                                <Cell key={idx} fill={entry.color} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>

          <Separator className="bg-white/10" />

          {/* Purpose / Ikigai */}
          <motion.div {...fadeUp}>
            <div className="flex items-center gap-2 mb-4">
              <Heart className="h-5 w-5 text-pink-400" />
              <h2 className="text-xl font-bold">Propósito & Ikigai</h2>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Purpose Statement */}
              <Card className="border-white/10 bg-gradient-to-br from-pink-500/10 to-purple-500/10 backdrop-blur-sm md:col-span-2">
                <CardContent className="p-6">
                  <div className="flex items-start gap-3">
                    <Flame className="h-6 w-6 text-pink-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider text-pink-400 mb-2">
                        Declaração de Propósito
                      </p>
                      <p className="text-lg font-medium leading-relaxed">
                        &quot;{purpose?.purpose_statement}&quot;
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Ikigai Quadrants */}
              {[
                { title: "O que ama", items: purpose?.loves, icon: Heart, color: "from-pink-500 to-rose-500", zone: purpose?.passion_zone, zoneLabel: "Zona de Paixão" },
                { title: "No que é bom", items: purpose?.skills, icon: Zap, color: "from-amber-500 to-orange-500", zone: purpose?.profession_zone, zoneLabel: "Zona Profissional" },
                { title: "O que o mundo precisa", items: purpose?.world_needs, icon: Eye, color: "from-cyan-500 to-blue-500", zone: purpose?.mission_zone, zoneLabel: "Zona de Missão" },
                { title: "Pelo que pode ser pago", items: purpose?.paid_for, icon: Briefcase, color: "from-emerald-500 to-green-500", zone: purpose?.vocation_zone, zoneLabel: "Zona de Vocação" },
              ].map((quadrant) => (
                <Card key={quadrant.title} className="border-white/10 bg-white/5 backdrop-blur-sm">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ${quadrant.color}`}>
                        <quadrant.icon className="h-4 w-4 text-white" />
                      </div>
                      <CardTitle className="text-base">{quadrant.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex flex-wrap gap-1.5">
                      {quadrant.items?.map((item, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {item}
                        </Badge>
                      ))}
                    </div>
                    {quadrant.zone && (
                      <div className="rounded-lg bg-white/5 p-3 border border-white/10">
                        <p className="text-xs font-medium text-purple-400 mb-1">{quadrant.zoneLabel}</p>
                        <p className="text-xs text-muted-foreground">{quadrant.zone}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}

              {/* Career Alignment */}
              <Card className="border-white/10 bg-white/5 backdrop-blur-sm md:col-span-2">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Target className="h-4 w-4 text-indigo-400" />
                    Alinhamento com Cargo Alvo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {purpose?.career_alignment}
                  </p>
                </CardContent>
              </Card>
            </div>
          </motion.div>

          <Separator className="bg-white/10" />

          {/* Flow Zone */}
          <motion.div {...fadeUp}>
            <div className="flex items-center gap-2 mb-4">
              <Zap className="h-5 w-5 text-emerald-400" />
              <h2 className="text-xl font-bold">Zona de Flow</h2>
              {flowZone?.flow_score != null && (
                <Badge className="ml-2 bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                  Score: {flowZone.flow_score}/100
                </Badge>
              )}
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Flow Activities */}
              <Card className="border-white/10 bg-white/5 backdrop-blur-sm md:col-span-2">
                <CardHeader>
                  <CardTitle className="text-base">Atividades por Zona</CardTitle>
                  <CardDescription>{flowZone?.summary}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {flowZone?.flow_activities?.map((activity, i) => {
                      const zc = zoneColors[activity.zone] ?? zoneColors.apathy;
                      return (
                        <div
                          key={i}
                          className={`rounded-lg border p-3 ${zc.bg} ${zc.border}`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium">{activity.name}</span>
                            <Badge variant="outline" className={`text-xs ${zc.text} ${zc.border}`}>
                              {zoneLabels[activity.zone] ?? activity.zone}
                            </Badge>
                          </div>
                          <div className="flex gap-4 text-xs text-muted-foreground">
                            <span>Desafio: {activity.challenge}/10</span>
                            <span>Habilidade: {activity.skill}/10</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Triggers */}
              <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    Gatilhos de Flow
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {flowZone?.triggers?.map((trigger, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm">
                        <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />
                        <span className="text-muted-foreground">{trigger}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Blockers */}
              <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Shield className="h-4 w-4 text-red-400" />
                    Bloqueadores de Flow
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {flowZone?.blockers?.map((blocker, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm">
                        <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-red-400 shrink-0" />
                        <span className="text-muted-foreground">{blocker}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Ideal Conditions */}
              <Card className="border-white/10 bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 backdrop-blur-sm md:col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Condições Ideais de Trabalho</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {flowZone?.ideal_conditions}
                  </p>
                </CardContent>
              </Card>

              {/* Recommendations */}
              {flowZone?.recommendations && flowZone.recommendations.length > 0 && (
                <Card className="border-white/10 bg-white/5 backdrop-blur-sm md:col-span-2">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Lightbulb className="h-4 w-4 text-amber-400" />
                      Recomendações para Flow
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {flowZone.recommendations.map((rec, i) => (
                        <div key={i} className="flex items-start gap-2 rounded-lg bg-white/5 p-3 border border-white/10 text-sm">
                          <span className="font-bold text-purple-400 shrink-0">{i + 1}.</span>
                          <span className="text-muted-foreground">{rec}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </motion.div>

          <Separator className="bg-white/10" />

          {/* Gap Analysis */}
          <motion.div {...fadeUp}>
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-blue-400" />
              <h2 className="text-xl font-bold">Análise de Gaps</h2>
            </div>

            {gapAnalysis && (
              <div className="space-y-6">
                <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4 text-sm">
                      <Badge variant="secondary">{gapAnalysis.job_role}</Badge>
                      <ArrowUpRight className="h-4 w-4 text-purple-400" />
                      <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                        {gapAnalysis.target_role}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-3">{gapAnalysis.summary}</p>
                  </CardContent>
                </Card>

                <Tabs defaultValue="technical" className="space-y-4">
                  <TabsList className="bg-white/5 border border-white/10">
                    <TabsTrigger value="technical">Técnicos</TabsTrigger>
                    <TabsTrigger value="behavioral">Comportamentais</TabsTrigger>
                    <TabsTrigger value="experiential">Experiência</TabsTrigger>
                  </TabsList>

                  {(
                    [
                      { key: "technical", items: gapAnalysis.technical_gaps },
                      { key: "behavioral", items: gapAnalysis.behavioral_gaps },
                      { key: "experiential", items: gapAnalysis.experiential_gaps },
                    ] as const
                  ).map(({ key, items }) => (
                    <TabsContent key={key} value={key}>
                      <div className="space-y-3">
                        {items?.map((gap, i) => (
                          <Card key={i} className="border-white/10 bg-white/5 backdrop-blur-sm">
                            <CardContent className="p-4 space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">{gap.skill ?? gap.area}</span>
                                <Badge variant="outline" className={priorityColors[gap.priority] ?? ""}>
                                  {gap.priority === "high" ? "Alta" : gap.priority === "medium" ? "Média" : "Baixa"}
                                </Badge>
                              </div>
                              <div className="space-y-1">
                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                  <span>Atual: {gap.current_level}%</span>
                                  <span>Necessário: {gap.target_level}%</span>
                                </div>
                                <div className="relative h-3 w-full overflow-hidden rounded-full bg-white/10">
                                  <div
                                    className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all"
                                    style={{ width: `${gap.current_level}%` }}
                                  />
                                  <div
                                    className="absolute top-0 h-full w-0.5 bg-white/60"
                                    style={{ left: `${gap.target_level}%` }}
                                  />
                                </div>
                              </div>
                              <p className="text-xs text-muted-foreground">{gap.description}</p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </div>
            )}
          </motion.div>

          <Separator className="bg-white/10" />

          {/* AI Insights */}
          <motion.div {...fadeUp}>
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="h-5 w-5 text-amber-400" />
              <h2 className="text-xl font-bold">Insights da IA</h2>
              <Badge variant="secondary" className="ml-2">
                {insights.length} insights
              </Badge>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {insights.map((insight, i) => {
                const Icon = insightIcons[insight.type] ?? Sparkles;
                const colorClass = insightColors[insight.type] ?? insightColors.synergy;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Card className="border-white/10 bg-white/5 backdrop-blur-sm h-full hover:border-purple-500/30 transition-colors">
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-start gap-3">
                          <div className={`flex h-8 w-8 items-center justify-center rounded-lg border shrink-0 ${colorClass}`}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold">{insight.title}</h4>
                            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                              {insight.description}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-1.5">
                          {insight.related_assessments?.map((a) => (
                            <Badge key={a} variant="outline" className="text-[10px] border-white/20">
                              {a.toUpperCase().replace("_", " ")}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Generated timestamp */}
          <motion.div {...fadeUp} className="text-center">
            <p className="text-xs text-muted-foreground">
              Perfil gerado em{" "}
              {new Date(profile.updated_at).toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
              {" "}com IA (Groq LLaMA 3.3 70B)
            </p>
          </motion.div>
        </>
      )}
    </motion.div>
  );
}
