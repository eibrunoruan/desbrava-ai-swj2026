import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { generateWithGroq } from "@/lib/groq";

async function extractTextFromFile(
  buffer: Buffer,
  mimeType: string
): Promise<string> {
  if (mimeType === "application/pdf") {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfParse = require("pdf-parse");
    const data = await pdfParse(buffer);
    return data.text;
  } else if (
    mimeType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    mimeType === "application/msword"
  ) {
    const mammoth = await import("mammoth");
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  } else {
    // Attempt to treat as plain text
    return buffer.toString("utf-8");
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const userId = formData.get("userId") as string | null;

    if (!file || !userId) {
      return NextResponse.json(
        { error: "file and userId are required" },
        { status: 400 }
      );
    }

    // Extract text from file
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    let extractedText: string;

    try {
      extractedText = await extractTextFromFile(buffer, file.type);
    } catch (err) {
      console.error("Error extracting text:", err);
      return NextResponse.json(
        { error: "Failed to extract text from file. Supported formats: PDF, DOCX" },
        { status: 400 }
      );
    }

    if (!extractedText || extractedText.trim().length < 20) {
      return NextResponse.json(
        { error: "Could not extract sufficient text from the uploaded file" },
        { status: 400 }
      );
    }

    const supabase = supabaseAdmin;

    // Fetch user data and profile for cross-referencing
    const { data: user } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    const { data: profile } = await supabase
      .from("consolidated_profiles")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const { data: assessments } = await supabase
      .from("assessments")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "completed");

    const systemPrompt = `Voce e um especialista em desenvolvimento profissional e coach de carreira.
O usuario fez upload de um PDI (Plano de Desenvolvimento Individual) existente.
Sua tarefa e:

1. PARSEAR o documento: extrair objetivos, acoes, prazos e metas
2. CROSS-REFERENCE com o perfil consolidado do usuario
3. VALIDAR alinhamento com personalidade (DISC, Big Five, MBTI) e zona de flow
4. IDENTIFICAR GAPS: o que o PDI importado NAO cobre mas deveria
5. SUGERIR ENRIQUECIMENTOS: cursos, projetos, ajustes de timeline

Organize os itens parseados nos 3 modulos:
- foundation: itens basicos e fundamentais
- specialization: itens de aprofundamento e especializacao
- consolidation: itens de prova de competencia e consolidacao

Para CADA item parseado, inclua:
- title, description, type ("course"|"project"|"reading"|"exercise")
- flow_potential ("high"|"medium"|"low"), flow_strategy
- due_date (YYYY-MM-DD ou null), order (sequencial dentro do modulo)

Responda APENAS com JSON valido:
{
  "modules": {
    "foundation": { "name": "Fundamentos", "description": "..." },
    "specialization": { "name": "Especializacao", "description": "..." },
    "consolidation": { "name": "Consolidacao", "description": "..." }
  },
  "items": [
    {
      "module": "foundation"|"specialization"|"consolidation",
      "title": "...",
      "description": "...",
      "type": "course"|"project"|"reading"|"exercise",
      "flow_potential": "high"|"medium"|"low",
      "flow_strategy": "...",
      "due_date": "YYYY-MM-DD" | null,
      "order": 1
    }
  ],
  "ai_suggestions": {
    "alignment_score": 0-100,
    "alignment_analysis": "...",
    "identified_gaps": ["..."],
    "enrichment_suggestions": [
      {
        "title": "...",
        "description": "...",
        "reason": "...",
        "type": "course"|"project"|"reading"|"exercise"
      }
    ],
    "timeline_adjustments": "...",
    "personality_fit_notes": "..."
  }
}`;

    const userPrompt = `DOCUMENTO PDI IMPORTADO:
---
${extractedText.substring(0, 6000)}
---

DADOS DO USUARIO:
- Nome: ${user?.name || "N/A"}
- Cargo atual: ${user?.job_role || "Nao informado"}
- Area: ${user?.area || "Nao informada"}
- Anos de experiencia: ${user?.experience_years ?? "Nao informado"}
- Cargo alvo: ${user?.target_role || "Nao informado"}
- Horizonte: ${user?.target_timeline || "Nao informado"}
- Motivacao: ${user?.motivation || "Nao informada"}

PERFIL CONSOLIDADO:
${profile ? `
- Personalidade: ${JSON.stringify(profile.personality_map)}
- Proposito: ${JSON.stringify(profile.purpose)}
- Zona de Flow: ${JSON.stringify(profile.flow_zone)}
- Gap Analysis: ${JSON.stringify(profile.gap_analysis)}
- Readiness Score: ${profile.readiness_score}
` : "Perfil nao consolidado"}

ASSESSMENTS:
${assessments?.map((a) => `- ${a.type}: ${JSON.stringify(a.results)}`).join("\n") || "Nenhum"}

Data atual: ${new Date().toISOString().split("T")[0]}
Analise o PDI importado e gere a resposta estruturada.`;

    const aiResponse = await generateWithGroq(systemPrompt, userPrompt);

    let pdiData;
    try {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON found in response");
      pdiData = JSON.parse(jsonMatch[0]);
    } catch {
      console.error("Failed to parse AI response:", aiResponse);
      return NextResponse.json(
        { error: "Failed to parse AI analysis of imported PDI" },
        { status: 500 }
      );
    }

    // Create PDI record with type='imported'
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: pdi, error: pdiError } = await (supabase as any)
      .from("pdis")
      .insert({
        user_id: userId,
        type: "imported",
        status: "active",
        modules: pdiData.modules,
        ai_suggestions: pdiData.ai_suggestions || null,
      })
      .select()
      .single();

    if (pdiError) {
      console.error("Error creating PDI:", pdiError);
      return NextResponse.json({ error: pdiError.message }, { status: 500 });
    }

    // Create PDI items
    const items = (pdiData.items || []).map(
      (item: {
        module: string;
        title: string;
        description: string;
        type: string;
        flow_potential: string;
        flow_strategy: string;
        due_date: string | null;
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
      pdi: {
        ...pdi,
        items: pdiItems,
      },
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
