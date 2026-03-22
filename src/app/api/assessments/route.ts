import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { scoreAssessment } from "@/lib/assessment-scoring";

// GET /api/assessments?userId=...
export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("userId");
    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const supabase = supabaseAdmin;

    const { data, error } = await supabase
      .from("assessments")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching assessments:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ assessments: data ?? [] });
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/assessments
// Body: { userId, type, responses }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, type, responses } = body;

    if (!userId || !type || !responses) {
      return NextResponse.json(
        { error: "userId, type, and responses are required" },
        { status: 400 }
      );
    }

    const validTypes = ["mbti", "big_five", "disc", "ikigai", "flow"];
    if (!validTypes.includes(type)) {
      return NextResponse.json({ error: "Invalid assessment type" }, { status: 400 });
    }

    // Score the assessment
    const results = scoreAssessment(type, responses);

    const supabase = supabaseAdmin;

    // Check if an assessment of this type already exists for the user
    const { data: existing } = await supabase
      .from("assessments")
      .select("id")
      .eq("user_id", userId)
      .eq("type", type)
      .maybeSingle();

    if (existing) {
      // Update existing assessment
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from("assessments")
        .update({
          responses,
          results,
          status: "completed",
          completed_at: new Date().toISOString(),
        })
        .eq("id", (existing as { id: string }).id)
        .select()
        .single();

      if (error) {
        console.error("Error updating assessment:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ assessment: data, results });
    } else {
      // Insert new assessment
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from("assessments")
        .insert({
          user_id: userId,
          type,
          status: "completed",
          responses,
          results,
          completed_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error("Error inserting assessment:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ assessment: data, results });
    }
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
