import { NextRequest, NextResponse } from "next/server";
import { generateWithGroq } from "@/lib/groq";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "Nenhum arquivo enviado" },
        { status: 400 }
      );
    }

    // Validate file type
    const validTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Formato invalido. Use PDF ou DOCX." },
        { status: 400 }
      );
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Arquivo muito grande. Maximo 10MB." },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    let extractedText = "";

    // Extract text based on file type
    if (file.type === "application/pdf") {
      // pdf-parse
      const pdfParse = (await import("pdf-parse")).default;
      const pdfData = await pdfParse(buffer);
      extractedText = pdfData.text;
    } else {
      // DOCX - mammoth
      const mammoth = await import("mammoth");
      const result = await mammoth.extractRawText({ buffer });
      extractedText = result.value;
    }

    if (!extractedText || extractedText.trim().length < 20) {
      return NextResponse.json(
        { error: "Nao foi possivel extrair texto do arquivo." },
        { status: 422 }
      );
    }

    // Truncate very long CVs to avoid token limits
    const maxLength = 8000;
    const truncatedText =
      extractedText.length > maxLength
        ? extractedText.slice(0, maxLength) + "\n[... truncado]"
        : extractedText;

    // Use Groq to extract structured data
    const systemPrompt = `Voce e um assistente especializado em analise de curriculos.
Extraia as informacoes do curriculo fornecido e retorne APENAS um JSON valido, sem markdown, sem explicacao, com a seguinte estrutura:
{
  "hard_skills": ["skill1", "skill2", ...],
  "soft_skills": ["skill1", "skill2", ...],
  "experiences": [
    {"role": "cargo", "company": "empresa", "period": "periodo"}
  ],
  "education": [
    {"degree": "titulo", "institution": "instituicao", "year": "ano"}
  ]
}
Regras:
- Retorne no maximo 15 hard skills e 10 soft skills
- Para experiencias, ordene da mais recente para a mais antiga
- Se alguma informacao nao estiver disponivel, use uma lista vazia
- Responda APENAS com o JSON, sem nenhum texto adicional`;

    const userPrompt = `Analise o seguinte curriculo e extraia as informacoes:\n\n${truncatedText}`;

    const rawResponse = await generateWithGroq(systemPrompt, userPrompt);

    // Parse the JSON response
    let parsed;
    try {
      // Try to extract JSON from the response (in case there's surrounding text)
      const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No JSON found in response");
      }
      parsed = JSON.parse(jsonMatch[0]);
    } catch {
      console.error("Failed to parse Groq response:", rawResponse);
      return NextResponse.json(
        { error: "Erro ao processar resposta da IA" },
        { status: 500 }
      );
    }

    // Validate and normalize the structure
    const result = {
      hard_skills: Array.isArray(parsed.hard_skills)
        ? parsed.hard_skills.slice(0, 15)
        : [],
      soft_skills: Array.isArray(parsed.soft_skills)
        ? parsed.soft_skills.slice(0, 10)
        : [],
      experiences: Array.isArray(parsed.experiences)
        ? parsed.experiences.slice(0, 10).map(
            (e: { role?: string; company?: string; period?: string }) => ({
              role: e.role || "",
              company: e.company || "",
              period: e.period || "",
            })
          )
        : [],
      education: Array.isArray(parsed.education)
        ? parsed.education.slice(0, 5).map(
            (e: {
              degree?: string;
              institution?: string;
              year?: string;
            }) => ({
              degree: e.degree || "",
              institution: e.institution || "",
              year: e.year || "",
            })
          )
        : [],
    };

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("CV extract error:", error);
    return NextResponse.json(
      { error: "Erro interno ao processar curriculo" },
      { status: 500 }
    );
  }
}
