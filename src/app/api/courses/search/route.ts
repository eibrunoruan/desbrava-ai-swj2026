import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { generateWithGroq } from "@/lib/groq";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { skill, userId, pdiItemId } = body;

    if (!skill || !userId) {
      return NextResponse.json(
        { error: "skill and userId are required" },
        { status: 400 }
      );
    }

    const supabase = supabaseAdmin;

    // Fetch user data for personalization
    const { data: user } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    // Fetch MBTI for learning style
    const { data: mbtiAssessment } = await supabase
      .from("assessments")
      .select("results")
      .eq("user_id", userId)
      .eq("type", "mbti")
      .eq("status", "completed")
      .maybeSingle();

    const languages = (user?.languages as string[]) ?? ["Portugues"];
    const mbtiType = mbtiAssessment?.results
      ? JSON.stringify(mbtiAssessment.results)
      : "not available";
    const userRole = (user?.job_role as string) ?? "professional";
    const targetRole = (user?.target_role as string) ?? "";

    const systemPrompt = `Você é um motor de recomendação de cursos da Udemy para desenvolvimento de carreira.
Responda SOMENTE com JSON válido puro, sem markdown, sem crases, sem explicação.

Gere 6 recomendações de cursos REAIS e populares da Udemy para aprender "${skill}".

Contexto do usuário:
- Cargo atual: ${userRole}
- Cargo alvo: ${targetRole}
- Estilo de aprendizagem (MBTI): ${mbtiType}
- Idiomas: ${JSON.stringify(languages)}

Regras IMPORTANTES:
- Use nomes de cursos que realmente existem ou são muito prováveis de existir na Udemy
- Para o campo "search_slug", crie palavras-chave de busca concisas (2-4 palavras) que encontrariam o curso na Udemy
- Platform é sempre "Udemy"
- Rating entre 4.5 e 5.0
- students_count entre 5000 e 500000
- price entre 27.90 e 199.90 (BRL)
- duration como string: "12h", "24h", "40h" etc
- language: "PT-BR" ou "EN" baseado nas preferências do usuário
- compatibility_score entre 60 e 100

Responda com esta estrutura JSON exata:
{"courses":[{"title":"string","search_slug":"string","platform":"Udemy","rating":4.7,"students_count":25000,"price":94.90,"duration":"24h","language":"PT-BR","compatibility_score":85}]}`;

    const userPrompt = `Gere 6 recomendações de cursos reais da Udemy para: "${skill}"`;

    const response = await generateWithGroq(systemPrompt, userPrompt);

    let courses;
    try {
      let jsonStr = response.trim();
      jsonStr = jsonStr
        .replace(/^```(?:json)?\s*\n?/i, "")
        .replace(/\n?\s*```\s*$/i, "")
        .trim();
      const parsed = JSON.parse(jsonStr);
      courses = parsed.courses;
    } catch {
      console.error("Failed to parse Groq response:", response);
      return NextResponse.json(
        { error: "Falha ao processar resposta da IA" },
        { status: 500 }
      );
    }

    if (!Array.isArray(courses) || courses.length === 0) {
      return NextResponse.json(
        { error: "Nenhum curso encontrado" },
        { status: 404 }
      );
    }

    // Build real Udemy search URLs for each course
    const enrichedCourses = courses.map(
      (course: {
        title: string;
        search_slug?: string;
        platform: string;
        rating: number;
        students_count: number;
        price: number;
        duration: string;
        language: string;
        compatibility_score: number;
      }) => ({
        title: course.title,
        url: `https://www.udemy.com/courses/search/?q=${encodeURIComponent(course.search_slug || course.title)}&sort=relevance&ratings=4.5`,
        platform: course.platform || "Udemy",
        rating: course.rating,
        students_count: course.students_count,
        price: course.price,
        duration: course.duration,
        language: course.language,
        compatibility_score: course.compatibility_score,
      })
    );

    // Sort by compatibility_score descending
    enrichedCourses.sort(
      (a: { compatibility_score: number }, b: { compatibility_score: number }) =>
        b.compatibility_score - a.compatibility_score
    );

    // Save to database if linked to a PDI item
    if (pdiItemId) {
      for (const course of enrichedCourses) {
        await supabase.from("course_recommendations").insert({
          pdi_item_id: pdiItemId,
          user_id: userId,
          title: course.title,
          url: course.url,
          platform: course.platform,
          rating: course.rating,
          students_count: course.students_count,
          price: course.price,
          duration: course.duration,
          language: course.language,
          compatibility_score: course.compatibility_score,
        });
      }
    }

    return NextResponse.json({ courses: enrichedCourses });
  } catch (err) {
    console.error("Course search error:", err);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
