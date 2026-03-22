// ============================================================
// Assessment Scoring Functions – Desbrava.Ai
// ============================================================

import type { Json } from "@/lib/supabase/types";
import { mbtiQuestions, bigFiveQuestions, discQuestions } from "./assessment-data";

// ============================================================
// MBTI Scoring
// ============================================================
export interface MBTIResult {
  type: string; // e.g. "INTJ"
  dimensions: {
    E: number; I: number;
    S: number; N: number;
    T: number; F: number;
    J: number; P: number;
  };
  description: string;
}

const mbtiDescriptions: Record<string, string> = {
  ISTJ: "O Logístico — Prático, responsável e meticuloso. Valoriza tradições e lealdade.",
  ISFJ: "O Defensor — Dedicado, caloroso e protetor. Sempre disposto a ajudar os outros.",
  INFJ: "O Advogado — Idealista, organizado e perspicaz. Busca significado em tudo.",
  INTJ: "O Arquiteto — Estratégico, independente e determinado. Visão de longo prazo.",
  ISTP: "O Virtuoso — Curioso, prático e observador. Excelente solucionador de problemas.",
  ISFP: "O Aventureiro — Artístico, sensível e explorador. Vive o momento presente.",
  INFP: "O Mediador — Idealista, empático e criativo. Guiado por valores profundos.",
  INTP: "O Lógico — Inventivo, analítico e objetivo. Ama teorias e ideias abstratas.",
  ESTP: "O Empreendedor — Energético, pragmático e perceptivo. Adora ação e desafios.",
  ESFP: "O Animador — Espontâneo, entusiasmado e divertido. Ama estar com pessoas.",
  ENFP: "O Ativista — Entusiasta, criativo e sociável. Vê possibilidades em tudo.",
  ENTP: "O Inovador — Esperto, curioso e estratégico. Adora debates intelectuais.",
  ESTJ: "O Executivo — Organizado, lógico e assertivo. Líder nato que valoriza ordem.",
  ESFJ: "O Cônsul — Carinhoso, social e cooperativo. Se preocupa genuinamente com os outros.",
  ENFJ: "O Protagonista — Carismático, inspirador e altruísta. Líder natural de pessoas.",
  ENTJ: "O Comandante — Ousado, imaginativo e determinado. Sempre encontra um caminho.",
};

export function scoreMBTI(responses: Record<string, string>): MBTIResult {
  const counts = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };

  mbtiQuestions.forEach((q) => {
    const answer = responses[String(q.id)]; // "A" or "B"
    const dim = q.dimension;
    if (answer === "A") {
      counts[dim[0] as keyof typeof counts]++;
    } else if (answer === "B") {
      counts[dim[1] as keyof typeof counts]++;
    }
  });

  // Convert to percentages per dimension pair
  const pct = (a: number, b: number) => {
    const total = a + b || 1;
    return { aPct: Math.round((a / total) * 100), bPct: Math.round((b / total) * 100) };
  };

  const ei = pct(counts.E, counts.I);
  const sn = pct(counts.S, counts.N);
  const tf = pct(counts.T, counts.F);
  const jp = pct(counts.J, counts.P);

  const type =
    (ei.aPct >= 50 ? "E" : "I") +
    (sn.aPct >= 50 ? "S" : "N") +
    (tf.aPct >= 50 ? "T" : "F") +
    (jp.aPct >= 50 ? "J" : "P");

  return {
    type,
    dimensions: {
      E: ei.aPct, I: ei.bPct,
      S: sn.aPct, N: sn.bPct,
      T: tf.aPct, F: tf.bPct,
      J: jp.aPct, P: jp.bPct,
    },
    description: mbtiDescriptions[type] || "Perfil único com combinação equilibrada de preferências.",
  };
}

// ============================================================
// Big Five Scoring
// ============================================================
export interface BigFiveResult {
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
}

export function scoreBigFive(responses: Record<string, number>): BigFiveResult {
  const traits: Record<string, { total: number; count: number }> = {
    openness: { total: 0, count: 0 },
    conscientiousness: { total: 0, count: 0 },
    extraversion: { total: 0, count: 0 },
    agreeableness: { total: 0, count: 0 },
    neuroticism: { total: 0, count: 0 },
  };

  bigFiveQuestions.forEach((q) => {
    const rawScore = responses[String(q.id)];
    if (rawScore === undefined) return;
    const score = q.reversed ? 6 - rawScore : rawScore; // reverse: 1→5, 2→4, 3→3, 4→2, 5→1
    traits[q.trait].total += score;
    traits[q.trait].count++;
  });

  const normalize = (total: number, count: number) => {
    if (count === 0) return 50;
    return Math.round(((total / count - 1) / 4) * 100); // 1-5 → 0-100
  };

  return {
    openness: normalize(traits.openness.total, traits.openness.count),
    conscientiousness: normalize(traits.conscientiousness.total, traits.conscientiousness.count),
    extraversion: normalize(traits.extraversion.total, traits.extraversion.count),
    agreeableness: normalize(traits.agreeableness.total, traits.agreeableness.count),
    neuroticism: normalize(traits.neuroticism.total, traits.neuroticism.count),
  };
}

// ============================================================
// DISC Scoring
// ============================================================
export interface DISCResult {
  dominance: number;
  influence: number;
  steadiness: number;
  compliance: number;
  primary: "D" | "I" | "S" | "C";
  secondary: "D" | "I" | "S" | "C";
}

export function scoreDISC(responses: Record<string, string>): DISCResult {
  const counts = { D: 0, I: 0, S: 0, C: 0 };
  const totalQuestions = discQuestions.length;

  discQuestions.forEach((q) => {
    const answer = responses[String(q.id)]; // "D", "I", "S", or "C"
    if (answer && answer in counts) {
      counts[answer as keyof typeof counts]++;
    }
  });

  const toPct = (v: number) => Math.round((v / (totalQuestions || 1)) * 100);

  const scores = {
    D: toPct(counts.D),
    I: toPct(counts.I),
    S: toPct(counts.S),
    C: toPct(counts.C),
  };

  const sorted = (Object.entries(scores) as [keyof typeof scores, number][])
    .sort((a, b) => b[1] - a[1]);

  return {
    dominance: scores.D,
    influence: scores.I,
    steadiness: scores.S,
    compliance: scores.C,
    primary: sorted[0][0],
    secondary: sorted[1][0],
  };
}

// ============================================================
// Ikigai Scoring
// ============================================================
export interface IkigaiResult {
  loves: string[];
  skills: string[];
  worldNeeds: string[];
  paidFor: string[];
  intersections: {
    passion: string[];    // loves ∩ skills
    mission: string[];    // loves ∩ worldNeeds
    vocation: string[];   // worldNeeds ∩ paidFor
    profession: string[]; // skills ∩ paidFor
  };
  summary: string;
}

export function scoreIkigai(responses: {
  loves: string[];
  skills: string[];
  worldNeeds: string[];
  paidFor: string[];
}): IkigaiResult {
  const { loves, skills, worldNeeds, paidFor } = responses;

  // Simple keyword-based intersection (since items are free text + selections)
  const findOverlap = (a: string[], b: string[]): string[] => {
    const result: string[] = [];
    for (const itemA of a) {
      for (const itemB of b) {
        const wordsA = itemA.toLowerCase().split(/\s+/);
        const wordsB = itemB.toLowerCase().split(/\s+/);
        const commonWords = wordsA.filter((w) => w.length > 3 && wordsB.includes(w));
        if (commonWords.length > 0) {
          result.push(`${itemA} + ${itemB}`);
        }
      }
    }
    return result;
  };

  const passion = findOverlap(loves, skills);
  const mission = findOverlap(loves, worldNeeds);
  const vocation = findOverlap(worldNeeds, paidFor);
  const profession = findOverlap(skills, paidFor);

  const totalItems = loves.length + skills.length + worldNeeds.length + paidFor.length;
  const summary =
    totalItems >= 12
      ? "Você tem uma visão clara e abrangente do seu Ikigai. As interseções identificadas revelam caminhos promissores para alinhar propósito e carreira."
      : totalItems >= 6
        ? "Bom progresso! Continue explorando cada dimensão para refinar seu Ikigai e encontrar mais conexões entre suas paixões e oportunidades."
        : "Este é o começo da sua jornada de autoconhecimento. Considere revisitar este exercício conforme ganha mais clareza sobre seus objetivos.";

  return {
    loves,
    skills,
    worldNeeds,
    paidFor,
    intersections: { passion, mission, vocation, profession },
    summary,
  };
}

// ============================================================
// Flow Scoring
// ============================================================
export interface FlowActivityScore {
  activityId: number;
  activityName: string;
  challenge: number; // 1-10
  skill: number;     // 1-10
  zone: "flow" | "boredom" | "anxiety" | "apathy" | "control" | "arousal" | "worry" | "relaxation";
}

export interface FlowResult {
  activities: FlowActivityScore[];
  triggers: string[];
  blockers: string[];
  questionResponses: Record<string, number | string>;
  flowScore: number; // 0-100
  summary: string;
}

function categorizeFlowZone(
  challenge: number,
  skill: number
): FlowActivityScore["zone"] {
  const cHigh = challenge >= 6;
  const sHigh = skill >= 6;
  const cMed = challenge >= 4 && challenge < 6;
  const sMed = skill >= 4 && skill < 6;

  if (cHigh && sHigh) return "flow";
  if (cHigh && !sHigh && !sMed) return "anxiety";
  if (!cHigh && !cMed && sHigh) return "boredom";
  if (!cHigh && !cMed && !sHigh && !sMed) return "apathy";
  if (cHigh && sMed) return "arousal";
  if (cMed && sHigh) return "control";
  if (!cHigh && !cMed && sMed) return "relaxation";
  if (cMed && !sHigh && !sMed) return "worry";
  // default balanced
  return "control";
}

export function scoreFlow(responses: {
  activities: { activityId: number; activityName: string; challenge: number; skill: number }[];
  triggers: string[];
  blockers: string[];
  questionResponses: Record<string, number | string>;
}): FlowResult {
  const scoredActivities: FlowActivityScore[] = responses.activities.map((a) => ({
    ...a,
    zone: categorizeFlowZone(a.challenge, a.skill),
  }));

  const flowCount = scoredActivities.filter((a) => a.zone === "flow").length;
  const controlCount = scoredActivities.filter((a) => a.zone === "control").length;
  const totalActivities = scoredActivities.length || 1;
  const flowScore = Math.round(
    ((flowCount * 1.0 + controlCount * 0.7) / totalActivities) * 100
  );

  let summary: string;
  if (flowScore >= 70) {
    summary = "Excelente! Você tem muitas atividades na zona de flow. Seu trabalho está bem alinhado com suas habilidades e desafios.";
  } else if (flowScore >= 40) {
    summary = "Bom equilíbrio! Há oportunidades de ajustar desafios e habilidades para alcançar mais momentos de flow no seu dia a dia.";
  } else {
    summary = "Há espaço para melhorias significativas. Considere buscar atividades que equilibrem melhor desafio e habilidade para entrar em flow.";
  }

  return {
    activities: scoredActivities,
    triggers: responses.triggers,
    blockers: responses.blockers,
    questionResponses: responses.questionResponses,
    flowScore,
    summary,
  };
}

// ============================================================
// Universal scorer – dispatches to the correct function
// ============================================================
export function scoreAssessment(type: string, responses: Json): Json {
  switch (type) {
    case "mbti":
      return scoreMBTI(responses as Record<string, string>) as unknown as Json;
    case "big_five":
      return scoreBigFive(responses as Record<string, number>) as unknown as Json;
    case "disc":
      return scoreDISC(responses as Record<string, string>) as unknown as Json;
    case "ikigai":
      return scoreIkigai(responses as { loves: string[]; skills: string[]; worldNeeds: string[]; paidFor: string[] }) as unknown as Json;
    case "flow":
      return scoreFlow(responses as {
        activities: { activityId: number; activityName: string; challenge: number; skill: number }[];
        triggers: string[];
        blockers: string[];
        questionResponses: Record<string, number | string>;
      }) as unknown as Json;
    default:
      return responses;
  }
}
