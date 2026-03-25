"use client";
import { useState } from "react";
import { useLeads } from "@/lib/hooks/useLeads";
import { useAuth } from "@/lib/hooks/useAuth";
import { LeadsTable } from "./LeadsTable";
import { LeadFilters } from "./LeadFilters";
import { AddLeadModal } from "./AddLeadModal";
import { LeadDetail } from "./LeadDetail";
import { SetupBanner } from "@/components/shared/SetupBanner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RefreshCw, Plus, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Lead, User } from "@/lib/types";

interface LeadsClientProps {
  users: Partial<User>[];
}

export function LeadsClient({ users }: LeadsClientProps) {
  const { authUser } = useAuth();
  const {
    leads, total, loading, error, filters, pageSize,
    updateSearch, updateFilter, setPage, refetch,
  } = useLeads(authUser?.id);

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const totalPages = Math.ceil(total / pageSize);
  const currentStart = filters.page * pageSize + 1;
  const currentEnd = Math.min((filters.page + 1) * pageSize, total);

  return (
    <div className="flex flex-col h-full">
      {/* DB setup banner */}
      {error && <SetupBanner error={error} />}

      {/* Toolbar */}
      <div className="px-6 py-3 bg-white border-b border-slate-200">
        <div className="flex items-center justify-between gap-3">
          {/* Tabs */}
          <div className="flex rounded-lg border border-slate-200 overflow-hidden">
            {(["everyone", "mine", "all"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => updateFilter("tab", tab)}
                className={cn(
                  "px-4 py-1.5 text-sm font-medium capitalize transition-colors",
                  filters.tab === tab
                    ? "bg-slate-900 text-white"
                    : "bg-white text-slate-500 hover:bg-slate-50"
                )}
              >
                {tab === "mine" ? (
                  <span className="flex items-center gap-1.5">
                    <span className="h-3.5 w-3.5 rounded-full bg-slate-300 inline-flex items-center justify-center text-[8px] font-bold text-slate-600">M</span>
                    Mine
                  </span>
                ) : tab === "everyone" ? "Everyone" : "All"}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <span className="text-xs text-slate-400 hidden sm:block">
              {loading ? "Loading…" : `Showing ${currentStart}–${currentEnd} of ${total.toLocaleString()} leads`}
            </span>
            <Button size="sm" variant="outline" onClick={refetch} className="h-8">
              <RefreshCw className="h-3.5 w-3.5" />
              Refresh
            </Button>
            <Button size="sm" onClick={() => setAddModalOpen(true)} className="h-8">
              <Plus className="h-4 w-4" />
              Add Lead
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative mt-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <Input
            placeholder="Search by name, email, phone, company, country..."
            className="pl-9 h-9 text-sm"
            onChange={(e) => updateSearch(e.target.value)}
          />
        </div>

        {/* Filters */}
        <div className="mt-3">
          <LeadFilters filters={filters} users={users} onFilter={updateFilter} />
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <LeadsTable
          leads={leads}
          loading={loading}
          onRowClick={(lead) => setSelectedLead(lead)}
        />
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-3 border-t border-slate-200 bg-white">
          <span className="text-xs text-slate-500">
            Page {filters.page + 1} of {totalPages}
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage(filters.page - 1)} disabled={filters.page === 0}>Previous</Button>
            <Button variant="outline" size="sm" onClick={() => setPage(filters.page + 1)} disabled={filters.page >= totalPages - 1}>Next</Button>
          </div>
        </div>
      )}

      <AddLeadModal open={addModalOpen} onClose={() => setAddModalOpen(false)} onCreated={refetch} users={users} />

      {selectedLead && (
        <LeadDetail
          lead={selectedLead}
          users={users}
          onClose={() => setSelectedLead(null)}
          onUpdated={(updated) => { setSelectedLead(updated); refetch(); }}
        />
      )}
    </div>
  );
}
