"use client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { LEAD_SOURCE_LABELS, LEAD_STATUS_LABELS } from "@/lib/utils";

interface PipelineChartProps {
  bySource: Array<{ source: string; count: number }>;
  byStatus: Array<{ status: string; count: number }>;
  byCountry: Array<{ country: string; count: number }>;
}

const COLORS = [
  "#6366f1", "#10b981", "#f59e0b", "#8b5cf6",
  "#ec4899", "#14b8a6", "#f97316", "#64748b",
];

export function PipelineChart({ bySource, byStatus, byCountry }: PipelineChartProps) {
  const sourceData = bySource.map((d) => ({
    name: LEAD_SOURCE_LABELS[d.source] || d.source,
    value: d.count,
  }));

  const statusData = byStatus.map((d) => ({
    name: LEAD_STATUS_LABELS[d.status] || d.status,
    count: d.count,
  }));

  const countryData = byCountry.slice(0, 10).map((d) => ({
    name: d.country || "Unknown",
    count: d.count,
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Leads by Source — Pie */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="text-sm font-semibold text-slate-900 mb-4">Leads by Source</h3>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={sourceData}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
            >
              {sourceData.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => [value, "Leads"]}
              contentStyle={{ fontSize: 12 }}
            />
            <Legend
              formatter={(value) => <span className="text-xs">{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Pipeline Funnel — Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="text-sm font-semibold text-slate-900 mb-4">Pipeline Stages</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={statusData} layout="vertical">
            <XAxis type="number" tick={{ fontSize: 11 }} />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fontSize: 11 }}
              width={72}
            />
            <Tooltip contentStyle={{ fontSize: 12 }} />
            <Bar dataKey="count" fill="#6366f1" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Leads by Country — Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="text-sm font-semibold text-slate-900 mb-4">Top Countries</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={countryData} layout="vertical">
            <XAxis type="number" tick={{ fontSize: 11 }} />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fontSize: 11 }}
              width={72}
            />
            <Tooltip contentStyle={{ fontSize: 12 }} />
            <Bar dataKey="count" fill="#10b981" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
