"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageLoader } from "@/components/ui/loading";
import { DashboardCharts } from "@/components/dashboard-charts";
import { useAuthStore } from "@/stores/auth";

interface DashboardStats {
  stats: {
    totalRules: number;
    totalAnalyses: number;
    avgScore: number;
    criticalFindings: number;
  };
  recentActivity: Array<{
    id: string;
    analysisType: string;
    score: number;
    rating: string;
    createdAt: string;
    rule: { id: string; title: string } | null;
    user: { id: string; name: string } | null;
  }>;
  severityDistribution: Record<string, number>;
}

const TYPE_LABELS: Record<string, string> = {
  analyze: "Analysis",
  enhance: "Enhancement",
  generate: "Generation",
  feedback: "Feedback",
};

const SEVERITY_COLORS: Record<string, string> = {
  critical: "bg-danger",
  high: "bg-warning",
  medium: "bg-accent",
  low: "bg-success",
};

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [data, setData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard/stats")
      .then((r) => r.json())
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;

  const stats = data?.stats;
  const totalSeverity = Object.values(data?.severityDistribution || {}).reduce((a, b) => a + b, 0) || 1;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text">
            Welcome back, {user?.name?.split(" ")[0] || "Analyst"}
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            Here&apos;s an overview of your detection rule analysis activity.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardBody>
            <p className="text-sm text-text-secondary">Total Rules</p>
            <p className="text-3xl font-bold text-text mt-1">{stats?.totalRules ?? 0}</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-sm text-text-secondary">Analyses Run</p>
            <p className="text-3xl font-bold text-text mt-1">{stats?.totalAnalyses ?? 0}</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-sm text-text-secondary">Avg. Score</p>
            <p className={`text-3xl font-bold mt-1 ${
              (stats?.avgScore || 0) >= 80 ? "text-success" :
              (stats?.avgScore || 0) >= 60 ? "text-info" :
              (stats?.avgScore || 0) >= 40 ? "text-warning" : "text-danger"
            }`}>{stats?.avgScore ?? 0}</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-sm text-text-secondary">Critical Findings</p>
            <p className={`text-3xl font-bold mt-1 ${(stats?.criticalFindings || 0) > 0 ? "text-danger" : "text-success"}`}>
              {stats?.criticalFindings ?? 0}
            </p>
          </CardBody>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-text">Recent Activity</h2>
                <Link href="/dashboard/analysis/history">
                  <Button variant="ghost" size="sm">View All</Button>
                </Link>
              </div>
            </CardHeader>
            <CardBody>
              {data?.recentActivity?.length ? (
                <div className="space-y-3">
                  {data.recentActivity.map((a) => (
                    <Link
                      key={a.id}
                      href={`/dashboard/analysis/${a.id}`}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-surface-light transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Badge preset="info">{TYPE_LABELS[a.analysisType] || a.analysisType}</Badge>
                        <div>
                          <p className="text-sm text-text">{a.rule?.title || "Raw query"}</p>
                          <p className="text-xs text-text-muted">
                            by {a.user?.name} · {new Date(a.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {a.rating && <Badge preset={a.rating as "A+" | "A" | "B" | "C" | "D" | "F"}>{a.rating}</Badge>}
                        <span className={`text-sm font-bold ${
                          a.score >= 80 ? "text-success" : a.score >= 60 ? "text-info" :
                          a.score >= 40 ? "text-warning" : "text-danger"
                        }`}>{a.score}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-text-muted text-center py-8">No analyses yet. Run your first analysis to see activity here.</p>
              )}
            </CardBody>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader><h2 className="text-lg font-semibold text-text">Severity Distribution</h2></CardHeader>
            <CardBody>
              <div className="space-y-3">
                {(["critical", "high", "medium", "low"] as const).map((sev) => {
                  const count = data?.severityDistribution?.[sev] || 0;
                  const pct = Math.round((count / totalSeverity) * 100);
                  return (
                    <div key={sev}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-text capitalize">{sev}</span>
                        <span className="text-sm text-text-muted">{count}</span>
                      </div>
                      <div className="w-full bg-surface-light rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${SEVERITY_COLORS[sev]} transition-all`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardBody>
          </Card>

          <Card className="mt-6">
            <CardHeader><h2 className="text-lg font-semibold text-text">Quick Actions</h2></CardHeader>
            <CardBody className="space-y-2">
              <Link href="/dashboard/rules/new" className="block">
                <Button variant="primary" className="w-full justify-start">Create Rule</Button>
              </Link>
              <Link href="/dashboard/analysis" className="block">
                <Button variant="outline" className="w-full justify-start">Run Analysis</Button>
              </Link>
              <Link href="/dashboard/templates" className="block">
                <Button variant="ghost" className="w-full justify-start">Browse Templates</Button>
              </Link>
            </CardBody>
          </Card>
        </div>
      </div>

      <DashboardCharts />
    </div>
  );
}
