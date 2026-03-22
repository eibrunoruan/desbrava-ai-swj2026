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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: user } = await (supabase as any)
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    // Fetch MBTI assessment for learning style
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: mbtiAssessment } = await (supabase as any)
      .from("assessments")
      .select("results")
      .eq("user_id", userId)
      .eq("type", "mbti")
      .eq("status", "completed")
      .maybeSingle();

    // Fetch flow assessment for challenge preferences
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: flowAssessment } = await (supabase as any)
      .from("assessments")
      .select("results")
      .eq("user_id", userId)
      .eq("type", "flow")
      .eq("status", "completed")
      .maybeSingle();

    const languages = user?.languages ?? ["PT-BR"];
    const mbtiType = mbtiAssessment?.results
      ? JSON.stringify(mbtiAssessment.results)
      : "not available";
    const flowData = flowAssessment?.results
      ? JSON.stringify(flowAssessment.results)
      : "not available";
    const userRole = user?.job_role ?? "professional";
    const targetRole = user?.target_role ?? "";

    const systemPrompt = `You are a course recommendation engine for career development. You must respond ONLY with valid JSON, no markdown or explanation.

Generate 6 course recommendations for learning "${skill}".

User context:
- Current role: ${userRole}
- Target role: ${targetRole}
- MBTI/Learning style: ${mbtiType}
- Flow/Challenge preferences: ${flowData}
- Language preferences: ${JSON.stringify(languages)}

Rules:
- Generate realistic Udemy-style courses
- URLs should follow format: https://www.udemy.com/course/[slug]/
- Platform is always "Udemy"
- Rating between 4.5 and 5.0
- students_count between 1000 and 500000
- price between 27.90 and 199.90 (BRL)
- duration as string like "12h", "24h", "40h"
- language should be "PT-BR" or "EN" based on user preferences
- compatibility_score between 60 and 100, based on how well the course matches the user's learning style and goals
- Higher compatibility for courses that match introvert/extrovert learning preferences
- Higher compatibility for courses that match the user's challenge level preference

Respond with this exact JSON structure:
{
  "courses": [
    {
      "title": "string",
      "url": "string",
      "platform": "Udemy",
      "rating": number,
      "students_count": number,
      "price": number,
      "duration": "string",
      "language": "string",
      "compatibility_score": number
    }
  ]
}`;

    const userPrompt = `Generate 6 course recommendations for learning: "${skill}"`;

    const response = await generateWithGroq(systemPrompt, userPrompt);

    let courses;
    try {
      // Strip markdown code fences if present
      let jsonStr = response.trim();
      jsonStr = jsonStr.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?\s*```\s*$/i, "").trim();
      const parsed = JSON.parse(jsonStr);
      courses = parsed.courses;
    } catch {
      console.error("Failed to parse Groq response:", response);
      return NextResponse.json(
        { error: "Failed to parse AI response" },
        { status: 500 }
      );
    }

    if (!Array.isArray(courses) || courses.length === 0) {
      return NextResponse.json(
        { error: "No courses generated" },
        { status: 500 }
      );
    }

    // If we have a pdiItemId, save to database
    const savedCourses = [];
    const effectivePdiItemId = pdiItemId || null;

    if (effectivePdiItemId) {
      for (const course of courses) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (supabase as any)
          .from("course_recommendations")
          .insert({
            pdi_item_id: effectivePdiItemId,
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
          })
          .select()
          .single();

        if (!error && data) {
          savedCourses.push(data);
        }
      }
    }

    // Sort by compatibility_score descending
    const sortedCourses = (savedCourses.length > 0 ? savedCourses : courses).sort(
      (a: { compatibility_score: number }, b: { compatibility_score: number }) =>
        (b.compatibility_score ?? 0) - (a.compatibility_score ?? 0)
    );

    return NextResponse.json({ courses: sortedCourses });
  } catch (err) {
    console.error("Course search error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
