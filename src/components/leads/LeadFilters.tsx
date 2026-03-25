"use client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { LeadsFilters } from "@/lib/hooks/useLeads";
import type { User } from "@/lib/types";
import { LEAD_SOURCE_LABELS, LEAD_STATUS_LABELS } from "@/lib/utils";

interface LeadFiltersProps {
  filters: LeadsFilters;
  users: Partial<User>[];
  onFilter: (key: keyof LeadsFilters, value: string) => void;
}

const COUNTRIES = [
  "UAE", "Saudi Arabia", "Qatar", "Kuwait", "Bahrain", "Oman",
  "Egypt", "Jordan", "Lebanon", "UK", "USA", "Australia", "Canada",
  "Germany", "France", "India", "Pakistan", "Philippines",
];

const INDUSTRIES = [
  "Retail", "Food & Beverage", "Fashion", "Technology", "Healthcare",
  "Real Estate", "Education", "Finance", "Hospitality", "Beauty & Wellness",
  "Automotive", "Construction", "Media & Entertainment", "Logistics",
  "E-commerce", "Other",
];

export function LeadFilters({ filters, users, onFilter }: LeadFiltersProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {/* Status */}
      <Select
        value={filters.status || "__all__"}
        onValueChange={(v) => onFilter("status", v === "__all__" ? "" : v)}
      >
        <SelectTrigger className="h-7 w-36 text-xs">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all__">All Statuses</SelectItem>
          {Object.entries(LEAD_STATUS_LABELS).map(([value, label]) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Source */}
      <Select
        value={filters.source || "__all__"}
        onValueChange={(v) => onFilter("source", v === "__all__" ? "" : v)}
      >
        <SelectTrigger className="h-7 w-36 text-xs">
          <SelectValue placeholder="Source" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all__">All Sources</SelectItem>
          {Object.entries(LEAD_SOURCE_LABELS).map(([value, label]) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Country */}
      <Select
        value={filters.country || "__all__"}
        onValueChange={(v) => onFilter("country", v === "__all__" ? "" : v)}
      >
        <SelectTrigger className="h-7 w-36 text-xs">
          <SelectValue placeholder="Country" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all__">All Countries</SelectItem>
          {COUNTRIES.map((c) => (
            <SelectItem key={c} value={c}>
              {c}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Owner */}
      <Select
        value={filters.owner_id || "__all__"}
        onValueChange={(v) =>
          onFilter("owner_id", v === "__all__" ? "" : v)
        }
      >
        <SelectTrigger className="h-7 w-40 text-xs">
          <SelectValue placeholder="Assigned To" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all__">All Owners</SelectItem>
          <SelectItem value="__unassigned__">Unassigned</SelectItem>
          {users.map((u) => (
            <SelectItem key={u.id!} value={u.id!}>
              {u.full_name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
