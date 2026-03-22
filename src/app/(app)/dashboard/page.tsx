"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ClipboardCheck,
  Route,
  Gauge,
  ArrowRight,
  Sparkles,
  BookOpen,
  CalendarCheck,
  TrendingUp,
  CheckCircle2,
  Circle,
  Clock,
  Target,
  Loader2,
  AlertCircle,
  Zap,
  Crown,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  RadialBarChart,
  RadialBar,
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useUserStore } from "@/store/user";

interface Assessment {
  id: string;
  type: "mbti" | "big_five" | "disc" | "ikigai" | "flow";
  status: "pending" | "in_progress" | "completed";
  completed_at: string | null;
}

interface Pdi {
  id: string;
  status: "draft" | "active" | "completed";
  modules: unknown;
}

interface PdiItem {
  id: string;
  module: "foundation" | "specialization" | "consolidation";
  title: string;
  status: "pending" | "in_progress" | "completed";
  type: string;
}

interface CheckIn {
  id: string;
  feeling: string | null;
  created_at: string;
  goal_changed: boolean | null;
}

interface ConsolidatedProfile {
  readiness_score: number | null;
}

const assessmentLabels: Record<string, { label: string; icon: string }> = {
  mbti: { label: "MBTI", icon: "\u{1F9E0}" },
  big_five: { label: "Big Five", icon: "\u{1F31F}" },
  disc: { label: "DISC", icon: "\u{1F3AF}" },
  ikigai: { label: "Ikigai", icon: "\u{1F338}" },
  flow: { label: "Flow", icon: "\u{26A1}" },
};

const moduleLabels: Record<string, string> = {
  foundation: "Fundacao",
  specialization: "Especializacao",
  consolidation: "Consolidacao",
};

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function DashboardPage() {
  const user = useUserStore((s) => s.user);
  const displayName = user?.name?.split(" ")[0] || "Explorador(a)";

  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [pdi, setPdi] = useState<Pdi | null>(null);
  const [pdiItems, setPdiItems] = useState<PdiItem[]>([]);
  const [checkins, setCheckins] = useState<CheckIn[]>([]);
  const [profile, setProfile] = useState<ConsolidatedProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      const [assessRes, pdiRes, checkinsRes, profileRes] = await Promise.allSettled([
        fetch(`/api/assessments?userId=${user.id}`),
        fetch(`/api/pdi?userId=${user.id}`),
        fetch(`/api/checkins?userId=${user.id}`),
        fetch(`/api/profile?userId=${user.id}`),
      ]);

      if (assessRes.status === "fulfilled" && assessRes.value.ok) {
        const data = await assessRes.value.json();
        setAssessments(data.assessments || []);
      }

      if (pdiRes.status === "fulfilled" && pdiRes.value.ok) {
        const data = await pdiRes.value.json();
        const pdis = data.pdis || [];
        if (pdis.length > 0) {
          const activePdi = pdis[0];
          setPdi(activePdi);
          setPdiItems(activePdi.items || []);
        }
      }

      if (checkinsRes.status === "fulfilled" && checkinsRes.value.ok) {
        const data = await checkinsRes.value.json();
        setCheckins(data.checkins || []);
      }

      if (profileRes.status === "fulfilled" && profileRes.value.ok) {
        const data = await profileRes.value.json();
        setProfile(data.profile || null);
      }
    } catch (err) {
      console.error("Error loading dashboard data:", err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  useEffect(() => {
    fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event_type: "page_view", page: "dashboard" }),
    }).catch(() => {});
  }, []);

  // Computed values
  const completedAssessments = assessments.filter(
    (a) => a.status === "completed"
  ).length;
  const totalAssessments = 5;
  const assessmentProgress = Math.round(
    (completedAssessments / totalAssessments) * 100
  );

  const completedItems = pdiItems.filter(
    (i) => i.status === "completed"
  ).length;
  const totalItems = pdiItems.length;
  const pdiProgress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  const readinessScore = profile?.readiness_score ?? 0;

  const lastCheckin = checkins[0];
  const daysSinceCheckin = lastCheckin
    ? Math.floor(
        (Date.now() - new Date(lastCheckin.created_at).getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : null;
  const needsCheckin = daysSinceCheckin === null || daysSinceCheckin > 30;

  // Module progress
  const moduleProgress = (module: string) => {
    const items = pdiItems.filter((i) => i.module === module);
    if (items.length === 0) return 0;
    const done = items.filter((i) => i.status === "completed").length;
    return Math.round((done / items.length) * 100);
  };

  // Readiness chart data
  const readinessChartData = [
    {
      name: "score",
      value: readinessScore,
      fill: readinessScore >= 70
        ? "#8b5cf6"
        : readinessScore >= 40
        ? "#6366f1"
        : "#a78bfa",
    },
  ];

  // Recent activity
  const recentActivity = [
    ...assessments
      .filter((a) => a.completed_at)
      .map((a) => ({
        type: "assessment" as const,
        label: `Assessment ${assessmentLabels[a.type]?.label || a.type} concluido`,
        date: a.completed_at!,
        icon: ClipboardCheck,
      })),
    ...checkins.slice(0, 3).map((c) => ({
      type: "checkin" as const,
      label: `Check-in registrado`,
      date: c.created_at,
      icon: CalendarCheck,
    })),
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  // Next actions
  const nextActions = [];
  if (completedAssessments < totalAssessments) {
    const missing = ["mbti", "big_five", "disc", "ikigai", "flow"].filter(
      (t) => !assessments.find((a) => a.type === t && a.status === "completed")
    );
    if (missing.length > 0) {
      nextActions.push({
        label: `Completar Assessment ${assessmentLabels[missing[0]]?.label || missing[0]}`,
        href: "/assessments",
        priority: "high" as const,
      });
    }
  }
  if (!pdi && completedAssessments >= 4) {
    nextActions.push({
      label: "Gerar seu Plano de Desenvolvimento (PDI)",
      href: "/pdi",
      priority: "high" as const,
    });
  }
  if (pdi && needsCheckin) {
    nextActions.push({
      label: "Fazer check-in de progresso",
      href: "/checkin",
      priority: "medium" as const,
    });
  }
  if (pdi && pdiItems.some((i) => i.type === "course" && i.status === "pending")) {
    nextActions.push({
      label: "Explorar cursos recomendados",
      href: "/courses",
      priority: "low" as const,
    });
  }

  // Trend data for mini chart
  const trendData = checkins
    .slice(0, 7)
    .reverse()
    .map((c, i) => ({
      name: `${i + 1}`,
      score:
        c.feeling === "very_motivated"
          ? 100
          : c.feeling === "motivated"
          ? 80
          : c.feeling === "neutral"
          ? 60
          : c.feeling === "struggling"
          ? 40
          : c.feeling === "overwhelmed"
          ? 20
          : 50,
    }));

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-green-400" />
          <p className="text-sm text-muted-foreground">
            Carregando seu dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-8"
      initial="initial"
      animate="animate"
      variants={stagger}
    >
      {/* Welcome Section */}
      <motion.div className="space-y-2" variants={fadeInUp}>
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <span className="text-sm text-muted-foreground">Dashboard</span>
        </div>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              Ola,{" "}
              <span className="bg-gradient-to-r from-green-400 to-lime-400 bg-clip-text text-transparent">
                {displayName}
              </span>
              !
            </h1>
            <p className="text-muted-foreground">
              Acompanhe seu progresso e continue sua jornada de desenvolvimento.
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-green-400" />
              <span>
                {completedAssessments}/{totalAssessments} assessments
              </span>
            </div>
            {pdi && (
              <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                <Route className="h-3.5 w-3.5 text-lime-400" />
                <span>{pdiProgress}% PDI</span>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Premium Upgrade Banner */}
      {(!user?.plan || user.plan === "free") && (
        <motion.div variants={fadeInUp}>
          <Card className="overflow-hidden border-green-500/20 bg-gradient-to-r from-green-500/10 via-lime-500/10 to-lime-500/10">
            <CardContent className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-green-500/30 to-lime-500/30 ring-1 ring-green-500/30">
                  <Crown className="h-6 w-6 text-green-400" />
                </div>
                <div>
                  <p className="font-semibold">Upgrade para Premium</p>
                  <p className="text-sm text-muted-foreground">
                    Desbloqueie PDI personalizado, curadoria de cursos e mais
                  </p>
                </div>
              </div>
              <Link href="/pricing">
                <Button className="bg-gradient-to-r from-green-600 to-lime-600 hover:from-green-700 hover:to-lime-700 shadow-lg shadow-green-500/20">
                  <Crown className="mr-2 h-4 w-4" />
                  Ver Planos
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Check-in Reminder */}
      {needsCheckin && pdi && (
        <motion.div variants={fadeInUp}>
          <Card className="border-amber-500/20 bg-gradient-to-r from-amber-500/10 to-orange-500/10">
            <CardContent className="flex items-center justify-between py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/20">
                  <AlertCircle className="h-5 w-5 text-amber-400" />
                </div>
                <div>
                  <p className="text-sm font-medium">
                    {daysSinceCheckin === null
                      ? "Voce ainda nao fez nenhum check-in"
                      : `Faz ${daysSinceCheckin} dias desde seu ultimo check-in`}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Check-ins regulares ajudam a manter seu plano atualizado
                  </p>
                </div>
              </div>
              <Link href="/checkin">
                <Button
                  size="sm"
                  className="bg-amber-500/20 text-amber-300 hover:bg-amber-500/30"
                >
                  Fazer Check-in
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Stats Grid */}
      <motion.div
        className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        variants={stagger}
      >
        {/* Assessment Progress */}
        <motion.div variants={fadeInUp}>
          <Card className="group relative overflow-hidden border-white/10 bg-white/5 backdrop-blur-sm transition-all hover:border-green-500/30 hover:shadow-lg hover:shadow-green-500/5">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-lime-500">
                  <ClipboardCheck className="h-5 w-5 text-white" />
                </div>
                <Link href="/assessments">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
              <CardTitle className="text-base">Assessments</CardTitle>
              <CardDescription className="text-xs">
                Complete seus assessments de autoconhecimento
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Progress value={assessmentProgress} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {completedAssessments} de {totalAssessments} concluidos
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* PDI Progress */}
        <motion.div variants={fadeInUp}>
          <Card className="group relative overflow-hidden border-white/10 bg-white/5 backdrop-blur-sm transition-all hover:border-green-500/30 hover:shadow-lg hover:shadow-green-500/5">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-lime-500 to-blue-500">
                  <Route className="h-5 w-5 text-white" />
                </div>
                <Link href="/pdi">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
              <CardTitle className="text-base">Meu PDI</CardTitle>
              <CardDescription className="text-xs">
                Progresso no seu Plano de Desenvolvimento
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Progress value={pdiProgress} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {pdi
                  ? `${completedItems} de ${totalItems} atividades concluidas`
                  : "Aguardando assessments"}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Readiness Score */}
        <motion.div variants={fadeInUp}>
          <Card className="group relative overflow-hidden border-white/10 bg-white/5 backdrop-blur-sm transition-all hover:border-green-500/30 hover:shadow-lg hover:shadow-green-500/5">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-lime-500 to-green-500">
                  <Gauge className="h-5 w-5 text-white" />
                </div>
                <Link href="/profile">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
              <CardTitle className="text-base">Readiness Score</CardTitle>
              <CardDescription className="text-xs">
                Sua pontuacao de prontidao profissional
              </CardDescription>
            </CardHeader>
            <CardContent>
              {readinessScore > 0 ? (
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadialBarChart
                        innerRadius="70%"
                        outerRadius="100%"
                        data={readinessChartData}
                        startAngle={90}
                        endAngle={-270}
                      >
                        <RadialBar
                          dataKey="value"
                          cornerRadius={10}
                          background={{ fill: "rgba(255,255,255,0.05)" }}
                        />
                      </RadialBarChart>
                    </ResponsiveContainer>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-400">
                      {readinessScore}
                    </p>
                    <p className="text-xs text-muted-foreground">de 100</p>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Ainda nao calculado
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Assessment Details + PDI Modules */}
      <motion.div
        className="grid gap-6 lg:grid-cols-2"
        variants={stagger}
      >
        {/* Assessment Status */}
        <motion.div variants={fadeInUp}>
          <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <ClipboardCheck className="h-4 w-4 text-green-400" />
                Status dos Assessments
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {["mbti", "big_five", "disc", "ikigai", "flow"].map((type) => {
                const assessment = assessments.find((a) => a.type === type);
                const info = assessmentLabels[type];
                const isCompleted = assessment?.status === "completed";
                const isInProgress = assessment?.status === "in_progress";

                return (
                  <div
                    key={type}
                    className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] p-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{info.icon}</span>
                      <span className="text-sm font-medium">{info.label}</span>
                    </div>
                    {isCompleted ? (
                      <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                        Concluido
                      </Badge>
                    ) : isInProgress ? (
                      <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                        <Clock className="mr-1 h-3 w-3" />
                        Em progresso
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="border-white/10 text-muted-foreground"
                      >
                        <Circle className="mr-1 h-3 w-3" />
                        Pendente
                      </Badge>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </motion.div>

        {/* PDI Module Progress */}
        <motion.div variants={fadeInUp}>
          <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Route className="h-4 w-4 text-lime-400" />
                Progresso por Modulo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {pdi ? (
                (["foundation", "specialization", "consolidation"] as const).map(
                  (module) => {
                    const progress = moduleProgress(module);
                    const items = pdiItems.filter((i) => i.module === module);
                    const completed = items.filter(
                      (i) => i.status === "completed"
                    ).length;

                    return (
                      <div key={module} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">
                            {moduleLabels[module]}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {completed}/{items.length}
                          </span>
                        </div>
                        <Progress
                          value={progress}
                          className="h-2"
                        />
                      </div>
                    );
                  }
                )
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Target className="mb-3 h-8 w-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Complete seus assessments para gerar seu PDI
                  </p>
                  <Link href="/assessments" className="mt-3">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-green-500/30 hover:bg-green-500/10"
                    >
                      Ir para Assessments
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Mood Trend + Recent Activity */}
      <motion.div
        className="grid gap-6 lg:grid-cols-2"
        variants={stagger}
      >
        {/* Mood Trend */}
        {trendData.length > 1 && (
          <motion.div variants={fadeInUp}>
            <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-400" />
                  Tendencia de Motivacao
                </CardTitle>
                <CardDescription className="text-xs">
                  Baseado nos seus ultimos check-ins
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[160px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendData}>
                      <defs>
                        <linearGradient
                          id="colorScore"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#8b5cf6"
                            stopOpacity={0.3}
                          />
                          <stop
                            offset="95%"
                            stopColor="#8b5cf6"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <XAxis
                        dataKey="name"
                        stroke="rgba(255,255,255,0.1)"
                        tick={{ fontSize: 11, fill: "rgba(255,255,255,0.4)" }}
                      />
                      <YAxis
                        domain={[0, 100]}
                        stroke="rgba(255,255,255,0.1)"
                        tick={{ fontSize: 11, fill: "rgba(255,255,255,0.4)" }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "rgba(15,15,30,0.9)",
                          border: "1px solid rgba(139,92,246,0.3)",
                          borderRadius: "8px",
                          fontSize: "12px",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="score"
                        stroke="#8b5cf6"
                        strokeWidth={2}
                        fill="url(#colorScore)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Recent Activity */}
        <motion.div variants={fadeInUp}>
          <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-400" />
                Atividade Recente
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentActivity.length > 0 ? (
                <div className="space-y-3">
                  {recentActivity.map((activity, index) => (
                    <div key={index}>
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/5">
                          <activity.icon className="h-4 w-4 text-green-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm truncate">{activity.label}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(activity.date).toLocaleDateString(
                              "pt-BR",
                              {
                                day: "2-digit",
                                month: "short",
                              }
                            )}
                          </p>
                        </div>
                      </div>
                      {index < recentActivity.length - 1 && (
                        <Separator className="mt-3 bg-white/5" />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Clock className="mb-3 h-8 w-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Nenhuma atividade recente
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Next Actions */}
      {nextActions.length > 0 && (
        <motion.div className="space-y-4" variants={fadeInUp}>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Target className="h-4 w-4 text-green-400" />
            Proximos Passos
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {nextActions.map((action, index) => (
              <Link key={index} href={action.href}>
                <Card className="group h-full cursor-pointer border-white/10 bg-white/5 backdrop-blur-sm transition-all hover:border-green-500/30 hover:bg-white/10">
                  <CardContent className="flex items-center gap-3 p-4">
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                        action.priority === "high"
                          ? "bg-green-500/20"
                          : action.priority === "medium"
                          ? "bg-lime-500/20"
                          : "bg-lime-500/20"
                      }`}
                    >
                      <ArrowRight
                        className={`h-4 w-4 ${
                          action.priority === "high"
                            ? "text-green-400"
                            : action.priority === "medium"
                            ? "text-lime-400"
                            : "text-lime-400"
                        }`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {action.label}
                      </p>
                      <Badge
                        variant="outline"
                        className={`mt-1 text-xs ${
                          action.priority === "high"
                            ? "border-green-500/30 text-green-400"
                            : action.priority === "medium"
                            ? "border-lime-500/30 text-lime-400"
                            : "border-lime-500/30 text-lime-400"
                        }`}
                      >
                        {action.priority === "high"
                          ? "Prioridade alta"
                          : action.priority === "medium"
                          ? "Recomendado"
                          : "Sugerido"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </motion.div>
      )}

      {/* Quick Action Buttons */}
      <motion.div variants={fadeInUp}>
        <Separator className="bg-white/10" />
        <div className="flex flex-wrap gap-3 pt-6">
          <Link href="/assessments">
            <Button
              variant="outline"
              className="border-green-500/30 hover:bg-green-500/10"
            >
              <ClipboardCheck className="mr-2 h-4 w-4" />
              Continuar Assessment
            </Button>
          </Link>
          <Link href="/pdi">
            <Button
              variant="outline"
              className="border-lime-500/30 hover:bg-lime-500/10"
            >
              <Route className="mr-2 h-4 w-4" />
              Ver PDI
            </Button>
          </Link>
          <Link href="/checkin">
            <Button
              variant="outline"
              className="border-lime-500/30 hover:bg-lime-500/10"
            >
              <CalendarCheck className="mr-2 h-4 w-4" />
              Fazer Check-in
            </Button>
          </Link>
          <Link href="/courses">
            <Button
              variant="outline"
              className="border-fuchsia-500/30 hover:bg-fuchsia-500/10"
            >
              <BookOpen className="mr-2 h-4 w-4" />
              Explorar Cursos
            </Button>
          </Link>
        </div>
      </motion.div>
    </motion.div>
  );
}
