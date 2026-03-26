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
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import type { User } from "@/lib/types";
import { SERVICES, COUNTRIES } from "@/lib/utils";

interface AddDealModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
  users: Partial<User>[];
  currentUserId?: string;
}

const QUICK_START_TEMPLATES = [
  "Social Media Management",
  "Website Development",
  "SEO Package",
  "Content Production",
  "Full Service Package",
];

export function AddDealModal({ open, onClose, onCreated, users, currentUserId }: AddDealModalProps) {
  const { authUser } = useAuth();
  const [saving, setSaving] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    company_name: "",
    contact_name: "",
    phone: "",
    email: "",
    country: "",
    lead_source: "inbound",
    service: "",
    value: "",
  });

  const update = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const applyTemplate = (template: string) => {
    setSelectedTemplate(template);
    setForm((f) => ({ ...f, service: template, title: f.company_name ? `${f.company_name} — ${template}` : template }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);

    const supabase = createClient();
    const { error } = await supabase.from("deals").insert({
      title: form.title,
      company_name: form.company_name || null,
      contact_name: form.contact_name || null,
      phone: form.phone || null,
      email: form.email || null,
      country: form.country || null,
      service: form.service || null,
      value: form.value ? parseFloat(form.value) : null,
      currency: "AED",
      stage: "new_lead",
      probability: 10,
      owner_id: currentUserId || authUser?.id || null,
      created_by: authUser?.id,
    });

    if (error) {
      toast.error("Failed to create deal: " + error.message);
    } else {
      toast.success("Deal created");
      onCreated();
      onClose();
      setForm({ title: "", company_name: "", contact_name: "", phone: "", email: "", country: "", lead_source: "inbound", service: "", value: "" });
      setSelectedTemplate(null);
    }
    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New Deal</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Quick Start Templates */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
              <span className="text-xs font-medium text-slate-600">Quick Start with Template</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {QUICK_START_TEMPLATES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => applyTemplate(t)}
                  className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                    selectedTemplate === t
                      ? "bg-zinc-900 text-white border-zinc-900"
                      : "border-slate-200 text-slate-600 hover:border-zinc-400 hover:text-zinc-900"
                  }`}
                >
                  {t}
                </button>
              ))}
              <button
                type="button"
                onClick={() => { setSelectedTemplate(null); }}
                className="text-xs px-3 py-1 rounded-full border border-slate-200 text-slate-400 hover:text-slate-600"
              >
                Skip
              </button>
            </div>
          </div>

          {/* Link Existing Lead */}
          <div className="space-y-1.5">
            <Label>Link Existing Lead</Label>
            <div className="relative">
              <Input placeholder="Search leads..." className="pl-8" />
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">🔍</span>
            </div>
          </div>

          {/* Deal Title */}
          <div className="space-y-1.5">
            <Label>Deal Title <span className="text-red-500">*</span></Label>
            <Input
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
              placeholder="e.g. Alphamed — Social Media Management"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Company <span className="text-red-500">*</span></Label>
              <Input value={form.company_name} onChange={(e) => update("company_name", e.target.value)} placeholder="Company name" />
            </div>
            <div className="space-y-1.5">
              <Label>Contact Name <span className="text-red-500">*</span></Label>
              <Input value={form.contact_name} onChange={(e) => update("contact_name", e.target.value)} placeholder="Full name" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Phone <span className="text-red-500">*</span></Label>
              <Input value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+971..." />
            </div>
            <div className="space-y-1.5">
              <Label>Email <span className="text-red-500">*</span></Label>
              <Input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="email@..." />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Country <span className="text-red-500">*</span></Label>
              <Select value={form.country} onValueChange={(v) => update("country", v)}>
                <SelectTrigger><SelectValue placeholder="Select country..." /></SelectTrigger>
                <SelectContent>
                  {COUNTRIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Source <span className="text-red-500">*</span></Label>
              <Select value={form.lead_source} onValueChange={(v) => update("lead_source", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="inbound">Inbound</SelectItem>
                  <SelectItem value="outbound">Outbound</SelectItem>
                  <SelectItem value="referral">Referral</SelectItem>
                  <SelectItem value="website">Website</SelectItem>
                  <SelectItem value="social_media">Social Media</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Service <span className="text-red-500">*</span></Label>
              <Select value={form.service} onValueChange={(v) => update("service", v)}>
                <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                <SelectContent>
                  {SERVICES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Deal Value (AED)</Label>
              <Input
                type="number"
                value={form.value}
                onChange={(e) => update("value", e.target.value)}
                placeholder="0"
                min="0"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="animate-spin h-4 w-4" />}
              {saving ? "Creating…" : "Create Deal"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
