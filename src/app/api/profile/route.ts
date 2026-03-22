import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

// GET /api/profile?userId=...
export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("userId");
    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    const supabase = supabaseAdmin;

    // Fetch user data
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (userError) {
      console.error("Error fetching user:", userError);
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Fetch consolidated profile
    const { data: profile } = await supabase
      .from("consolidated_profiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    // Fetch all assessments
    const { data: assessments } = await supabase
      .from("assessments")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: true });

    const completedAssessments = (assessments ?? []).filter(
      (a: { status: string }) => a.status === "completed"
    );

    return NextResponse.json({
      user,
      profile: profile ?? null,
      assessments: assessments ?? [],
      completedCount: completedAssessments.length,
      totalAssessments: 5,
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
