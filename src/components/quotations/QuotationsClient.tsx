"use client";
import { useState } from "react";
import { useQuotations } from "@/lib/hooks/useQuotations";
import { useAuth } from "@/lib/hooks/useAuth";
import { createClient } from "@/lib/supabase/client";
import { CreateQuotationModal } from "./CreateQuotationModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Plus, Pencil, Eye, FileDown, Trash2, Check, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { cn, formatDate, COUNTRIES } from "@/lib/utils";
import type { Quotation, User } from "@/lib/types";

interface QuotationsClientProps {
  users: Partial<User>[];
  initialQuotations?: Quotation[];
}

export function QuotationsClient({ users, initialQuotations }: QuotationsClientProps) {
  const { authUser } = useAuth();
  const { quotations, loading, error, setSearch, setSalespersonFilter, setCountryFilter, refetch } = useQuotations(authUser?.id, initialQuotations);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="px-6 py-4 bg-white border-b border-slate-200">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <Input
              placeholder="Search quotations..."
              className="pl-8 h-8 text-sm"
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={refetch} className="h-8">
              <RefreshCw className="h-3.5 w-3.5" />
              Fix Legacy Data
            </Button>
            <Button size="sm" onClick={() => setCreateModalOpen(true)} className="h-8">
              <Plus className="h-4 w-4" />
              Create Quotation
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 mt-3">
          <Select onValueChange={(v) => setSalespersonFilter(v === "all" ? "" : v)}>
            <SelectTrigger className="h-8 w-44 text-xs">
              <SelectValue placeholder="All Salespeople" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Salespeople</SelectItem>
              {users.map((u) => (
                <SelectItem key={u.id!} value={u.id!}>{u.full_name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select onValueChange={(v) => setCountryFilter(v === "all" ? "" : v)}>
            <SelectTrigger className="h-8 w-36 text-xs">
              <SelectValue placeholder="All Countries" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Countries</SelectItem>
              {COUNTRIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-28 w-full rounded-xl" />
            ))}
          </div>
        ) : error && error.includes("exist") ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <p className="text-sm font-medium">Database not set up yet</p>
            <p className="text-xs mt-1">Run the setup SQL first</p>
          </div>
        ) : quotations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <p className="text-sm font-medium">No quotations yet</p>
            <p className="text-xs mt-1">Click &quot;Create Quotation&quot; to get started</p>
          </div>
        ) : (
          <div className="space-y-3">
            {quotations.map((quotation) => (
              <QuotationCard
                key={quotation.id}
                quotation={quotation}
                onRefetch={refetch}
              />
            ))}
          </div>
        )}
      </div>

      <CreateQuotationModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreated={refetch}
      />
    </div>
  );
}

function QuotationCard({ quotation, onRefetch }: { quotation: Quotation; onRefetch: () => void }) {
  const [approving, setApproving] = useState(false);

  const handleApprove = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setApproving(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("quotations")
      .update({ status: "approved", approved_at: new Date().toISOString() })
      .eq("id", quotation.id);
    if (error) {
      toast.error("Failed to approve");
    } else {
      toast.success("Quotation approved");
      onRefetch();
    }
    setApproving(false);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Delete this quotation?")) return;
    const supabase = createClient();
    await supabase.from("quotations").update({ deleted_at: new Date().toISOString() }).eq("id", quotation.id);
    toast.success("Deleted");
    onRefetch();
  };

  const statusConfig: Record<string, { label: string; className: string }> = {
    draft: { label: "Draft", className: "bg-slate-100 text-slate-600 border border-slate-300" },
    approved: { label: "✓ Approved", className: "bg-green-100 text-green-700 border border-green-300" },
    sent: { label: "Sent", className: "bg-blue-100 text-blue-700 border border-blue-300" },
    rejected: { label: "Rejected", className: "bg-red-100 text-red-700 border border-red-300" },
  };

  const config = statusConfig[quotation.status] || statusConfig.draft;

  const currencyFormatted = (amount: number) =>
    `${quotation.currency} ${amount.toLocaleString("en-US", { minimumFractionDigits: 0 })}`;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-base font-bold text-slate-900">{quotation.quote_number}</span>
            {quotation.status !== "draft" && (
              <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", config.className)}>
                {config.label}
              </span>
            )}
            {quotation.status === "draft" && (
              <span className={cn("text-xs px-2 py-0.5 rounded font-medium", config.className)}>
                {config.label}
              </span>
            )}
          </div>
          <div className="text-sm text-slate-500 space-y-0.5">
            <p>Client: {quotation.client_name || "—"}</p>
            <p>Date: {formatDate(quotation.quote_date)}</p>
            <p>Valid Until: {formatDate(quotation.valid_until)}</p>
            <p>Salesperson: {quotation.creator?.full_name || "—"}</p>
          </div>
          <p className="mt-2 text-sm font-bold text-slate-900">
            Total: {currencyFormatted(quotation.total)}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 ml-4">
          <Button size="sm" variant="outline" className="h-8 text-xs gap-1">
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </Button>
          {quotation.status === "draft" ? (
            <Button
              size="sm"
              className="h-8 text-xs gap-1 bg-zinc-900 hover:bg-black"
              onClick={handleApprove}
              disabled={approving}
            >
              {approving ? (
                <span className="animate-spin text-xs">⟳</span>
              ) : (
                <Check className="h-3.5 w-3.5" />
              )}
              Approve
            </Button>
          ) : (
            <Button size="sm" variant="outline" className="h-8 text-xs gap-1">
              <Eye className="h-3.5 w-3.5" />
              View
            </Button>
          )}
          <Button size="sm" variant="outline" className="h-8 text-xs gap-1">
            <FileDown className="h-3.5 w-3.5" />
            PDF
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 text-xs text-red-500 hover:text-red-700 hover:bg-red-50"
            onClick={handleDelete}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}
