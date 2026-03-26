"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency, formatDate, DEAL_STAGE_LABELS } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { Deal, User } from "@/lib/types";

const STAGE_COLORS: Record<string, string> = {
  discovery: "bg-slate-100 text-slate-700",
  proposal: "bg-zinc-100 text-zinc-700",
  negotiation: "bg-amber-100 text-amber-700",
  contract: "bg-blue-100 text-blue-700",
  closed_won: "bg-green-100 text-green-700",
  closed_lost: "bg-red-100 text-red-700",
};

const CURRENCIES = ["AED", "USD", "EUR", "GBP", "SAR", "QAR"];

interface DealDetailProps {
  deal: Deal;
  users: Partial<User>[];
  onClose: () => void;
  onUpdated: (deal: Deal) => void;
}

export function DealDetail({ deal, users, onClose, onUpdated }: DealDetailProps) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: deal.title,
    stage: deal.stage,
    value: deal.value?.toString() || "",
    currency: deal.currency,
    probability: deal.probability.toString(),
    expected_close_date: deal.expected_close_date || "",
    lost_reason: deal.lost_reason || "",
    owner_id: deal.owner_id || "",
    notes: deal.notes || "",
  });

  const update = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("deals")
      .update({
        title: form.title,
        stage: form.stage,
        value: form.value ? parseFloat(form.value) : null,
        currency: form.currency,
        probability: parseInt(form.probability) || 0,
        expected_close_date: form.expected_close_date || null,
        lost_reason: form.lost_reason || null,
        owner_id: form.owner_id || null,
        notes: form.notes || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", deal.id)
      .select("*, owner:users!deals_owner_id_fkey(id, full_name, avatar_url), company:companies(id, name)")
      .single();

    if (error) {
      toast.error("Failed to save: " + error.message);
    } else {
      toast.success("Deal updated");
      onUpdated(data as unknown as Deal);
    }
    setSaving(false);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-full max-w-xl bg-white shadow-2xl z-50 flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <div>
            <h2 className="font-semibold text-slate-900 text-base">{deal.title}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium", STAGE_COLORS[deal.stage])}>
                {DEAL_STAGE_LABELS[deal.stage]}
              </span>
              {deal.value && (
                <span className="text-xs text-slate-500 font-medium">
                  {formatCurrency(deal.value, deal.currency)}
                </span>
              )}
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          <div className="space-y-1.5">
            <Label>Title</Label>
            <Input value={form.title} onChange={(e) => update("title", e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Stage</Label>
              <Select value={form.stage} onValueChange={(v) => update("stage", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(DEAL_STAGE_LABELS).map(([v, l]) => (
                    <SelectItem key={v} value={v}>{l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Currency</Label>
              <Select value={form.currency} onValueChange={(v) => update("currency", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Value</Label>
              <Input type="number" value={form.value} onChange={(e) => update("value", e.target.value)} min="0" />
            </div>
            <div className="space-y-1.5">
              <Label>Probability %</Label>
              <Input type="number" value={form.probability} onChange={(e) => update("probability", e.target.value)} min="0" max="100" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Expected Close Date</Label>
            <Input type="date" value={form.expected_close_date} onChange={(e) => update("expected_close_date", e.target.value)} />
          </div>

          {form.stage === "closed_lost" && (
            <div className="space-y-1.5">
              <Label>Lost Reason</Label>
              <Input value={form.lost_reason} onChange={(e) => update("lost_reason", e.target.value)} placeholder="Why was this lost?" />
            </div>
          )}

          <div className="space-y-1.5">
            <Label>Assigned To</Label>
            <Select value={form.owner_id || "__none__"} onValueChange={(v) => update("owner_id", v === "__none__" ? "" : v)}>
              <SelectTrigger><SelectValue placeholder="Unassigned" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">Unassigned</SelectItem>
                {users.map((u) => <SelectItem key={u.id!} value={u.id!}>{u.full_name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Notes</Label>
            <Textarea value={form.notes} onChange={(e) => update("notes", e.target.value)} rows={4} />
          </div>

          <div className="text-xs text-slate-400 space-y-1">
            <p>Created: {formatDate(deal.created_at)}</p>
            {deal.company && <p>Company: {deal.company.name}</p>}
          </div>
        </div>

        <div className="px-5 py-4 border-t border-slate-200 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="animate-spin" />}
            {saving ? "Saving…" : "Save"}
          </Button>
        </div>
      </div>
    </>
  );
}
