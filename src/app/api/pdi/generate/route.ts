import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { generateWithGroq } from "@/lib/groq";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const supabase = supabaseAdmin;

    // Fetch user data
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Fetch consolidated profile
    const { data: profile } = await supabase
      .from("consolidated_profiles")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    // Fetch completed assessments
    const { data: assessments } = await supabase
      .from("assessments")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "completed");

    const systemPrompt = `Voce e um especialista em desenvolvimento profissional e coach de carreira.
Voce deve gerar um PDI (Plano de Desenvolvimento Individual) personalizado em portugues brasileiro.
O PDI deve ser dividido em 3 modulos:

1. FUNDAMENTOS (foundation) - Preencher a base
   - Gaps de habilidades tecnicas identificados na gap analysis
   - Soft skills prioritarias baseadas no DISC + Big Five + cargo alvo
   - Timeline sugerido baseado no horizonte declarado pelo usuario

2. ESPECIALIZACAO (specialization) - Mergulho profundo
   - Cursos avancados e trilhas de aprendizado
   - Projetos praticos alinhados com a zona de flow
   - Leituras e recursos complementares

3. CONSOLIDACAO (consolidation) - Provar competencia
   - Projeto real para GitHub (spec baseada no cargo alvo)
   - Cenarios de lideranca/gestao se aplicavel
   - Checklist de validacao

Para CADA item, inclua:
- title: titulo conciso
- description: descricao detalhada com acoes concretas
- type: "course" | "project" | "reading" | "exercise"
- flow_potential: "high" | "medium" | "low" (baseado na zona de flow do usuario)
- flow_strategy: dica especifica de como entrar em estado de flow ao executar esse item
- due_date: data sugerida no formato YYYY-MM-DD
- order: numero sequencial dentro do modulo (comecando em 1)

Responda APENAS com JSON valido no formato:
{
  "modules": {
    "foundation": { "name": "Fundamentos", "description": "..." },
    "specialization": { "name": "Especializacao", "description": "..." },
    "consolidation": { "name": "Consolidacao", "description": "..." }
  },
  "items": [
    {
      "module": "foundation" | "specialization" | "consolidation",
      "title": "...",
      "description": "...",
      "type": "course" | "project" | "reading" | "exercise",
      "flow_potential": "high" | "medium" | "low",
      "flow_strategy": "...",
      "due_date": "YYYY-MM-DD",
      "order": 1
    }
  ]
}`;

    const userPrompt = `Gere um PDI completo para o seguinte usuario:

DADOS DO USUARIO:
- Nome: ${user.name}
- Cargo atual: ${user.job_role || "Nao informado"}
- Area: ${user.area || "Nao informada"}
- Anos de experiencia: ${user.experience_years ?? "Nao informado"}
- Nivel de educacao: ${user.education_level || "Nao informado"}
- Curso: ${user.education_course || "Nao informado"}
- Idiomas: ${user.languages?.join(", ") || "Nao informado"}
- Cargo alvo: ${user.target_role || "Nao informado"}
- Horizonte de tempo: ${user.target_timeline || "Nao informado"}
- Motivacao: ${user.motivation || "Nao informada"}
- Dados extraidos do CV: ${user.cv_extracted_data ? JSON.stringify(user.cv_extracted_data) : "Nenhum"}

PERFIL CONSOLIDADO:
${profile ? `
- Mapa de personalidade: ${JSON.stringify(profile.personality_map)}
- Proposito: ${JSON.stringify(profile.purpose)}
- Zona de Flow: ${JSON.stringify(profile.flow_zone)}
- Gap Analysis: ${JSON.stringify(profile.gap_analysis)}
- Readiness Score: ${profile.readiness_score}
- Insights: ${JSON.stringify(profile.insights)}
` : "Perfil ainda nao consolidado - gere baseado nos dados do usuario e assessments"}

RESULTADOS DOS ASSESSMENTS:
${assessments?.map((a) => `- ${a.type}: ${JSON.stringify(a.results)}`).join("\n") || "Nenhum assessment completado"}

Data atual: ${new Date().toISOString().split("T")[0]}
Gere entre 4-6 itens por modulo, totalizando 12-18 itens.`;

    const aiResponse = await generateWithGroq(systemPrompt, userPrompt);

    // Parse AI response
    let pdiData;
    try {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON found in response");
      pdiData = JSON.parse(jsonMatch[0]);
    } catch {
      console.error("Failed to parse AI response:", aiResponse);
      return NextResponse.json(
        { error: "Failed to parse AI-generated PDI" },
        { status: 500 }
      );
    }

    // Create PDI record
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: pdi, error: pdiError } = await (supabase as any)
      .from("pdis")
      .insert({
        user_id: userId,
        type: "generated",
        status: "active",
        modules: pdiData.modules,
      })
      .select()
      .single();

    if (pdiError) {
      console.error("Error creating PDI:", pdiError);
      return NextResponse.json({ error: pdiError.message }, { status: 500 });
    }

    // Create PDI items
    const items = pdiData.items.map(
      (item: {
        module: string;
        title: string;
        description: string;
        type: string;
        flow_potential: string;
        flow_strategy: string;
        due_date: string;
        order: number;
      }) => ({
        pdi_id: pdi.id,
        module: item.module,
        title: item.title,
        description: item.description,
        type: item.type,
        flow_potential: item.flow_potential || "medium",
        flow_strategy: item.flow_strategy || null,
        due_date: item.due_date || null,
        sort_order: item.order,
        status: "pending",
      })
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: pdiItems, error: itemsError } = await (supabase as any)
      .from("pdi_items")
      .insert(items)
      .select();

    if (itemsError) {
      console.error("Error creating PDI items:", itemsError);
      return NextResponse.json({ error: itemsError.message }, { status: 500 });
    }

    return NextResponse.json({
      pdi: { ...pdi, items: pdiItems },
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
