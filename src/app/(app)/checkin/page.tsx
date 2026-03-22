"use client";

import { useState, useEffect, useCallback } from "react";
import {
  CalendarCheck,
  Send,
  Loader2,
  CheckCircle2,
  Clock,
  MessageSquare,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useUserStore } from "@/store/user";
import { PremiumGate } from "@/components/premium-gate";

interface CheckIn {
  id: string;
  user_id: string;
  pdi_id: string;
  feeling: string | null;
  flow_updates: { activities?: string[] } | null;
  goal_changed: boolean | null;
  notes: string | null;
  created_at: string;
}

const feelingOptions = [
  { value: "very_motivated", emoji: "\u{1F929}", label: "Super motivado(a)" },
  { value: "motivated", emoji: "\u{1F60A}", label: "Motivado(a)" },
  { value: "neutral", emoji: "\u{1F610}", label: "Neutro(a)" },
  { value: "struggling", emoji: "\u{1F615}", label: "Com dificuldades" },
  { value: "overwhelmed", emoji: "\u{1F62B}", label: "Sobrecarregado(a)" },
];

const flowActivities = [
  "Estudar conteudo teorico",
  "Exercicios praticos",
  "Projetos pessoais",
  "Trabalho em equipe",
  "Mentoria/Coaching",
  "Leitura tecnica",
  "Cursos online",
  "Networking",
];

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function feelingDisplay(value: string | null) {
  if (!value) return { emoji: "\u{2753}", label: "Nao informado" };
  const found = feelingOptions.find((f) => f.value === value);
  return found || { emoji: "\u{2753}", label: value };
}

export default function CheckinPage() {
  const user = useUserStore((s) => s.user);

  if (!user?.plan || user.plan === "free") {
    return (
      <PremiumGate
        feature="Acompanhamento e Check-ins"
        description="Com o plano Premium, voce pode registrar check-ins periodicos, acompanhar sua evolucao emocional e receber insights sobre seu progresso no plano de desenvolvimento."
      />
    );
  }

  return <CheckinContent />;
}

function CheckinContent() {
  const user = useUserStore((s) => s.user);
  const [feeling, setFeeling] = useState("");
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [goalChanged, setGoalChanged] = useState(false);
  const [goalNotes, setGoalNotes] = useState("");
  const [notes, setNotes] = useState("");
  const [checkins, setCheckins] = useState<CheckIn[]>([]);
  const [pdiId, setPdiId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  const loadData = useCallback(async () => {
    if (!user?.id) {
      setHistoryLoading(false);
      return;
    }

    try {
      // Fetch PDI (returns { pdis: [...] })
      const pdiRes = await fetch(`/api/pdi?userId=${user.id}`);
      if (pdiRes.ok) {
        const pdiData = await pdiRes.json();
        const pdis = pdiData.pdis || [];
        if (pdis.length > 0 && pdis[0].id) {
          setPdiId(pdis[0].id);
        }
      }

      // Fetch check-in history
      const checkinsRes = await fetch(`/api/checkins?userId=${user.id}`);
      if (checkinsRes.ok) {
        const checkinsData = await checkinsRes.json();
        setCheckins(checkinsData.checkins || []);
      }
    } catch (err) {
      console.error("Error loading checkin data:", err);
    } finally {
      setHistoryLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const toggleActivity = (activity: string) => {
    setSelectedActivities((prev) =>
      prev.includes(activity)
        ? prev.filter((a) => a !== activity)
        : [...prev, activity]
    );
  };

  const handleSubmit = async () => {
    if (!user?.id || !pdiId || !feeling) return;

    setLoading(true);
    try {
      const res = await fetch("/api/checkins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          pdiId,
          feeling,
          flow_updates: { activities: selectedActivities },
          goal_changed: goalChanged,
          notes: goalChanged
            ? `${goalNotes}\n\n${notes}`.trim()
            : notes || null,
        }),
      });

      if (res.ok) {
        setSubmitted(true);
        // Reload history
        const checkinsRes = await fetch(`/api/checkins?userId=${user.id}`);
        if (checkinsRes.ok) {
          const checkinsData = await checkinsRes.json();
          setCheckins(checkinsData.checkins || []);
        }
        // Reset form after delay
        setTimeout(() => {
          setSubmitted(false);
          setFeeling("");
          setSelectedActivities([]);
          setGoalChanged(false);
          setGoalNotes("");
          setNotes("");
        }, 3000);
      }
    } catch (err) {
      console.error("Error submitting checkin:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <CalendarCheck className="h-5 w-5 text-primary" />
          <span className="text-sm text-muted-foreground">Check-in</span>
        </div>
        <h1 className="text-3xl font-bold">
          <span className="bg-gradient-to-r from-green-400 to-lime-400 bg-clip-text text-transparent">
            Check-in de Progresso
          </span>
        </h1>
        <p className="text-muted-foreground">
          Registre como voce esta se sentindo e acompanhe sua evolucao.
        </p>
      </div>

      {/* Success Banner */}
      {submitted && (
        <Card className="border-emerald-500/30 bg-emerald-500/10">
          <CardContent className="flex items-center gap-3 py-4">
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            <p className="text-sm font-medium text-emerald-300">
              Check-in registrado com sucesso!
            </p>
          </CardContent>
        </Card>
      )}

      {/* No PDI Warning */}
      {!pdiId && !historyLoading && (
        <Card className="border-amber-500/30 bg-amber-500/10">
          <CardContent className="flex items-center gap-3 py-4">
            <AlertTriangle className="h-5 w-5 text-amber-400" />
            <p className="text-sm text-amber-300">
              Voce precisa ter um PDI ativo para fazer check-ins. Complete seus
              assessments e gere seu PDI primeiro.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Check-in Form */}
      {pdiId && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left column - Form */}
          <div className="space-y-6">
            {/* Feeling */}
            <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-base">
                  Como voce esta se sentindo com o plano?
                </CardTitle>
                <CardDescription>
                  Selecione o que melhor descreve seu momento atual
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup value={feeling} onValueChange={setFeeling}>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {feelingOptions.map((option) => (
                      <label
                        key={option.value}
                        className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-all ${
                          feeling === option.value
                            ? "border-green-500/50 bg-green-500/10"
                            : "border-white/10 hover:border-white/20 hover:bg-white/5"
                        }`}
                      >
                        <RadioGroupItem value={option.value} className="sr-only" />
                        <span className="text-2xl">{option.emoji}</span>
                        <span className="text-sm font-medium">
                          {option.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Flow Activities */}
            <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-base">
                  Alguma atividade gerou mais flow do que esperado?
                </CardTitle>
                <CardDescription>
                  Selecione as atividades que te deram mais energia
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {flowActivities.map((activity) => (
                    <Badge
                      key={activity}
                      variant="outline"
                      className={`cursor-pointer px-3 py-1.5 text-sm transition-all ${
                        selectedActivities.includes(activity)
                          ? "border-green-500/50 bg-green-500/20 text-green-300"
                          : "border-white/10 hover:border-white/20 hover:bg-white/5"
                      }`}
                      onClick={() => toggleActivity(activity)}
                    >
                      {selectedActivities.includes(activity) && (
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                      )}
                      {activity}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Goal Changed */}
            <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">
                      Seu objetivo mudou?
                    </CardTitle>
                    <CardDescription>
                      Se seu foco mudou, podemos recalibrar seu PDI
                    </CardDescription>
                  </div>
                  <Switch
                    checked={goalChanged}
                    onCheckedChange={setGoalChanged}
                  />
                </div>
              </CardHeader>
              {goalChanged && (
                <CardContent>
                  <Textarea
                    placeholder="Descreva como seu objetivo mudou..."
                    value={goalNotes}
                    onChange={(e) => setGoalNotes(e.target.value)}
                    className="min-h-[80px] border-white/10 bg-white/5"
                  />
                  <p className="mt-2 text-xs text-amber-400">
                    <AlertTriangle className="mr-1 inline h-3 w-3" />
                    Seu PDI sera marcado para recalibracao
                  </p>
                </CardContent>
              )}
            </Card>

            {/* Notes */}
            <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-base">
                  Observacoes adicionais
                </CardTitle>
                <CardDescription>
                  Compartilhe qualquer reflexao sobre seu progresso
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Escreva suas observacoes aqui..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="min-h-[100px] border-white/10 bg-white/5"
                />
              </CardContent>
            </Card>

            {/* Submit */}
            <Button
              onClick={handleSubmit}
              disabled={loading || !feeling || submitted}
              className="w-full bg-gradient-to-r from-green-600 to-lime-600 hover:from-green-700 hover:to-lime-700"
              size="lg"
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : submitted ? (
                <CheckCircle2 className="mr-2 h-4 w-4" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              {submitted ? "Enviado!" : "Registrar Check-in"}
            </Button>
          </div>

          {/* Right column - History */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              Historico de Check-ins
            </h2>

            {historyLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Card
                    key={i}
                    className="border-white/10 bg-white/5 backdrop-blur-sm"
                  >
                    <CardContent className="p-4 space-y-2">
                      <div className="h-4 w-1/3 animate-pulse rounded bg-white/10" />
                      <div className="h-3 w-full animate-pulse rounded bg-white/10" />
                      <div className="h-3 w-2/3 animate-pulse rounded bg-white/10" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : checkins.length === 0 ? (
              <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <MessageSquare className="mb-3 h-8 w-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Nenhum check-in registrado ainda. Faca seu primeiro
                    check-in!
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {checkins.map((checkin) => {
                  const feelingInfo = feelingDisplay(checkin.feeling);
                  return (
                    <Card
                      key={checkin.id}
                      className="border-white/10 bg-white/5 backdrop-blur-sm transition-all hover:border-white/20"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">
                              {feelingInfo.emoji}
                            </span>
                            <span className="text-sm font-medium">
                              {feelingInfo.label}
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(checkin.created_at)}
                          </span>
                        </div>

                        {checkin.flow_updates &&
                          (checkin.flow_updates as { activities?: string[] })
                            .activities &&
                          (
                            checkin.flow_updates as { activities: string[] }
                          ).activities.length > 0 && (
                            <div className="mb-2">
                              <p className="mb-1 text-xs text-muted-foreground">
                                Atividades com flow:
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {(
                                  checkin.flow_updates as {
                                    activities: string[];
                                  }
                                ).activities.map((act) => (
                                  <Badge
                                    key={act}
                                    variant="secondary"
                                    className="bg-green-500/20 text-green-300 text-xs"
                                  >
                                    {act}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                        {checkin.goal_changed && (
                          <Badge
                            variant="outline"
                            className="mb-2 border-amber-500/30 bg-amber-500/10 text-amber-300 text-xs"
                          >
                            <AlertTriangle className="mr-1 h-3 w-3" />
                            Objetivo alterado
                          </Badge>
                        )}

                        {checkin.notes && (
                          <>
                            <Separator className="my-2 bg-white/10" />
                            <p className="text-xs text-muted-foreground line-clamp-3">
                              {checkin.notes}
                            </p>
                          </>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
