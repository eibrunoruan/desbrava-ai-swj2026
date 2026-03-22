import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

// PATCH /api/pdi/[id]/items
// Body: { itemId, status }
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: pdiId } = await params;
    const body = await req.json();
    const { itemId, status } = body;

    if (!itemId || !status) {
      return NextResponse.json(
        { error: "itemId and status are required" },
        { status: 400 }
      );
    }

    const validStatuses = ["pending", "in_progress", "completed"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be: pending, in_progress, or completed" },
        { status: 400 }
      );
    }

    const supabase = supabaseAdmin;

    // Verify the item belongs to the specified PDI
    const { data: existingItem, error: fetchError } = await supabase
      .from("pdi_items")
      .select("id, pdi_id")
      .eq("id", itemId)
      .eq("pdi_id", pdiId)
      .single();

    if (fetchError || !existingItem) {
      return NextResponse.json(
        { error: "PDI item not found" },
        { status: 404 }
      );
    }

    // Build update object
    const updateData: Record<string, unknown> = { status };
    if (status === "completed") {
      updateData.completed_at = new Date().toISOString();
    } else {
      updateData.completed_at = null;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: updatedItem, error: updateError } = await (supabase as any)
      .from("pdi_items")
      .update(updateData)
      .eq("id", itemId)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating PDI item:", updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ item: updatedItem });
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
