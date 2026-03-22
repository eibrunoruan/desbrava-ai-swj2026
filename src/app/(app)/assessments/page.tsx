"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Brain,
  BarChart3,
  Users,
  Compass,
  Waves,
  Clock,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useUserStore } from "@/store/user";
import { assessmentsMeta, type AssessmentType } from "@/lib/assessment-data";

const iconMap: Record<AssessmentType, React.ElementType> = {
  mbti: Brain,
  big_five: BarChart3,
  disc: Users,
  ikigai: Compass,
  flow: Waves,
};

type AssessmentStatus = "pending" | "in_progress" | "completed";

interface AssessmentRecord {
  id: string;
  type: AssessmentType;
  status: AssessmentStatus;
  completed_at: string | null;
}

export default function AssessmentsPage() {
  const user = useUserStore((s) => s.user);
  const [assessments, setAssessments] = useState<AssessmentRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    const fetchAssessments = async () => {
      try {
        const res = await fetch(`/api/assessments?userId=${user.id}`);
        const data = await res.json();
        if (data.assessments) {
          setAssessments(data.assessments);
        }
      } catch (err) {
        console.error("Failed to fetch assessments:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAssessments();
  }, [user?.id]);

  const getStatus = (type: AssessmentType): AssessmentStatus => {
    const found = assessments.find((a) => a.type === type);
    return found?.status ?? "pending";
  };

  const completedCount = assessments.filter((a) => a.status === "completed").length;
  const totalCount = assessmentsMeta.length;
  const progressPercent = Math.round((completedCount / totalCount) * 100);

  const statusConfig: Record<AssessmentStatus, { label: string; variant: "default" | "secondary" | "outline"; className: string }> = {
    pending: { label: "Pendente", variant: "outline", className: "border-white/20 text-muted-foreground" },
    in_progress: { label: "Em andamento", variant: "secondary", className: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
    completed: { label: "Concluído", variant: "default", className: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <span className="text-sm text-muted-foreground">Assessments</span>
        </div>
        <h1 className="text-3xl font-bold">
          Assessments de{" "}
          <span className="bg-gradient-to-r from-green-400 to-lime-400 bg-clip-text text-transparent">
            Autoconhecimento
          </span>
        </h1>
        <p className="text-muted-foreground max-w-2xl">
          Complete os assessments abaixo para construir seu perfil completo. Cada um revela
          uma dimensao diferente sobre voce, suas preferencias e seu potencial.
        </p>
      </div>

      {/* Progress overview */}
      <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-lime-600">
                <CheckCircle2 className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium">Progresso Geral</p>
                <p className="text-xs text-muted-foreground">
                  {completedCount} de {totalCount} assessments concluidos
                </p>
              </div>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-green-400 to-lime-400 bg-clip-text text-transparent">
              {progressPercent}%
            </span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </CardContent>
      </Card>

      {/* Assessment cards */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-green-400" />
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {assessmentsMeta.map((meta) => {
            const Icon = iconMap[meta.type];
            const status = getStatus(meta.type);
            const config = statusConfig[status];
            const isCompleted = status === "completed";

            return (
              <Card
                key={meta.type}
                className={`group relative overflow-hidden border-white/10 bg-white/5 backdrop-blur-sm transition-all duration-300 hover:border-green-500/30 hover:shadow-lg hover:shadow-green-500/5 ${
                  isCompleted ? "opacity-80" : ""
                }`}
              >
                {/* Required badge */}
                {meta.required && (
                  <div className="absolute top-3 right-3">
                    <Badge className="bg-lime-500/20 text-lime-300 border-lime-500/30 text-[10px] font-bold uppercase tracking-wider">
                      Obrigatorio
                    </Badge>
                  </div>
                )}

                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${meta.gradient} shadow-lg`}
                    >
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <Badge variant="outline" className={config.className}>
                      {config.label}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{meta.name}</CardTitle>
                  <CardDescription className="text-xs leading-relaxed">
                    {meta.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Meta info */}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      <span>~{meta.estimatedMinutes} min</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <BarChart3 className="h-3.5 w-3.5" />
                      <span>
                        {meta.type === "ikigai"
                          ? "4 etapas"
                          : `${meta.questionCount} questoes`}
                      </span>
                    </div>
                  </div>

                  {/* Action button */}
                  <Link href={`/assessments/${meta.type}`}>
                    <Button
                      className={`w-full group/btn ${
                        isCompleted
                          ? "bg-white/10 hover:bg-white/20 text-foreground"
                          : meta.required
                            ? "bg-gradient-to-r from-lime-600 to-green-600 hover:from-lime-500 hover:to-green-500 text-white shadow-lg shadow-green-500/25"
                            : "bg-white/10 hover:bg-white/20 text-foreground"
                      }`}
                      variant={isCompleted ? "outline" : "default"}
                    >
                      {isCompleted ? (
                        <>
                          <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-400" />
                          Refazer Assessment
                        </>
                      ) : status === "in_progress" ? (
                        <>
                          Continuar
                          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                        </>
                      ) : (
                        <>
                          Iniciar Assessment
                          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                        </>
                      )}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
