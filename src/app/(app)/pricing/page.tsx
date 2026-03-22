"use client";

import { useState } from "react";
import { Check, Crown, Sparkles, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useUserStore } from "@/store/user";

const freePlanFeatures = [
  "5 Assessments Completos",
  "Perfil Consolidado",
  "Diagnostico Cruzado com IA",
  "Insights de Personalidade",
];

const premiumFeatures = [
  "Tudo do Gratuito +",
  "PDI Personalizado com IA",
  "Curadoria de Cursos Inteligente",
  "Acompanhamento e Check-ins",
  "Trajetoria Comparada",
  "Suporte Prioritario",
];

export default function PricingPage() {
  const { user, setUser } = useUserStore();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const currentPlan = user?.plan || "free";
  const isPremium = currentPlan === "premium";

  const handleSubscribe = async () => {
    if (!user?.id || isPremium) return;

    setLoading(true);
    try {
      const res = await fetch("/api/user/plan", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, plan: "premium" }),
      });

      if (res.ok) {
        const data = await res.json();
        setUser({ ...user, ...data.user });
        setSuccess(true);
        setTimeout(() => setSuccess(false), 4000);
      }
    } catch (err) {
      console.error("Error upgrading plan:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2 text-center">
        <div className="flex items-center justify-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <span className="text-sm text-muted-foreground">Planos</span>
        </div>
        <h1 className="text-3xl font-bold">
          <span className="bg-gradient-to-r from-green-400 to-lime-400 bg-clip-text text-transparent">
            Escolha seu Plano
          </span>
        </h1>
        <p className="mx-auto max-w-lg text-muted-foreground">
          Comece gratuitamente e evolua quando estiver pronto para desbloquear
          todo o potencial do seu desenvolvimento profissional.
        </p>
      </div>

      {/* Success toast */}
      {success && (
        <div className="mx-auto max-w-md rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-center">
          <p className="text-sm font-medium text-emerald-300">
            Parabens! Voce agora e Premium. Aproveite todos os recursos!
          </p>
        </div>
      )}

      {/* Plans Grid */}
      <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-2">
        {/* Free Plan */}
        <Card className="relative border-white/10 bg-white/5 backdrop-blur-sm">
          <CardHeader className="space-y-4 pb-2">
            <div>
              <h3 className="text-xl font-bold">Gratuito</h3>
              <p className="text-sm text-muted-foreground">
                Comece sua jornada de autoconhecimento
              </p>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold">R$0</span>
              <span className="text-muted-foreground">/mes</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <ul className="space-y-3">
              {freePlanFeatures.map((feature) => (
                <li key={feature} className="flex items-center gap-3 text-sm">
                  <Check className="h-4 w-4 shrink-0 text-emerald-400" />
                  {feature}
                </li>
              ))}
            </ul>
            <Button
              variant="outline"
              className="w-full border-white/20"
              disabled
            >
              {!isPremium ? "Plano Atual" : "Plano Gratuito"}
            </Button>
          </CardContent>
        </Card>

        {/* Premium Plan */}
        <div className="relative">
          {/* Gradient border glow */}
          <div className="absolute -inset-[1px] rounded-xl bg-gradient-to-br from-green-500 via-lime-500 to-lime-500 opacity-75 blur-sm" />
          <div className="absolute -inset-[1px] rounded-xl bg-gradient-to-br from-green-500 via-lime-500 to-lime-500" />

          <Card className="relative h-full border-0 bg-[hsl(var(--card))]">
            <CardHeader className="space-y-4 pb-2">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-bold">Premium</h3>
                  <p className="text-sm text-muted-foreground">
                    Desbloqueie todo seu potencial
                  </p>
                </div>
                <Badge className="bg-gradient-to-r from-green-600 to-lime-600 border-0 text-white">
                  <Crown className="mr-1 h-3 w-3" />
                  Recomendado
                </Badge>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold bg-gradient-to-r from-green-400 to-lime-400 bg-clip-text text-transparent">
                  R$29,90
                </span>
                <span className="text-muted-foreground">/mes</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <ul className="space-y-3">
                {premiumFeatures.map((feature, i) => (
                  <li key={feature} className="flex items-center gap-3 text-sm">
                    <Check
                      className={`h-4 w-4 shrink-0 ${
                        i === 0 ? "text-green-400" : "text-emerald-400"
                      }`}
                    />
                    <span className={i === 0 ? "font-semibold text-green-300" : ""}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
              <Button
                onClick={handleSubscribe}
                disabled={loading || isPremium}
                className="w-full bg-gradient-to-r from-green-600 to-lime-600 hover:from-green-700 hover:to-lime-700 shadow-lg shadow-green-500/25"
                size="lg"
              >
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : isPremium ? (
                  <Check className="mr-2 h-4 w-4" />
                ) : (
                  <Crown className="mr-2 h-4 w-4" />
                )}
                {isPremium ? "Plano Atual" : "Assinar Premium"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
