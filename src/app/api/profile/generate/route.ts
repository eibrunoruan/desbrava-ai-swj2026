import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { generateWithGroq } from "@/lib/groq";

// POST /api/profile/generate
// Body: { userId }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    const supabase = supabaseAdmin;

    // Fetch user data
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: user, error: userError } = await (supabase as any)
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Fetch all completed assessments
    const { data: assessments, error: assessError } = await supabase
      .from("assessments")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "completed");

    if (assessError) {
      return NextResponse.json(
        { error: assessError.message },
        { status: 500 }
      );
    }

    if (!assessments || assessments.length === 0) {
      return NextResponse.json(
        { error: "Nenhum assessment completado. Complete pelo menos um assessment antes de gerar o perfil." },
        { status: 400 }
      );
    }

    // Organize assessment results by type
    const assessmentMap: Record<string, unknown> = {};
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    for (const a of assessments as any[]) {
      assessmentMap[a.type] = a.results;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const completedTypes = (assessments as any[]).map((a) => a.type);

    // Build comprehensive prompt
    const systemPrompt = `Você é um psicólogo organizacional e coach de carreira especialista com profundo conhecimento em MBTI, Big Five (OCEAN), DISC, Ikigai e Teoria do Flow de Csikszentmihalyi.

Sua tarefa é analisar todos os resultados de assessments de um profissional e gerar um Perfil Consolidado completo e integrado.

REGRAS IMPORTANTES:
1. Responda EXCLUSIVAMENTE em formato JSON válido, sem markdown, sem comentários, sem texto antes ou depois.
2. Todos os textos devem estar em português brasileiro.
3. Seja específico e personalizado — não use frases genéricas.
4. Cruze informações entre os diferentes assessments para gerar insights profundos.
5. Use dados concretos dos resultados para fundamentar cada análise.
6. Se algum assessment não foi completado, trabalhe com os dados disponíveis e indique o que falta.`;

    const userPrompt = `DADOS DO PROFISSIONAL:
- Nome: ${user.name}
- Cargo atual: ${user.job_role || "Não informado"}
- Área: ${user.area || "Não informada"}
- Anos de experiência: ${user.experience_years ?? "Não informado"}
- Formação: ${user.education_level || "Não informada"} em ${user.education_course || "não especificado"} — ${user.education_institution || ""}
- Idiomas: ${user.languages?.join(", ") || "Não informado"}
- Cargo alvo: ${user.target_role || "Não informado"}
- Timeline desejada: ${user.target_timeline || "Não informada"}
- Motivação: ${user.motivation || "Não informada"}
- Dados extraídos do CV: ${user.cv_extracted_data ? JSON.stringify(user.cv_extracted_data) : "Nenhum CV enviado"}

ASSESSMENTS COMPLETADOS: ${completedTypes.join(", ")}

${assessmentMap.mbti ? `RESULTADOS MBTI:
${JSON.stringify(assessmentMap.mbti, null, 2)}` : "MBTI: Não completado"}

${assessmentMap.big_five ? `RESULTADOS BIG FIVE (OCEAN):
${JSON.stringify(assessmentMap.big_five, null, 2)}` : "Big Five: Não completado"}

${assessmentMap.disc ? `RESULTADOS DISC:
${JSON.stringify(assessmentMap.disc, null, 2)}` : "DISC: Não completado"}

${assessmentMap.ikigai ? `RESULTADOS IKIGAI:
${JSON.stringify(assessmentMap.ikigai, null, 2)}` : "Ikigai: Não completado"}

${assessmentMap.flow ? `RESULTADOS FLOW:
${JSON.stringify(assessmentMap.flow, null, 2)}` : "Flow: Não completado"}

Gere o JSON do Perfil Consolidado com EXATAMENTE esta estrutura:

{
  "personality_map": {
    "mbti_summary": "Descrição integrada do tipo MBTI com forças e áreas de atenção para o cargo alvo",
    "mbti_type": "XXXX",
    "mbti_dimensions": { "E": 0, "I": 0, "S": 0, "N": 0, "T": 0, "F": 0, "J": 0, "P": 0 },
    "big_five_summary": "Análise de como os traços Big Five se manifestam no contexto profissional",
    "big_five_scores": { "openness": 0, "conscientiousness": 0, "extraversion": 0, "agreeableness": 0, "neuroticism": 0 },
    "disc_summary": "Como o perfil DISC impacta o estilo de liderança e comunicação",
    "disc_scores": { "dominance": 0, "influence": 0, "steadiness": 0, "compliance": 0 },
    "disc_primary": "X",
    "disc_secondary": "X",
    "integrated_narrative": "Narrativa de 3-4 parágrafos integrando MBTI + Big Five + DISC, explicando como estes perfis se complementam e potenciais pontos cegos"
  },
  "purpose": {
    "ikigai_summary": "Análise do Ikigai conectada com o cargo alvo",
    "loves": ["lista do que ama fazer"],
    "skills": ["lista de habilidades"],
    "world_needs": ["necessidades do mundo que pode atender"],
    "paid_for": ["pelo que pode ser pago"],
    "passion_zone": "Descrição da zona de paixão (amor + habilidade)",
    "mission_zone": "Descrição da zona de missão (amor + necessidade do mundo)",
    "vocation_zone": "Descrição da zona de vocação (necessidade + pagamento)",
    "profession_zone": "Descrição da zona profissional (habilidade + pagamento)",
    "career_alignment": "Análise detalhada de como o cargo alvo se alinha com o Ikigai identificado, incluindo gaps e recomendações",
    "purpose_statement": "Declaração de propósito personalizada em 1-2 frases"
  },
  "flow_zone": {
    "summary": "Resumo geral do perfil de flow",
    "flow_score": 0,
    "flow_activities": [
      { "name": "atividade", "zone": "flow|anxiety|boredom|apathy|control|arousal|worry|relaxation", "challenge": 0, "skill": 0 }
    ],
    "triggers": ["gatilhos de flow"],
    "blockers": ["bloqueadores de flow"],
    "ideal_conditions": "Descrição das condições ideais de trabalho para maximizar o flow baseado em todos os dados",
    "recommendations": ["3-5 recomendações práticas para aumentar momentos de flow"]
  },
  "gap_analysis": {
    "summary": "Resumo da análise de gaps entre estado atual e cargo alvo",
    "job_role": "cargo atual",
    "target_role": "cargo alvo",
    "technical_gaps": [
      { "skill": "nome da competência técnica", "current_level": 0, "target_level": 100, "priority": "high|medium|low", "description": "por que é importante" }
    ],
    "behavioral_gaps": [
      { "skill": "nome da competência comportamental", "current_level": 0, "target_level": 100, "priority": "high|medium|low", "description": "por que é importante" }
    ],
    "experiential_gaps": [
      { "area": "área de experiência", "current_level": 0, "target_level": 100, "priority": "high|medium|low", "description": "que tipo de experiência falta" }
    ]
  },
  "readiness_score": 0,
  "readiness_breakdown": {
    "technical": 0,
    "behavioral": 0,
    "experiential": 0,
    "purpose_alignment": 0,
    "flow_optimization": 0
  },
  "insights": [
    {
      "title": "Título curto do insight",
      "description": "Descrição detalhada do insight cruzando dados de múltiplos assessments",
      "type": "strength|opportunity|attention|synergy",
      "related_assessments": ["mbti", "big_five"]
    }
  ]
}

INSTRUÇÕES ADICIONAIS:
- Gere pelo menos 5 insights cruzados entre assessments.
- Os insights devem ser reveladores e não óbvios — cruze dados entre assessments.
- O readiness_score deve ser calculado de forma realista considerando TODOS os gaps.
- Para technical_gaps, behavioral_gaps e experiential_gaps, gere pelo menos 3 itens cada.
- current_level e target_level devem estar entre 0 e 100.
- Os scores de readiness_breakdown devem estar entre 0 e 100.
- flow_activities deve refletir os dados reais do assessment de flow, se disponível.
- Se um assessment não foi completado, use os dados disponíveis para inferir o melhor possível e indique nos insights.`;

    const rawResponse = await generateWithGroq(systemPrompt, userPrompt);

    // Parse JSON from the response
    let profileData;
    try {
      // Try to extract JSON if it's wrapped in markdown code blocks
      const jsonMatch = rawResponse.match(/```(?:json)?\s*([\s\S]*?)```/);
      const jsonStr = jsonMatch ? jsonMatch[1].trim() : rawResponse.trim();
      profileData = JSON.parse(jsonStr);
    } catch {
      console.error("Failed to parse Groq response as JSON:", rawResponse);
      return NextResponse.json(
        { error: "Erro ao processar resposta da IA. Tente novamente." },
        { status: 500 }
      );
    }

    // Upsert the consolidated profile
    const profilePayload = {
      user_id: userId,
      personality_map: profileData.personality_map,
      purpose: profileData.purpose,
      flow_zone: profileData.flow_zone,
      gap_analysis: profileData.gap_analysis,
      readiness_score: profileData.readiness_score,
      insights: {
        items: profileData.insights,
        readiness_breakdown: profileData.readiness_breakdown,
      },
      updated_at: new Date().toISOString(),
    };

    // Check if profile already exists
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: existing } = await (supabase as any)
      .from("consolidated_profiles")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    let savedProfile;
    if (existing) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from("consolidated_profiles")
        .update(profilePayload)
        .eq("id", existing.id)
        .select()
        .single();

      if (error) {
        console.error("Error updating profile:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      savedProfile = data;
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from("consolidated_profiles")
        .insert(profilePayload)
        .select()
        .single();

      if (error) {
        console.error("Error inserting profile:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      savedProfile = data;
    }

    return NextResponse.json({ profile: savedProfile });
  } catch (err) {
    console.error("Unexpected error generating profile:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
