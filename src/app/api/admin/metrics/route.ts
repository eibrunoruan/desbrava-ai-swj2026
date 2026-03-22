import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET() {
  try {
    // a) Total user count
    const { count: totalUsers } = await supabaseAdmin
      .from("users")
      .select("*", { count: "exact", head: true });

    // b) All users data (no password_hash)
    const { data: users } = await supabaseAdmin
      .from("users")
      .select("id, name, email, job_role, target_role, plan, created_at")
      .order("created_at", { ascending: false });

    // c) Analytics summary (count grouped by event_type)
    const { data: analyticsRaw } = await supabaseAdmin
      .from("analytics")
      .select("event_type");

    const analyticsSummary: Record<string, number> = {};
    for (const row of analyticsRaw || []) {
      analyticsSummary[row.event_type] = (analyticsSummary[row.event_type] || 0) + 1;
    }

    // d) All leads
    const { data: leads } = await supabaseAdmin
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false });

    // e) CTA click details: count of each button type
    const { data: ctaClicks } = await supabaseAdmin
      .from("analytics")
      .select("event_data")
      .eq("event_type", "cta_click");

    const ctaButtonCounts: Record<string, number> = {};
    for (const row of ctaClicks || []) {
      const button = (row.event_data as Record<string, string>)?.button || "unknown";
      ctaButtonCounts[button] = (ctaButtonCounts[button] || 0) + 1;
    }

    // f) Page view count for landing page
    const { count: landingPageViews } = await supabaseAdmin
      .from("analytics")
      .select("*", { count: "exact", head: true })
      .eq("event_type", "page_view")
      .eq("page", "landing");

    // g) Premium plan activations count
    const { count: premiumUsers } = await supabaseAdmin
      .from("users")
      .select("*", { count: "exact", head: true })
      .eq("plan", "premium");

    // h) Total assessments completed
    const { count: assessmentsCompleted } = await supabaseAdmin
      .from("assessments")
      .select("*", { count: "exact", head: true })
      .eq("status", "completed");

    // i) UTM source summary from analytics page_view events
    const { data: utmEvents } = await supabaseAdmin
      .from("analytics")
      .select("event_data")
      .eq("event_type", "page_view")
      .eq("page", "landing");

    const utmSummary: Record<string, number> = {};
    for (const row of utmEvents || []) {
      const data = row.event_data as Record<string, string> | null;
      const source = data?.utm_source;
      if (source) {
        const key = `${source}${data?.utm_medium ? ` / ${data.utm_medium}` : ""}${data?.utm_campaign ? ` / ${data.utm_campaign}` : ""}`;
        utmSummary[key] = (utmSummary[key] || 0) + 1;
      }
    }

    return NextResponse.json({
      totalUsers: totalUsers || 0,
      users: users || [],
      analyticsSummary,
      leads: leads || [],
      ctaButtonCounts,
      landingPageViews: landingPageViews || 0,
      premiumUsers: premiumUsers || 0,
      assessmentsCompleted: assessmentsCompleted || 0,
      utmSummary,
    });
  } catch (err) {
    console.error("Admin metrics error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
