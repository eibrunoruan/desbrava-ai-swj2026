import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { user_id, name, email, phone, source } = body;

    if (!source) {
      return NextResponse.json(
        { error: "source is required" },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin.from("leads").insert({
      user_id: user_id || null,
      name: name || null,
      email: email || null,
      phone: phone || null,
      source,
    });

    if (error) {
      console.error("Leads insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Leads POST error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ leads: data });
  } catch (err) {
    console.error("Leads GET error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
