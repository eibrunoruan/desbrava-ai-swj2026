import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

// GET /api/checkins?userId=...
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

    const { data, error } = await supabase
      .from("checkins")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching checkins:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ checkins: data ?? [] });
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/checkins
// Body: { userId, pdiId, feeling, flow_updates, goal_changed, notes }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, pdiId, feeling, flow_updates, goal_changed, notes } = body;

    if (!userId || !pdiId) {
      return NextResponse.json(
        { error: "userId and pdiId are required" },
        { status: 400 }
      );
    }

    const supabase = supabaseAdmin;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from("checkins")
      .insert({
        user_id: userId,
        pdi_id: pdiId,
        feeling: feeling || null,
        flow_updates: flow_updates || null,
        goal_changed: goal_changed ?? false,
        notes: notes || null,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating checkin:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // If goal changed, flag PDI for recalibration
    if (goal_changed) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from("pdis")
        .update({
          ai_suggestions: {
            recalibration_needed: true,
            recalibration_reason: "User reported goal change during check-in",
            recalibration_requested_at: new Date().toISOString(),
            checkin_notes: notes || "",
          },
          updated_at: new Date().toISOString(),
        })
        .eq("id", pdiId);
    }

    return NextResponse.json({ checkin: data });
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
