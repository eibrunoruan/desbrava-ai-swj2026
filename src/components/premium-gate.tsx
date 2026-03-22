"use client";

import Link from "next/link";
import { Lock, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface PremiumGateProps {
  feature: string;
  description: string;
}

export function PremiumGate({ feature, description }: PremiumGateProps) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="relative mx-auto max-w-lg text-center">
        {/* Background glow */}
        <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-green-500/10 via-lime-500/10 to-lime-500/10 blur-xl" />

        <div className="relative rounded-2xl border border-white/10 bg-white/5 p-10 backdrop-blur-xl">
          {/* Lock icon */}
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-green-500/20 to-lime-500/20 ring-1 ring-green-500/30">
            <Lock className="h-10 w-10 text-green-400" />
          </div>

          {/* Badge */}
          <Badge className="mb-4 bg-gradient-to-r from-green-600 to-lime-600 px-3 py-1 text-white border-0">
            <Crown className="mr-1.5 h-3.5 w-3.5" />
            Recurso Premium
          </Badge>

          {/* Feature name */}
          <h2 className="mb-3 text-2xl font-bold">
            <span className="bg-gradient-to-r from-green-400 to-lime-400 bg-clip-text text-transparent">
              {feature}
            </span>
          </h2>

          {/* Description */}
          <p className="mb-8 text-muted-foreground leading-relaxed">
            {description}
          </p>

          {/* CTA */}
          <Link href="/pricing">
            <Button
              size="lg"
              className="bg-gradient-to-r from-green-600 to-lime-600 px-8 hover:from-green-700 hover:to-lime-700 shadow-lg shadow-green-500/25"
            >
              <Crown className="mr-2 h-4 w-4" />
              Ver Planos
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
