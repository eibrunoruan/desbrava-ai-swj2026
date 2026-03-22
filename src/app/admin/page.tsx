"use client";

import { useEffect, useState } from "react";
import { RefreshCw, Users, Eye, MousePointer, TrendingUp, Phone, Building2 } from "lucide-react";

interface Metrics {
  totalUsers: number;
  users: Array<{
    id: string;
    name: string;
    email: string;
    job_role: string | null;
    target_role: string | null;
    plan: string;
    created_at: string;
  }>;
  analyticsSummary: Record<string, number>;
  leads: Array<{
    id: string;
    user_id: string | null;
    name: string | null;
    email: string | null;
    phone: string | null;
    source: string;
    created_at: string;
  }>;
  ctaButtonCounts: Record<string, number>;
  landingPageViews: number;
  premiumUsers: number;
  assessmentsCompleted: number;
}

const CTA_LABELS: Record<string, string> = {
  comecar_jornada: "Comecar Jornada",
  comecar_gratis: "Comecar Gratis",
  comece_agora: "Comece Agora",
  premium_plan_confirm: "Premium Plan Confirm",
  enterprise_contact: "Fale Conosco (Enterprise)",
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminPage() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchMetrics = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/metrics");
      if (!res.ok) throw new Error("Failed to fetch metrics");
      const data = await res.json();
      setMetrics(data);
    } catch (err) {
      setError("Erro ao carregar metricas. Tente novamente.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const totalCtaClicks = metrics
    ? Object.values(metrics.ctaButtonCounts).reduce((a, b) => a + b, 0)
    : 0;

  const conversionRate = metrics && metrics.totalUsers > 0
    ? ((metrics.premiumUsers / metrics.totalUsers) * 100).toFixed(1)
    : "0";

  const premiumLeads = metrics?.leads.filter((l) => l.source === "premium_plan") || [];
  const enterpriseLeads = metrics?.leads.filter((l) => l.source === "enterprise") || [];

  // Find max CTA count for bar scaling
  const maxCtaCount = metrics
    ? Math.max(...Object.values(metrics.ctaButtonCounts), 1)
    : 1;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              <span className="bg-gradient-to-r from-green-400 to-lime-400 bg-clip-text text-transparent">
                Destrava.Ai
              </span>
              <span className="ml-2 text-white/60">- Painel Admin</span>
            </h1>
            <p className="mt-1 text-sm text-white/40">
              Metricas e dados em tempo real
            </p>
          </div>
          <button
            onClick={fetchMetrics}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Atualizar
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-center text-red-300">
            {error}
          </div>
        )}

        {loading && !metrics ? (
          <div className="flex items-center justify-center py-20">
            <RefreshCw className="h-8 w-8 animate-spin text-green-400" />
          </div>
        ) : metrics ? (
          <div className="space-y-8">
            {/* KPI Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <KPICard
                icon={<Users className="h-5 w-5" />}
                label="Total Usuarios"
                value={metrics.totalUsers.toString()}
                color="green"
              />
              <KPICard
                icon={<Eye className="h-5 w-5" />}
                label="Views na LP"
                value={metrics.landingPageViews.toString()}
                color="blue"
              />
              <KPICard
                icon={<MousePointer className="h-5 w-5" />}
                label="Cliques em CTAs"
                value={totalCtaClicks.toString()}
                color="purple"
              />
              <KPICard
                icon={<TrendingUp className="h-5 w-5" />}
                label="Conversao Premium"
                value={`${conversionRate}%`}
                subtitle={`${metrics.premiumUsers} de ${metrics.totalUsers}`}
                color="lime"
              />
            </div>

            {/* Fake Door - Intencao de Compra */}
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/10">
                  <Phone className="h-4 w-4 text-green-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Fake Door - Intencao de Compra</h2>
                  <p className="text-sm text-white/40">
                    {premiumLeads.length} lead{premiumLeads.length !== 1 ? "s" : ""} capturado{premiumLeads.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>

              {premiumLeads.length === 0 ? (
                <p className="py-8 text-center text-white/30">Nenhum lead premium capturado ainda.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10 text-left text-white/50">
                        <th className="pb-3 pr-4 font-medium">Nome</th>
                        <th className="pb-3 pr-4 font-medium">Email</th>
                        <th className="pb-3 pr-4 font-medium">Telefone</th>
                        <th className="pb-3 font-medium">Data</th>
                      </tr>
                    </thead>
                    <tbody>
                      {premiumLeads.map((lead) => (
                        <tr key={lead.id} className="border-b border-white/5">
                          <td className="py-3 pr-4">{lead.name || "-"}</td>
                          <td className="py-3 pr-4 text-white/70">{lead.email || "-"}</td>
                          <td className="py-3 pr-4">
                            <span className="rounded-md bg-green-500/10 px-2 py-1 text-green-400">
                              {lead.phone || "-"}
                            </span>
                          </td>
                          <td className="py-3 text-white/50">{formatDate(lead.created_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Fake Door - CTAs Landing Page */}
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10">
                  <MousePointer className="h-4 w-4 text-purple-400" />
                </div>
                <h2 className="text-lg font-semibold">Fake Door - CTAs Landing Page</h2>
              </div>

              <div className="space-y-3">
                {Object.entries(metrics.ctaButtonCounts).length === 0 ? (
                  <p className="py-8 text-center text-white/30">Nenhum clique registrado ainda.</p>
                ) : (
                  Object.entries(metrics.ctaButtonCounts).map(([button, count]) => (
                    <div key={button} className="flex items-center gap-4">
                      <span className="w-48 shrink-0 text-sm text-white/70">
                        {CTA_LABELS[button] || button}
                      </span>
                      <div className="flex-1">
                        <div className="h-8 overflow-hidden rounded-lg bg-white/5">
                          <div
                            className="flex h-full items-center rounded-lg bg-gradient-to-r from-green-600/80 to-lime-600/80 px-3 text-xs font-medium transition-all duration-500"
                            style={{ width: `${Math.max((count / maxCtaCount) * 100, 8)}%` }}
                          >
                            {count}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Leads Empresariais */}
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10">
                  <Building2 className="h-4 w-4 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Leads Empresariais</h2>
                  <p className="text-sm text-white/40">
                    {enterpriseLeads.length} lead{enterpriseLeads.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>

              {enterpriseLeads.length === 0 ? (
                <p className="py-8 text-center text-white/30">Nenhum lead empresarial capturado ainda.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10 text-left text-white/50">
                        <th className="pb-3 pr-4 font-medium">Nome</th>
                        <th className="pb-3 pr-4 font-medium">Email</th>
                        <th className="pb-3 pr-4 font-medium">Telefone</th>
                        <th className="pb-3 font-medium">Data</th>
                      </tr>
                    </thead>
                    <tbody>
                      {enterpriseLeads.map((lead) => (
                        <tr key={lead.id} className="border-b border-white/5">
                          <td className="py-3 pr-4">{lead.name || "-"}</td>
                          <td className="py-3 pr-4 text-white/70">{lead.email || "-"}</td>
                          <td className="py-3 pr-4 text-white/70">{lead.phone || "-"}</td>
                          <td className="py-3 text-white/50">{formatDate(lead.created_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Todos os Usuarios */}
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/10">
                  <Users className="h-4 w-4 text-green-400" />
                </div>
                <h2 className="text-lg font-semibold">Todos os Usuarios</h2>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-left text-white/50">
                      <th className="pb-3 pr-4 font-medium">Nome</th>
                      <th className="pb-3 pr-4 font-medium">Email</th>
                      <th className="pb-3 pr-4 font-medium">Cargo</th>
                      <th className="pb-3 pr-4 font-medium">Objetivo</th>
                      <th className="pb-3 pr-4 font-medium">Plano</th>
                      <th className="pb-3 font-medium">Data de Cadastro</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metrics.users.map((user) => (
                      <tr key={user.id} className="border-b border-white/5">
                        <td className="py-3 pr-4 font-medium">{user.name || "-"}</td>
                        <td className="py-3 pr-4 text-white/70">{user.email}</td>
                        <td className="py-3 pr-4 text-white/60">{user.job_role || "-"}</td>
                        <td className="py-3 pr-4 text-white/60">{user.target_role || "-"}</td>
                        <td className="py-3 pr-4">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              user.plan === "premium"
                                ? "bg-green-500/10 text-green-400 ring-1 ring-green-500/20"
                                : "bg-white/5 text-white/50 ring-1 ring-white/10"
                            }`}
                          >
                            {user.plan === "premium" ? "Premium" : "Free"}
                          </span>
                        </td>
                        <td className="py-3 text-white/50">{formatDate(user.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function KPICard({
  icon,
  label,
  value,
  subtitle,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtitle?: string;
  color: "green" | "blue" | "purple" | "lime";
}) {
  const colorMap = {
    green: "from-green-500/10 to-green-500/5 border-green-500/20 text-green-400",
    blue: "from-blue-500/10 to-blue-500/5 border-blue-500/20 text-blue-400",
    purple: "from-purple-500/10 to-purple-500/5 border-purple-500/20 text-purple-400",
    lime: "from-lime-500/10 to-lime-500/5 border-lime-500/20 text-lime-400",
  };

  const iconColorMap = {
    green: "bg-green-500/10 text-green-400",
    blue: "bg-blue-500/10 text-blue-400",
    purple: "bg-purple-500/10 text-purple-400",
    lime: "bg-lime-500/10 text-lime-400",
  };

  return (
    <div className={`rounded-xl border bg-gradient-to-br p-5 ${colorMap[color]}`}>
      <div className="flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${iconColorMap[color]}`}>
          {icon}
        </div>
        <div>
          <p className="text-sm text-white/50">{label}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
          {subtitle && <p className="text-xs text-white/40">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
}
