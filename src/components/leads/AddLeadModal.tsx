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
import { Loader2, Building2, User2, Info } from "lucide-react";
import { toast } from "sonner";
import type { User } from "@/lib/types";
import { LEAD_SOURCE_LABELS, COUNTRIES, COUNTRY_CODES } from "@/lib/utils";

interface AddLeadModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
  users: Partial<User>[];
}

export function AddLeadModal({ open, onClose, onCreated, users }: AddLeadModalProps) {
  const { authUser } = useAuth();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    business_name: "",
    country: "",
    lead_source: "",
    full_name: "",
    job_title: "",
    email: "",
    phone_code: "+971",
    phone: "",
  });

  const update = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const handleCountryChange = (country: string) => {
    setForm((f) => ({
      ...f,
      country,
      phone_code: COUNTRY_CODES[country] || "+",
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.business_name.trim() || !form.email.trim()) return;
    setSaving(true);

    const supabase = createClient();
    const nameParts = form.full_name.trim().split(" ");
    const first_name = nameParts[0] || null;
    const last_name = nameParts.slice(1).join(" ") || null;
    const fullPhone = form.phone ? `${form.phone_code}${form.phone}` : null;

    const { error } = await supabase.from("leads").insert({
      business_name: form.business_name.trim(),
      country: form.country || null,
      lead_source: (form.lead_source as never) || "outbound",
      first_name,
      last_name,
      email: form.email || null,
      phone: fullPhone,
      created_by: authUser?.id,
      owner_id: authUser?.id,
      claimed_at: new Date().toISOString(),
    });

    if (error) {
      toast.error("Failed to create lead: " + error.message);
    } else {
      toast.success("Lead created");
      onCreated();
      onClose();
      setForm({ business_name: "", country: "", lead_source: "", full_name: "", job_title: "", email: "", phone_code: "+971", phone: "" });
    }
    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Lead</DialogTitle>
          <p className="text-sm text-slate-500">Fill in the details to create a new lead in the CRM.</p>
        </DialogHeader>

        {/* Duplicate warning */}
        <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-lg p-3">
          <Info className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
          <p className="text-xs text-blue-700">
            Search for the lead first before adding a new one to avoid duplicates. As you type, we&apos;ll check for existing matches automatically.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Organization */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">
              <Building2 className="h-3.5 w-3.5" />
              Organization
            </div>

            <div className="space-y-1.5">
              <Label>Company Name <span className="text-red-500">*</span></Label>
              <Input
                value={form.business_name}
                onChange={(e) => update("business_name", e.target.value)}
                placeholder="e.g. Alphamed // @alphamed.healthcare"
                required
              />
              <p className="text-xs text-slate-400">Format: Company Name // @handle — e.g. Alphamed // @alphamed.healthcare</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Country <span className="text-red-500">*</span></Label>
                <Select value={form.country} onValueChange={handleCountryChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select country..." />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRIES.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Source <span className="text-red-500">*</span></Label>
                <Select value={form.lead_source} onValueChange={(v) => update("lead_source", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select source..." />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(LEAD_SOURCE_LABELS).map(([v, l]) => (
                      <SelectItem key={v} value={v}>{l}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Contact Person */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">
              <User2 className="h-3.5 w-3.5" />
              Contact Person
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Full Name</Label>
                <Input
                  value={form.full_name}
                  onChange={(e) => update("full_name", e.target.value)}
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Job Title</Label>
                <Input
                  value={form.job_title}
                  onChange={(e) => update("job_title", e.target.value)}
                  placeholder="e.g. Marketing Manager"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Email <span className="text-red-500">*</span></Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                placeholder="contact@company.com"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label>Phone</Label>
              <div className="flex gap-2">
                <Select value={form.phone_code} onValueChange={(v) => update("phone_code", v)}>
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(COUNTRY_CODES).map(([country, code]) => (
                      <SelectItem key={country} value={code}>{code} {country}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  className="flex-1"
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  placeholder="Phone number"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="animate-spin h-4 w-4" />}
              {saving ? "Creating…" : "+ Create Lead"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
