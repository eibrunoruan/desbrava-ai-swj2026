import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

// GET /api/pdi?userId=...
export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("userId");
    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const supabase = supabaseAdmin;

    // Fetch PDIs for user
    const { data: pdis, error: pdisError } = await supabase
      .from("pdis")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (pdisError) {
      console.error("Error fetching PDIs:", pdisError);
      return NextResponse.json({ error: pdisError.message }, { status: 500 });
    }

    if (!pdis || pdis.length === 0) {
      return NextResponse.json({ pdis: [] });
    }

    // Fetch items for all PDIs
    const pdiIds = pdis.map((p) => p.id);
    const { data: items, error: itemsError } = await supabase
      .from("pdi_items")
      .select("*")
      .in("pdi_id", pdiIds)
      .order("sort_order", { ascending: true });

    if (itemsError) {
      console.error("Error fetching PDI items:", itemsError);
      return NextResponse.json({ error: itemsError.message }, { status: 500 });
    }

    // Fetch course recommendations for items
    const itemIds = (items || []).map((i) => i.id);
    let courseRecommendations: Record<string, unknown[]> = {};

    if (itemIds.length > 0) {
      const { data: courses } = await supabase
        .from("course_recommendations")
        .select("*")
        .in("pdi_item_id", itemIds);

      if (courses) {
        courseRecommendations = courses.reduce(
          (acc: Record<string, unknown[]>, course) => {
            if (!acc[course.pdi_item_id]) acc[course.pdi_item_id] = [];
            acc[course.pdi_item_id].push(course);
            return acc;
          },
          {}
        );
      }
    }

    // Merge items into their PDIs
    const pdisWithItems = pdis.map((pdi) => ({
      ...pdi,
      items: (items || [])
        .filter((item) => item.pdi_id === pdi.id)
        .map((item) => ({
          ...item,
          course_recommendations: courseRecommendations[item.id] || [],
        })),
    }));

    return NextResponse.json({ pdis: pdisWithItems });
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
