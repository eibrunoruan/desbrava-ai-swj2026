import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { event_type, event_data = {}, page } = body;

    if (!event_type) {
      return NextResponse.json(
        { error: "event_type is required" },
        { status: 400 }
      );
    }

    const user_agent = req.headers.get("user-agent") || null;

    const { error } = await supabaseAdmin.from("analytics").insert({
      event_type,
      event_data,
      page: page || null,
      user_agent,
    });

    if (error) {
      console.error("Analytics insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Analytics POST error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const event_type = searchParams.get("event_type");
    const summary = searchParams.get("summary");

    if (summary === "true") {
      const { data, error } = await supabaseAdmin
        .from("analytics")
        .select("event_type");

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      const counts: Record<string, number> = {};
      for (const row of data || []) {
        counts[row.event_type] = (counts[row.event_type] || 0) + 1;
      }

      return NextResponse.json({ summary: counts });
    }

    if (!event_type) {
      return NextResponse.json(
        { error: "event_type query param is required (or use ?summary=true)" },
        { status: 400 }
      );
    }

    const { count, error } = await supabaseAdmin
      .from("analytics")
      .select("*", { count: "exact", head: true })
      .eq("event_type", event_type);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ event_type, count: count || 0 });
  } catch (err) {
    console.error("Analytics GET error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
