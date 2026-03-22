import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

// PATCH /api/user/plan
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, plan } = body;

    if (!userId || !plan) {
      return NextResponse.json(
        { error: "userId and plan are required" },
        { status: 400 }
      );
    }

    if (!["free", "premium"].includes(plan)) {
      return NextResponse.json(
        { error: "Invalid plan. Must be 'free' or 'premium'" },
        { status: 400 }
      );
    }

    const supabase = supabaseAdmin;

    const { data, error } = await supabase
      .from("users")
      .update({ plan })
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      console.error("Error updating plan:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Remove password_hash from response
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password_hash, ...userWithoutPassword } = data;

    return NextResponse.json({ user: userWithoutPassword });
  } catch (err) {
    console.error("Error in PATCH /api/user/plan:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
