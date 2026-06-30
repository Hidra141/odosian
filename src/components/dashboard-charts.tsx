"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

interface ChartData {
  scoreTrend: Array<{ date: string; avgScore: number; count: number }>;
  ruleTimeline: Array<{ date: string; count: number }>;
  analysisTypes: Array<{ type: string; count: number }>;
  rulesByLanguage: Array<{ language: string; count: number }>;
}

const COLORS = ["#4CBDFA", "#84E29E", "#6ED1CA", "#F4A261", "#E76F51", "#B5838D"];

const TYPE_LABELS: Record<string, string> = {
  analyze: "Analysis",
  enhance: "Enhancement",
  generate: "Generation",
  feedback: "Feedback",
};

function formatDate(d: unknown) {
  return new Date(String(d)).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function DashboardCharts() {
  const [data, setData] = useState<ChartData | null>(null);

  useEffect(() => {
    fetch("/api/dashboard/charts")
      .then((r) => r.json())
      .then(setData)
      .catch(() => {});
  }, []);

  if (!data) return null;

  const hasScoreData = data.scoreTrend.length > 0;
  const hasRuleData = data.ruleTimeline.length > 0;
  const hasTypeData = data.analysisTypes.length > 0;
  const hasLangData = data.rulesByLanguage.length > 0;

  if (!hasScoreData && !hasRuleData && !hasTypeData && !hasLangData) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {hasScoreData && (
        <Card>
          <CardHeader><h2 className="text-sm font-semibold text-text">Analysis Score Trend (30 days)</h2></CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={data.scoreTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fill: "var(--color-text-muted)", fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fill: "var(--color-text-muted)", fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 8, color: "var(--color-text)" }}
                  labelFormatter={formatDate}
                />
                <Line type="monotone" dataKey="avgScore" stroke="#4CBDFA" strokeWidth={2} dot={{ r: 3 }} name="Avg Score" />
              </LineChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
      )}

      {hasRuleData && (
        <Card>
          <CardHeader><h2 className="text-sm font-semibold text-text">Rules Created (30 days)</h2></CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data.ruleTimeline}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fill: "var(--color-text-muted)", fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fill: "var(--color-text-muted)", fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 8, color: "var(--color-text)" }}
                  labelFormatter={formatDate}
                />
                <Bar dataKey="count" fill="#84E29E" radius={[4, 4, 0, 0]} name="Rules" />
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
      )}

      {hasTypeData && (
        <Card>
          <CardHeader><h2 className="text-sm font-semibold text-text">Analysis Type Distribution</h2></CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={data.analysisTypes.map((d) => ({ ...d, name: TYPE_LABELS[d.type] || d.type }))}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="count"
                  nameKey="name"
                >
                  {data.analysisTypes.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 8, color: "var(--color-text)" }} />
                <Legend wrapperStyle={{ color: "var(--color-text-secondary)", fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
      )}

      {hasLangData && (
        <Card>
          <CardHeader><h2 className="text-sm font-semibold text-text">Rules by Language</h2></CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data.rulesByLanguage} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis type="number" allowDecimals={false} tick={{ fill: "var(--color-text-muted)", fontSize: 11 }} />
                <YAxis dataKey="language" type="category" tick={{ fill: "var(--color-text-muted)", fontSize: 11 }} width={60} />
                <Tooltip contentStyle={{ backgroundColor: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 8, color: "var(--color-text)" }} />
                <Bar dataKey="count" fill="#6ED1CA" radius={[0, 4, 4, 0]} name="Rules" />
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
