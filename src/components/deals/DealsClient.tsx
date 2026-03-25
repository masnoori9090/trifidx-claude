"use client";
import { useState } from "react";
import { useDeals } from "@/lib/hooks/useDeals";
import { DealsTable } from "./DealsTable";
import { DealDetail } from "./DealDetail";
import { AddDealModal } from "./AddDealModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search } from "lucide-react";
import { DEAL_STAGE_LABELS } from "@/lib/utils";
import type { Deal, User } from "@/lib/types";

interface DealsClientProps {
  users: Partial<User>[];
}

export function DealsClient({ users }: DealsClientProps) {
  const { deals, total, loading, filters, pageSize, updateFilter, setPage, refetch } = useDeals();
  const [addOpen, setAddOpen] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="px-6 py-4 bg-white border-b border-slate-200 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <Input
              placeholder="Search deals…"
              className="pl-8 h-8 w-56 text-sm"
              onChange={(e) => {
                clearTimeout((window as any)._dealSearchTimeout);
                (window as any)._dealSearchTimeout = setTimeout(() => updateFilter("search", e.target.value), 300);
              }}
            />
          </div>

          {/* Stage filter */}
          <Select value={filters.stage || "__all__"} onValueChange={(v) => updateFilter("stage", v === "__all__" ? "" : v)}>
            <SelectTrigger className="h-8 w-36 text-xs"><SelectValue placeholder="Stage" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All Stages</SelectItem>
              {Object.entries(DEAL_STAGE_LABELS).map(([v, l]) => (
                <SelectItem key={v} value={v}>{l}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Owner filter */}
          <Select value={filters.owner_id || "__all__"} onValueChange={(v) => updateFilter("owner_id", v === "__all__" ? "" : v)}>
            <SelectTrigger className="h-8 w-40 text-xs"><SelectValue placeholder="Owner" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All Owners</SelectItem>
              {users.map((u) => <SelectItem key={u.id!} value={u.id!}>{u.full_name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <Button size="sm" onClick={() => setAddOpen(true)}>
          <Plus className="h-4 w-4" /> Add Deal
        </Button>
      </div>

      {/* Summary */}
      <div className="px-6 py-2 bg-slate-50 border-b border-slate-200">
        <span className="text-xs text-slate-500">
          {loading ? "Loading…" : `${total.toLocaleString()} deals`}
        </span>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <DealsTable deals={deals} loading={loading} onRowClick={setSelectedDeal} />
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-3 border-t border-slate-200 bg-white">
          <span className="text-xs text-slate-500">Page {filters.page + 1} of {totalPages}</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage(filters.page - 1)} disabled={filters.page === 0}>Previous</Button>
            <Button variant="outline" size="sm" onClick={() => setPage(filters.page + 1)} disabled={filters.page >= totalPages - 1}>Next</Button>
          </div>
        </div>
      )}

      <AddDealModal open={addOpen} onClose={() => setAddOpen(false)} onCreated={refetch} users={users} />
      {selectedDeal && (
        <DealDetail deal={selectedDeal} users={users} onClose={() => setSelectedDeal(null)} onUpdated={(d) => { setSelectedDeal(d); refetch(); }} />
      )}
    </div>
  );
}
