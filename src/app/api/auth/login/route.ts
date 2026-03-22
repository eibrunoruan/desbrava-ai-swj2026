import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { supabaseAdmin } from "@/lib/supabase/admin";

const hashPassword = (pw: string) => createHash("sha256").update(pw).digest("hex");

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "E-mail e senha são obrigatórios" },
        { status: 400 }
      );
    }

    const { data: user, error } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (error || !user) {
      return NextResponse.json(
        { error: "E-mail ou senha incorretos" },
        { status: 401 }
      );
    }

    const providedHash = hashPassword(password);

    if (user.password_hash !== providedHash) {
      return NextResponse.json(
        { error: "E-mail ou senha incorretos" },
        { status: 401 }
      );
    }

    // Remove password_hash from response
    const { password_hash: _ph, ...safeUser } = user;
    return NextResponse.json({ user: safeUser });
  } catch {
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
