"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Brain,
  BarChart3,
  Users,
  Compass,
  Waves,
  CheckCircle2,
  Loader2,
  Sparkles,
  Plus,
  X,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useUserStore } from "@/store/user";
import {
  mbtiQuestions,
  bigFiveQuestions,
  discQuestions,
  ikigaiData,
  flowActivities,
  flowQuestions,
  flowTriggers,
  flowBlockers,
  assessmentsMeta,
  type AssessmentType,
} from "@/lib/assessment-data";

const iconMap: Record<AssessmentType, React.ElementType> = {
  mbti: Brain,
  big_five: BarChart3,
  disc: Users,
  ikigai: Compass,
  flow: Waves,
};

// ============================================================
// Main Assessment Page Component
// ============================================================
export default function AssessmentPage() {
  const params = useParams();
  const type = params.type as AssessmentType;
  const meta = assessmentsMeta.find((a) => a.type === type);

  if (!meta) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground">Assessment nao encontrado.</p>
      </div>
    );
  }

  return <AssessmentRunner type={type} />;
}

// ============================================================
// Assessment Runner – orchestrates steps
// ============================================================
function AssessmentRunner({ type }: { type: AssessmentType }) {
  const router = useRouter();
  const user = useUserStore((s) => s.user);
  const meta = assessmentsMeta.find((a) => a.type === type)!;
  const Icon = iconMap[type];

  const [currentStep, setCurrentStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [results, setResults] = useState<Record<string, unknown> | null>(null);

  // Responses state per assessment type
  const [mbtiResponses, setMbtiResponses] = useState<Record<string, string>>({});
  const [bigFiveResponses, setBigFiveResponses] = useState<Record<string, number>>({});
  const [discResponses, setDiscResponses] = useState<Record<string, string>>({});
  const [ikigaiResponses, setIkigaiResponses] = useState<{
    loves: string[];
    skills: string[];
    worldNeeds: string[];
    paidFor: string[];
  }>({ loves: [], skills: [], worldNeeds: [], paidFor: [] });
  const [flowResponseState, setFlowResponseState] = useState<{
    activities: { activityId: number; activityName: string; challenge: number; skill: number }[];
    triggers: string[];
    blockers: string[];
    questionResponses: Record<string, number | string>;
  }>({ activities: [], triggers: [], blockers: [], questionResponses: {} });

  const totalSteps = useMemo(() => {
    switch (type) {
      case "mbti": return mbtiQuestions.length;
      case "big_five": return bigFiveQuestions.length;
      case "disc": return discQuestions.length;
      case "ikigai": return 4;
      case "flow": return 3; // Activities, Triggers+Blockers, Questions
      default: return 1;
    }
  }, [type]);

  const progressPercent = Math.round(((currentStep + 1) / totalSteps) * 100);

  const canGoNext = useMemo(() => {
    switch (type) {
      case "mbti":
        return !!mbtiResponses[String(mbtiQuestions[currentStep]?.id)];
      case "big_five":
        return bigFiveResponses[String(bigFiveQuestions[currentStep]?.id)] !== undefined;
      case "disc":
        return !!discResponses[String(discQuestions[currentStep]?.id)];
      case "ikigai": {
        const keys = ["loves", "skills", "worldNeeds", "paidFor"] as const;
        return ikigaiResponses[keys[currentStep]]?.length > 0;
      }
      case "flow":
        if (currentStep === 0) return flowResponseState.activities.length > 0;
        if (currentStep === 1) return flowResponseState.triggers.length > 0;
        return true;
      default:
        return true;
    }
  }, [type, currentStep, mbtiResponses, bigFiveResponses, discResponses, ikigaiResponses, flowResponseState]);

  const isLastStep = currentStep === totalSteps - 1;

  const handleNext = () => {
    if (isLastStep) {
      handleSubmit();
    } else {
      setCurrentStep((s) => s + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) setCurrentStep((s) => s - 1);
  };

  const handleSubmit = async () => {
    if (!user?.id) return;
    setSubmitting(true);

    let responses: unknown;
    switch (type) {
      case "mbti": responses = mbtiResponses; break;
      case "big_five": responses = bigFiveResponses; break;
      case "disc": responses = discResponses; break;
      case "ikigai": responses = ikigaiResponses; break;
      case "flow": responses = flowResponseState; break;
    }

    try {
      const res = await fetch("/api/assessments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, type, responses }),
      });
      const data = await res.json();
      if (data.results) {
        setResults(data.results);
      }
      setCompleted(true);
    } catch (err) {
      console.error("Failed to submit assessment:", err);
    } finally {
      setSubmitting(false);
    }
  };

  // ---- COMPLETED STATE ----
  if (completed) {
    return (
      <div className="mx-auto space-y-8">
        <div className="text-center space-y-4 pt-8">
          <div className="flex justify-center">
            <div className={`flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br ${meta.gradient} shadow-2xl`}>
              <CheckCircle2 className="h-10 w-10 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold">Assessment Concluido!</h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Seu assessment de <span className="font-semibold text-foreground">{meta.name}</span> foi
            salvo com sucesso. Os resultados ja fazem parte do seu perfil.
          </p>
        </div>

        {/* Results preview */}
        {results && (
          <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-400" />
                Seus Resultados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResultsPreview type={type} results={results} />
            </CardContent>
          </Card>
        )}

        <div className="flex gap-3 justify-center">
          <Button
            variant="outline"
            onClick={() => router.push("/assessments")}
            className="border-white/20"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar aos Assessments
          </Button>
          <Button
            onClick={() => router.push("/profile")}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
          >
            Ver Meu Perfil
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  // ---- ASSESSMENT UI ----
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/assessments")}
          className="shrink-0"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Icon className="h-5 w-5 text-purple-400" />
            <h1 className="text-xl font-bold">{meta.name}</h1>
            {meta.required && (
              <Badge className="bg-violet-500/20 text-violet-300 border-violet-500/30 text-[10px]">
                Obrigatorio
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Progress value={progressPercent} className="h-2 flex-1" />
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {currentStep + 1} / {totalSteps}
            </span>
          </div>
        </div>
      </div>

      {/* Question Card */}
      <div className="transition-all duration-300 ease-in-out">
        {type === "mbti" && (
          <MBTIStep
            step={currentStep}
            responses={mbtiResponses}
            onAnswer={(id, val) => setMbtiResponses((r) => ({ ...r, [id]: val }))}
          />
        )}
        {type === "big_five" && (
          <BigFiveStep
            step={currentStep}
            responses={bigFiveResponses}
            onAnswer={(id, val) => setBigFiveResponses((r) => ({ ...r, [id]: val }))}
          />
        )}
        {type === "disc" && (
          <DISCStep
            step={currentStep}
            responses={discResponses}
            onAnswer={(id, val) => setDiscResponses((r) => ({ ...r, [id]: val }))}
          />
        )}
        {type === "ikigai" && (
          <IkigaiStep
            step={currentStep}
            responses={ikigaiResponses}
            onUpdate={setIkigaiResponses}
          />
        )}
        {type === "flow" && (
          <FlowStep
            step={currentStep}
            state={flowResponseState}
            onUpdate={setFlowResponseState}
          />
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center pt-2">
        <Button
          variant="ghost"
          onClick={handlePrev}
          disabled={currentStep === 0}
          className="text-muted-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Anterior
        </Button>
        <Button
          onClick={handleNext}
          disabled={!canGoNext || submitting}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white px-6"
        >
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : isLastStep ? (
            <>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Finalizar
            </>
          ) : (
            <>
              Proximo
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

// ============================================================
// MBTI Step Component
// ============================================================
function MBTIStep({
  step,
  responses,
  onAnswer,
}: {
  step: number;
  responses: Record<string, string>;
  onAnswer: (id: string, value: string) => void;
}) {
  const q = mbtiQuestions[step];
  if (!q) return null;
  const selected = responses[String(q.id)];

  return (
    <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-lg leading-relaxed">
          <span className="text-purple-400 mr-2">Q{q.id}.</span>
          {q.question}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {[
          { key: "A", text: q.optionA },
          { key: "B", text: q.optionB },
        ].map((opt) => (
          <button
            key={opt.key}
            onClick={() => onAnswer(String(q.id), opt.key)}
            className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${
              selected === opt.key
                ? "border-purple-500 bg-purple-500/15 shadow-lg shadow-purple-500/10"
                : "border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/10"
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold transition-colors ${
                  selected === opt.key
                    ? "border-purple-500 bg-purple-500 text-white"
                    : "border-white/30 text-muted-foreground"
                }`}
              >
                {opt.key}
              </div>
              <span className="text-sm leading-relaxed pt-1">{opt.text}</span>
            </div>
          </button>
        ))}
      </CardContent>
    </Card>
  );
}

// ============================================================
// Big Five Step Component (Likert Scale 1-5)
// ============================================================
function BigFiveStep({
  step,
  responses,
  onAnswer,
}: {
  step: number;
  responses: Record<string, number>;
  onAnswer: (id: string, value: number) => void;
}) {
  const q = bigFiveQuestions[step];
  if (!q) return null;
  const selected = responses[String(q.id)];

  const likertLabels = [
    "Discordo totalmente",
    "Discordo",
    "Neutro",
    "Concordo",
    "Concordo totalmente",
  ];

  return (
    <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-lg leading-relaxed">
          <span className="text-indigo-400 mr-2">Q{q.id}.</span>
          {q.question}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {likertLabels.map((label, idx) => {
            const value = idx + 1;
            const isSelected = selected === value;
            return (
              <button
                key={value}
                onClick={() => onAnswer(String(q.id), value)}
                className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${
                  isSelected
                    ? "border-indigo-500 bg-indigo-500/15 shadow-lg shadow-indigo-500/10"
                    : "border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/10"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold transition-colors ${
                      isSelected
                        ? "border-indigo-500 bg-indigo-500 text-white"
                        : "border-white/30 text-muted-foreground"
                    }`}
                  >
                    {value}
                  </div>
                  <span className="text-sm">{label}</span>
                </div>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================
// DISC Step Component
// ============================================================
function DISCStep({
  step,
  responses,
  onAnswer,
}: {
  step: number;
  responses: Record<string, string>;
  onAnswer: (id: string, value: string) => void;
}) {
  const q = discQuestions[step];
  if (!q) return null;
  const selected = responses[String(q.id)];

  return (
    <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-lg leading-relaxed">
          <span className="text-cyan-400 mr-2">Q{q.id}.</span>
          {q.situation}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {q.options.map((opt, idx) => {
          const isSelected = selected === opt.type;
          return (
            <button
              key={idx}
              onClick={() => onAnswer(String(q.id), opt.type)}
              className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${
                isSelected
                  ? "border-cyan-500 bg-cyan-500/15 shadow-lg shadow-cyan-500/10"
                  : "border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/10"
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold transition-colors ${
                    isSelected
                      ? "border-cyan-500 bg-cyan-500 text-white"
                      : "border-white/30 text-muted-foreground"
                  }`}
                >
                  {String.fromCharCode(65 + idx)}
                </div>
                <span className="text-sm leading-relaxed pt-1">{opt.text}</span>
              </div>
            </button>
          );
        })}
      </CardContent>
    </Card>
  );
}

// ============================================================
// Ikigai Step Component
// ============================================================
function IkigaiStep({
  step,
  responses,
  onUpdate,
}: {
  step: number;
  responses: { loves: string[]; skills: string[]; worldNeeds: string[]; paidFor: string[] };
  onUpdate: (val: typeof responses) => void;
}) {
  const keys = ["loves", "skills", "worldNeeds", "paidFor"] as const;
  const key = keys[step];
  const steps = [ikigaiData.step1, ikigaiData.step2, ikigaiData.step3, ikigaiData.step4];
  const stepData = steps[step];
  const [customText, setCustomText] = useState("");

  const currentItems = responses[key];

  const toggleSuggestion = (item: string) => {
    const updated = currentItems.includes(item)
      ? currentItems.filter((i) => i !== item)
      : [...currentItems, item];
    onUpdate({ ...responses, [key]: updated });
  };

  const addCustom = () => {
    if (customText.trim() && !currentItems.includes(customText.trim())) {
      onUpdate({ ...responses, [key]: [...currentItems, customText.trim()] });
      setCustomText("");
    }
  };

  const removeItem = (item: string) => {
    onUpdate({ ...responses, [key]: currentItems.filter((i) => i !== item) });
  };

  const gradients = [
    "from-pink-500 to-rose-600",
    "from-amber-500 to-orange-600",
    "from-emerald-500 to-teal-600",
    "from-blue-500 to-indigo-600",
  ];

  return (
    <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center gap-2 mb-2">
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ${gradients[step]} text-white text-sm font-bold`}
          >
            {step + 1}
          </div>
          <Badge variant="outline" className="border-white/20 text-xs">
            Etapa {step + 1} de 4
          </Badge>
        </div>
        <CardTitle className="text-xl">{stepData.title}</CardTitle>
        <p className="text-sm text-muted-foreground mt-1">{stepData.subtitle}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Selected items */}
        {currentItems.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {currentItems.map((item) => (
              <Badge
                key={item}
                variant="secondary"
                className="bg-purple-500/20 text-purple-300 border-purple-500/30 px-3 py-1 cursor-pointer hover:bg-purple-500/30"
                onClick={() => removeItem(item)}
              >
                {item}
                <X className="ml-1.5 h-3 w-3" />
              </Badge>
            ))}
          </div>
        )}

        {/* Suggestions */}
        <div>
          <Label className="text-xs text-muted-foreground mb-2 block">
            Selecione as opcoes que se aplicam a voce:
          </Label>
          <div className="grid gap-2 sm:grid-cols-2">
            {stepData.suggestions.map((suggestion) => {
              const isSelected = currentItems.includes(suggestion);
              return (
                <button
                  key={suggestion}
                  onClick={() => toggleSuggestion(suggestion)}
                  className={`text-left text-sm p-3 rounded-lg border transition-all ${
                    isSelected
                      ? "border-purple-500/50 bg-purple-500/10"
                      : "border-white/10 bg-white/5 hover:border-white/30"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Checkbox checked={isSelected} className="pointer-events-none" />
                    <span>{suggestion}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom input */}
        <div className="flex gap-2">
          <Input
            placeholder={stepData.placeholder}
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addCustom()}
            className="bg-white/5 border-white/10"
          />
          <Button
            variant="outline"
            size="icon"
            onClick={addCustom}
            disabled={!customText.trim()}
            className="shrink-0 border-white/20"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================
// Flow Step Component (3 steps)
// ============================================================
function FlowStep({
  step,
  state,
  onUpdate,
}: {
  step: number;
  state: {
    activities: { activityId: number; activityName: string; challenge: number; skill: number }[];
    triggers: string[];
    blockers: string[];
    questionResponses: Record<string, number | string>;
  };
  onUpdate: (val: typeof state) => void;
}) {
  if (step === 0) return <FlowActivitiesStep state={state} onUpdate={onUpdate} />;
  if (step === 1) return <FlowTriggersBlockersStep state={state} onUpdate={onUpdate} />;
  return <FlowQuestionsStep state={state} onUpdate={onUpdate} />;
}

function FlowActivitiesStep({
  state,
  onUpdate,
}: {
  state: {
    activities: { activityId: number; activityName: string; challenge: number; skill: number }[];
    triggers: string[];
    blockers: string[];
    questionResponses: Record<string, number | string>;
  };
  onUpdate: (val: typeof state) => void;
}) {
  const updateActivity = (id: number, name: string, field: "challenge" | "skill", value: number) => {
    const existing = state.activities.find((a) => a.activityId === id);
    if (existing) {
      const updated = state.activities.map((a) =>
        a.activityId === id ? { ...a, [field]: value } : a
      );
      onUpdate({ ...state, activities: updated });
    } else {
      onUpdate({
        ...state,
        activities: [
          ...state.activities,
          { activityId: id, activityName: name, challenge: field === "challenge" ? value : 5, skill: field === "skill" ? value : 5 },
        ],
      });
    }
  };

  const getActivity = (id: number) => state.activities.find((a) => a.activityId === id);

  return (
    <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center gap-2 mb-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 text-white text-sm font-bold">
            1
          </div>
          <Badge variant="outline" className="border-white/20 text-xs">
            Etapa 1 de 3
          </Badge>
        </div>
        <CardTitle className="text-xl">Inventario de Atividades</CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          Para cada atividade profissional, avalie o nivel de <strong>desafio</strong> e de{" "}
          <strong>habilidade</strong> que voce sente (1 = muito baixo, 10 = muito alto).
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {flowActivities.map((activity) => {
          const current = getActivity(activity.id);
          return (
            <div key={activity.id} className="space-y-3 p-4 rounded-xl border border-white/10 bg-white/5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{activity.name}</span>
                <Badge variant="outline" className="border-white/20 text-[10px]">
                  {activity.category}
                </Badge>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label className="text-xs text-muted-foreground">Desafio</Label>
                    <span className="text-xs font-mono text-purple-400">
                      {current?.challenge ?? 5}
                    </span>
                  </div>
                  <Slider
                    min={1}
                    max={10}
                    step={1}
                    value={[current?.challenge ?? 5]}
                    onValueChange={([v]) => updateActivity(activity.id, activity.name, "challenge", v)}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label className="text-xs text-muted-foreground">Habilidade</Label>
                    <span className="text-xs font-mono text-indigo-400">
                      {current?.skill ?? 5}
                    </span>
                  </div>
                  <Slider
                    min={1}
                    max={10}
                    step={1}
                    value={[current?.skill ?? 5]}
                    onValueChange={([v]) => updateActivity(activity.id, activity.name, "skill", v)}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

function FlowTriggersBlockersStep({
  state,
  onUpdate,
}: {
  state: {
    activities: { activityId: number; activityName: string; challenge: number; skill: number }[];
    triggers: string[];
    blockers: string[];
    questionResponses: Record<string, number | string>;
  };
  onUpdate: (val: typeof state) => void;
}) {
  const toggleTrigger = (id: string) => {
    const updated = state.triggers.includes(id)
      ? state.triggers.filter((t) => t !== id)
      : [...state.triggers, id];
    onUpdate({ ...state, triggers: updated });
  };

  const toggleBlocker = (id: string) => {
    const updated = state.blockers.includes(id)
      ? state.blockers.filter((b) => b !== id)
      : [...state.blockers, id];
    onUpdate({ ...state, blockers: updated });
  };

  return (
    <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center gap-2 mb-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 text-white text-sm font-bold">
            2
          </div>
          <Badge variant="outline" className="border-white/20 text-xs">
            Etapa 2 de 3
          </Badge>
        </div>
        <CardTitle className="text-xl">Gatilhos e Bloqueadores de Flow</CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          Selecione os fatores que ajudam voce a entrar em flow e os que atrapalham.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Triggers */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold flex items-center gap-2">
            <span className="text-emerald-400">●</span> Gatilhos de Flow
          </Label>
          <p className="text-xs text-muted-foreground">O que ajuda voce a se concentrar e entrar em estado de flow?</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {flowTriggers.map((trigger) => {
              const isSelected = state.triggers.includes(trigger.id);
              return (
                <div
                  key={trigger.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => toggleTrigger(trigger.id)}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") toggleTrigger(trigger.id); }}
                  className={`cursor-pointer text-left text-sm p-3 rounded-lg border transition-all ${
                    isSelected
                      ? "border-emerald-500/50 bg-emerald-500/10"
                      : "border-white/10 bg-white/5 hover:border-white/30"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Checkbox checked={isSelected} className="pointer-events-none" />
                    <span>{trigger.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Blockers */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold flex items-center gap-2">
            <span className="text-red-400">●</span> Bloqueadores de Flow
          </Label>
          <p className="text-xs text-muted-foreground">O que interrompe sua concentracao e impede o flow?</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {flowBlockers.map((blocker) => {
              const isSelected = state.blockers.includes(blocker.id);
              return (
                <div
                  key={blocker.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => toggleBlocker(blocker.id)}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") toggleBlocker(blocker.id); }}
                  className={`cursor-pointer text-left text-sm p-3 rounded-lg border transition-all ${
                    isSelected
                      ? "border-red-500/50 bg-red-500/10"
                      : "border-white/10 bg-white/5 hover:border-white/30"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Checkbox checked={isSelected} className="pointer-events-none" />
                    <span>{blocker.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function FlowQuestionsStep({
  state,
  onUpdate,
}: {
  state: {
    activities: { activityId: number; activityName: string; challenge: number; skill: number }[];
    triggers: string[];
    blockers: string[];
    questionResponses: Record<string, number | string>;
  };
  onUpdate: (val: typeof state) => void;
}) {
  const updateResponse = (id: string, value: number | string) => {
    onUpdate({
      ...state,
      questionResponses: { ...state.questionResponses, [id]: value },
    });
  };

  const frequencyOptions = ["Raramente", "Poucas vezes", "As vezes", "Frequentemente", "Quase sempre"];
  const likertOptions = ["Discordo totalmente", "Discordo", "Neutro", "Concordo", "Concordo totalmente"];
  const durationOptions = ["Menos de 30 min", "30 min - 1 hora", "1-2 horas", "2-4 horas", "Mais de 4 horas"];
  const timeOptions = ["Manha cedo (6-9h)", "Manha (9-12h)", "Inicio da tarde (12-15h)", "Final da tarde (15-18h)", "Noite (18h+)"];
  const percentageOptions = ["Menos de 20%", "20-40%", "40-60%", "60-80%", "Mais de 80%"];
  const preferenceOptions = ["Fortemente tarefas imediatas", "Mais imediatas", "Equilibrado", "Mais longo prazo", "Fortemente longo prazo"];

  const getOptionsForType = (type: string) => {
    switch (type) {
      case "frequency": return frequencyOptions;
      case "likert": return likertOptions;
      case "duration": return durationOptions;
      case "time_of_day": return timeOptions;
      case "percentage": return percentageOptions;
      case "preference": return preferenceOptions;
      default: return likertOptions;
    }
  };

  return (
    <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center gap-2 mb-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 text-white text-sm font-bold">
            3
          </div>
          <Badge variant="outline" className="border-white/20 text-xs">
            Etapa 3 de 3
          </Badge>
        </div>
        <CardTitle className="text-xl">Perguntas sobre Flow</CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          Responda as perguntas abaixo sobre como voce vivencia o estado de flow no trabalho.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {flowQuestions.map((q) => {
          const options = getOptionsForType(q.type);
          const selected = state.questionResponses[String(q.id)];

          return (
            <div key={q.id} className="space-y-3 p-4 rounded-xl border border-white/10 bg-white/5">
              <p className="text-sm font-medium">
                <span className="text-violet-400 mr-1">{q.id}.</span>
                {q.question}
              </p>
              <RadioGroup
                value={String(selected ?? "")}
                onValueChange={(v) => updateResponse(String(q.id), v)}
                className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3"
              >
                {options.map((opt, idx) => (
                  <label
                    key={idx}
                    className={`flex items-center gap-2 text-sm p-2.5 rounded-lg border cursor-pointer transition-all ${
                      String(selected) === opt
                        ? "border-violet-500/50 bg-violet-500/10"
                        : "border-white/10 hover:border-white/30"
                    }`}
                  >
                    <RadioGroupItem value={opt} />
                    <span>{opt}</span>
                  </label>
                ))}
              </RadioGroup>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

// ============================================================
// Results Preview Component
// ============================================================
function ResultsPreview({ type, results }: { type: AssessmentType; results: Record<string, unknown> }) {
  if (type === "mbti") {
    const r = results as { type: string; dimensions: Record<string, number>; description: string };
    return (
      <div className="space-y-4">
        <div className="text-center">
          <span className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
            {r.type}
          </span>
          <p className="text-sm text-muted-foreground mt-2">{r.description}</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {(["EI", "SN", "TF", "JP"] as const).map((pair) => {
            const left = pair[0];
            const right = pair[1];
            const leftVal = r.dimensions[left] ?? 50;
            const rightVal = r.dimensions[right] ?? 50;
            return (
              <div key={pair} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className={leftVal >= rightVal ? "text-purple-400 font-semibold" : "text-muted-foreground"}>
                    {left} ({leftVal}%)
                  </span>
                  <span className={rightVal > leftVal ? "text-indigo-400 font-semibold" : "text-muted-foreground"}>
                    {right} ({rightVal}%)
                  </span>
                </div>
                <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all"
                    style={{ width: `${leftVal}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (type === "big_five") {
    const r = results as Record<string, number>;
    const traits = [
      { key: "openness", label: "Abertura", color: "from-pink-500 to-rose-500" },
      { key: "conscientiousness", label: "Conscienciosidade", color: "from-amber-500 to-orange-500" },
      { key: "extraversion", label: "Extroversao", color: "from-emerald-500 to-teal-500" },
      { key: "agreeableness", label: "Amabilidade", color: "from-blue-500 to-indigo-500" },
      { key: "neuroticism", label: "Neuroticismo", color: "from-violet-500 to-purple-500" },
    ];
    return (
      <div className="space-y-3">
        {traits.map((t) => (
          <div key={t.key} className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="font-medium">{t.label}</span>
              <span className="text-muted-foreground">{r[t.key]}%</span>
            </div>
            <div className="h-2 rounded-full bg-white/10 overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${t.color} rounded-full transition-all`}
                style={{ width: `${r[t.key]}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === "disc") {
    const r = results as { dominance: number; influence: number; steadiness: number; compliance: number; primary: string; secondary: string };
    const profiles = [
      { key: "dominance", label: "Dominancia (D)", value: r.dominance, color: "text-red-400" },
      { key: "influence", label: "Influencia (I)", value: r.influence, color: "text-amber-400" },
      { key: "steadiness", label: "Estabilidade (S)", value: r.steadiness, color: "text-emerald-400" },
      { key: "compliance", label: "Conformidade (C)", value: r.compliance, color: "text-blue-400" },
    ];
    return (
      <div className="space-y-4">
        <p className="text-center text-sm text-muted-foreground">
          Perfil primario: <span className="font-bold text-foreground">{r.primary}</span> | Secundario:{" "}
          <span className="font-bold text-foreground">{r.secondary}</span>
        </p>
        <div className="space-y-3">
          {profiles.map((p) => (
            <div key={p.key} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className={`font-medium ${p.color}`}>{p.label}</span>
                <span className="text-muted-foreground">{p.value}%</span>
              </div>
              <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all"
                  style={{ width: `${p.value}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === "ikigai") {
    const r = results as { loves: string[]; skills: string[]; worldNeeds: string[]; paidFor: string[]; summary: string };
    return (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">{r.summary}</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { label: "Ama fazer", items: r.loves, color: "text-pink-400" },
            { label: "E bom(boa) em", items: r.skills, color: "text-amber-400" },
            { label: "Mundo precisa", items: r.worldNeeds, color: "text-emerald-400" },
            { label: "Pode ser pago(a)", items: r.paidFor, color: "text-blue-400" },
          ].map((section) => (
            <div key={section.label} className="space-y-1">
              <p className={`text-xs font-semibold ${section.color}`}>{section.label}</p>
              <p className="text-xs text-muted-foreground">{section.items?.length ?? 0} itens selecionados</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === "flow") {
    const r = results as { flowScore: number; summary: string; activities: { zone: string }[] };
    const flowCount = r.activities?.filter((a) => a.zone === "flow").length ?? 0;
    const anxietyCount = r.activities?.filter((a) => a.zone === "anxiety").length ?? 0;
    const boredomCount = r.activities?.filter((a) => a.zone === "boredom").length ?? 0;
    return (
      <div className="space-y-4">
        <div className="text-center">
          <span className="text-4xl font-bold bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
            {r.flowScore}%
          </span>
          <p className="text-xs text-muted-foreground mt-1">Flow Score</p>
        </div>
        <p className="text-sm text-muted-foreground text-center">{r.summary}</p>
        <div className="flex justify-center gap-6 text-xs">
          <div className="text-center">
            <span className="text-emerald-400 font-bold text-lg">{flowCount}</span>
            <p className="text-muted-foreground">em Flow</p>
          </div>
          <div className="text-center">
            <span className="text-amber-400 font-bold text-lg">{boredomCount}</span>
            <p className="text-muted-foreground">Tedio</p>
          </div>
          <div className="text-center">
            <span className="text-red-400 font-bold text-lg">{anxietyCount}</span>
            <p className="text-muted-foreground">Ansiedade</p>
          </div>
        </div>
      </div>
    );
  }

  return <p className="text-sm text-muted-foreground">Resultados salvos com sucesso.</p>;
}
