import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const rawData = formData.get("data");
    const cvFile = formData.get("cv") as File | null;
    const cvExtractedRaw = formData.get("cv_extracted_data");

    if (!rawData || typeof rawData !== "string") {
      return NextResponse.json(
        { error: "Dados do formulario ausentes" },
        { status: 400 }
      );
    }

    const data = JSON.parse(rawData);

    if (!data.email || !data.name) {
      return NextResponse.json(
        { error: "Nome e e-mail sao obrigatorios" },
        { status: 400 }
      );
    }

    const supabase = supabaseAdmin;

    // Upload CV to Supabase Storage if provided
    let cvUrl: string | null = null;
    if (cvFile && cvFile.size > 0) {
      const fileExt = cvFile.name.split(".").pop();
      const fileName = `${data.email.replace(/[^a-zA-Z0-9]/g, "_")}_${Date.now()}.${fileExt}`;

      const arrayBuffer = await cvFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("cvs")
        .upload(fileName, buffer, {
          contentType: cvFile.type,
          upsert: true,
        });

      if (uploadError) {
        console.error("CV upload error:", uploadError);
        // Continue without CV - don't block onboarding
      } else {
        const {
          data: { publicUrl },
        } = supabase.storage.from("cvs").getPublicUrl(uploadData.path);
        cvUrl = publicUrl;
      }
    }

    // Parse extracted CV data
    let cvExtractedData = null;
    if (cvExtractedRaw && typeof cvExtractedRaw === "string") {
      try {
        cvExtractedData = JSON.parse(cvExtractedRaw);
      } catch {
        // Ignore parse errors
      }
    }

    // Build user record
    const userRecord = {
      email: data.email,
      name: data.name,
      job_role: data.job_role || null,
      area: data.area || null,
      experience_years: data.experience_years != null ? Number(data.experience_years) : null,
      education_level: data.education_level || null,
      education_course: data.education_course || null,
      education_institution: data.education_institution || null,
      languages: Array.isArray(data.languages) && data.languages.length > 0 ? data.languages : null,
      target_role: data.target_role || null,
      target_timeline: data.target_timeline || null,
      motivation: data.motivation || null,
      cv_url: cvUrl,
      cv_extracted_data: cvExtractedData,
      onboarding_completed: true,
      updated_at: new Date().toISOString(),
    };

    // Upsert: create or update user by email
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("email", data.email)
      .single();

    let user;

    if (existingUser) {
      // Update existing user
      const { data: updatedUser, error } = await supabase
        .from("users")
        .update(userRecord)
        .eq("id", existingUser.id)
        .select()
        .single();

      if (error) {
        console.error("User update error:", error);
        return NextResponse.json(
          { error: "Erro ao atualizar usuario" },
          { status: 500 }
        );
      }
      user = updatedUser;
    } else {
      // Create new user
      const { data: newUser, error } = await supabase
        .from("users")
        .insert(userRecord)
        .select()
        .single();

      if (error) {
        console.error("User insert error:", error);
        return NextResponse.json(
          { error: "Erro ao criar usuario" },
          { status: 500 }
        );
      }
      user = newUser;
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error("Onboarding API error:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
