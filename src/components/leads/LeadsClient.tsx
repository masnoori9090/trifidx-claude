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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search } from "lucide-react";
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

  return (
    <div className="flex flex-col h-full">
      {/* DB setup banner */}
      {error && <SetupBanner error={error} />}

      {/* Toolbar */}
      <div className="px-6 py-4 bg-white border-b border-slate-200 space-y-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <Tabs
            value={filters.tab}
            onValueChange={(v) => updateFilter("tab", v as "everyone" | "mine" | "all")}
          >
            <TabsList className="h-8">
              <TabsTrigger value="everyone" className="text-xs px-3 py-1">Everyone</TabsTrigger>
              <TabsTrigger value="mine" className="text-xs px-3 py-1">Mine</TabsTrigger>
              <TabsTrigger value="all" className="text-xs px-3 py-1">All</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <Input
                placeholder="Search leads…"
                className="pl-8 h-8 w-56 text-sm"
                onChange={(e) => updateSearch(e.target.value)}
              />
            </div>
            <Button size="sm" onClick={() => setAddModalOpen(true)}>
              <Plus className="h-4 w-4" />
              Add Lead
            </Button>
          </div>
        </div>

        <LeadFilters filters={filters} users={users} onFilter={updateFilter} />
      </div>

      {/* Summary bar */}
      <div className="px-6 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <span className="text-xs text-slate-500">
          {loading ? "Loading…" : error ? "Error loading leads" : `${total.toLocaleString()} lead${total !== 1 ? "s" : ""}`}
        </span>
        {error && !error.includes("schema cache") && (
          <span className="text-xs text-red-500">{error}</span>
        )}
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
