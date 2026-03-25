"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/hooks/useAuth";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { User } from "@/lib/types";
import { DEAL_STAGE_LABELS } from "@/lib/utils";

interface AddDealModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
  users: Partial<User>[];
}

const CURRENCIES = ["AED", "USD", "EUR", "GBP", "SAR", "QAR"];

export function AddDealModal({ open, onClose, onCreated, users }: AddDealModalProps) {
  const { authUser } = useAuth();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "",
    stage: "discovery",
    value: "",
    currency: "AED",
    probability: "50",
    expected_close_date: "",
    owner_id: "",
    notes: "",
  });

  const update = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.from("deals").insert({
      title: form.title,
      stage: form.stage,
      value: form.value ? parseFloat(form.value) : null,
      currency: form.currency,
      probability: parseInt(form.probability) || 0,
      expected_close_date: form.expected_close_date || null,
      owner_id: form.owner_id || null,
      notes: form.notes || null,
      created_by: authUser?.id,
    });

    if (error) {
      toast.error("Failed to create deal: " + error.message);
    } else {
      toast.success("Deal created");
      onCreated();
      onClose();
      setForm({ title: "", stage: "discovery", value: "", currency: "AED", probability: "50", expected_close_date: "", owner_id: "", notes: "" });
    }
    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add New Deal</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Title <span className="text-red-500">*</span></Label>
            <Input value={form.title} onChange={(e) => update("title", e.target.value)} placeholder="Deal name" required />
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
              <Input type="number" value={form.value} onChange={(e) => update("value", e.target.value)} placeholder="0" min="0" />
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

          <div className="space-y-1.5">
            <Label>Assign To</Label>
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
            <Textarea value={form.notes} onChange={(e) => update("notes", e.target.value)} rows={2} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="animate-spin" />}
              {saving ? "Creating…" : "Create Deal"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
