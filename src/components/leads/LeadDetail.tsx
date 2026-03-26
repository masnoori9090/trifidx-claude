"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatDate } from "@/lib/utils";
import { LEAD_SOURCE_LABELS, LEAD_STATUS_LABELS } from "@/lib/utils";
import {
  X,
  Loader2,
  Phone,
  Mail,
  Globe,
  AtSign,
} from "lucide-react";
import { toast } from "sonner";
import type { Lead, User } from "@/lib/types";

interface LeadDetailProps {
  lead: Lead;
  users: Partial<User>[];
  onClose: () => void;
  onUpdated: (lead: Lead) => void;
}

export function LeadDetail({
  lead,
  users,
  onClose,
  onUpdated,
}: LeadDetailProps) {
  const { authUser, appUser } = useAuth();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    business_name: lead.business_name,
    first_name: lead.first_name || "",
    last_name: lead.last_name || "",
    email: lead.email || "",
    phone: lead.phone || "",
    mobile: lead.mobile || "",
    website: lead.website || "",
    instagram_handle: lead.instagram_handle || "",
    lead_source: lead.lead_source,
    status: lead.status,
    country: lead.country || "",
    industry: lead.industry || "",
    notes: lead.notes || "",
    owner_id: lead.owner_id || "",
    do_not_approach: lead.do_not_approach,
    dna_reason: lead.dna_reason || "",
    dna_notes: lead.dna_notes || "",
  });

  const update = (key: string, value: string | boolean) =>
    setForm((f) => ({ ...f, [key]: value }));

  const isAdmin =
    appUser?.role === "admin" || appUser?.role === "manager";
  const isOwner = lead.owner_id === authUser?.id;
  const canEdit = isAdmin || isOwner || !lead.owner_id;

  const handleSave = async () => {
    setSaving(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("leads")
      .update({
        ...form,
        owner_id: form.owner_id || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", lead.id)
      .select("*, owner:users!leads_owner_id_fkey(id, full_name, email, avatar_url)")
      .single();

    if (error) {
      toast.error("Failed to save: " + error.message);
    } else {
      toast.success("Lead updated");
      onUpdated(data as unknown as Lead);
    }
    setSaving(false);
  };

  const handleClaim = async () => {
    if (!authUser) return;
    setSaving(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("leads")
      .update({
        owner_id: authUser.id,
        claimed_at: new Date().toISOString(),
        expires_at: new Date(
          Date.now() + 20 * 24 * 60 * 60 * 1000
        ).toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", lead.id)
      .select("*, owner:users!leads_owner_id_fkey(id, full_name, email, avatar_url)")
      .single();

    if (error) {
      toast.error("Failed to claim: " + error.message);
    } else {
      toast.success("Lead claimed!");
      onUpdated(data as unknown as Lead);
      setForm((f) => ({ ...f, owner_id: authUser.id }));
    }
    setSaving(false);
  };

  const handleUnclaim = async () => {
    setSaving(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("leads")
      .update({
        owner_id: null,
        claimed_at: null,
        expires_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", lead.id)
      .select("*, owner:users!leads_owner_id_fkey(id, full_name, email, avatar_url)")
      .single();

    if (error) {
      toast.error("Failed to unclaim: " + error.message);
    } else {
      toast.success("Lead unclaimed");
      onUpdated(data as unknown as Lead);
      setForm((f) => ({ ...f, owner_id: "" }));
    }
    setSaving(false);
  };

  const isClaimed = !!lead.owner_id;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/40 z-40"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-full max-w-xl bg-white shadow-2xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <div>
            <h2 className="font-semibold text-slate-900 text-base">
              {lead.business_name}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <StatusBadge status={lead.status} />
              {lead.do_not_approach && (
                <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                  DNA
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isClaimed ? (
              <Button size="sm" onClick={handleClaim} disabled={saving}>
                Claim
              </Button>
            ) : isOwner || isAdmin ? (
              <Button
                size="sm"
                variant="outline"
                onClick={handleUnclaim}
                disabled={saving}
              >
                Unclaim
              </Button>
            ) : null}
            <button
              onClick={onClose}
              className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {/* Quick contact links */}
          <div className="flex items-center gap-3 text-slate-500">
            {lead.email && (
              <a href={`mailto:${lead.email}`} className="hover:text-zinc-700" title={lead.email}>
                <Mail className="h-4 w-4" />
              </a>
            )}
            {lead.phone && (
              <a href={`tel:${lead.phone}`} className="hover:text-zinc-700" title={lead.phone}>
                <Phone className="h-4 w-4" />
              </a>
            )}
            {lead.website && (
              <a href={lead.website} target="_blank" rel="noopener noreferrer" className="hover:text-zinc-700" title={lead.website}>
                <Globe className="h-4 w-4" />
              </a>
            )}
            {lead.instagram_handle && (
              <a
                href={`https://instagram.com/${lead.instagram_handle.replace("@", "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-zinc-700"
                title={lead.instagram_handle}
              >
                <AtSign className="h-4 w-4" />
              </a>
            )}
          </div>

          {/* Fields */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Business Name</Label>
              <Input
                value={form.business_name}
                onChange={(e) => update("business_name", e.target.value)}
                disabled={!canEdit}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select
                value={form.status}
                onValueChange={(v) => update("status", v)}
                disabled={!canEdit}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(LEAD_STATUS_LABELS).map(([v, l]) => (
                    <SelectItem key={v} value={v}>
                      {l}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>First Name</Label>
              <Input
                value={form.first_name}
                onChange={(e) => update("first_name", e.target.value)}
                disabled={!canEdit}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Last Name</Label>
              <Input
                value={form.last_name}
                onChange={(e) => update("last_name", e.target.value)}
                disabled={!canEdit}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                disabled={!canEdit}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Phone</Label>
              <Input
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                disabled={!canEdit}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Mobile</Label>
              <Input
                value={form.mobile}
                onChange={(e) => update("mobile", e.target.value)}
                disabled={!canEdit}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Instagram</Label>
              <Input
                value={form.instagram_handle}
                onChange={(e) => update("instagram_handle", e.target.value)}
                disabled={!canEdit}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Website</Label>
              <Input
                value={form.website}
                onChange={(e) => update("website", e.target.value)}
                disabled={!canEdit}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Lead Source</Label>
              <Select
                value={form.lead_source}
                onValueChange={(v) => update("lead_source", v)}
                disabled={!canEdit}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(LEAD_SOURCE_LABELS).map(([v, l]) => (
                    <SelectItem key={v} value={v}>
                      {l}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Country</Label>
              <Input
                value={form.country}
                onChange={(e) => update("country", e.target.value)}
                disabled={!canEdit}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Industry</Label>
              <Input
                value={form.industry}
                onChange={(e) => update("industry", e.target.value)}
                disabled={!canEdit}
              />
            </div>
          </div>

          {/* Assign To */}
          {isAdmin && (
            <div className="space-y-1.5">
              <Label>Assigned To</Label>
              <Select
                value={form.owner_id || "__unassigned__"}
                onValueChange={(v) =>
                  update("owner_id", v === "__unassigned__" ? "" : v)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Unassigned" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__unassigned__">Unassigned</SelectItem>
                  {users.map((u) => (
                    <SelectItem key={u.id!} value={u.id!}>
                      {u.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <Separator />

          {/* DNA Toggle */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-900">
                  Do Not Approach
                </p>
                <p className="text-xs text-slate-500">
                  Flag this lead as off-limits
                </p>
              </div>
              <Switch
                checked={form.do_not_approach}
                onCheckedChange={(v) => update("do_not_approach", v)}
                disabled={!canEdit}
              />
            </div>

            {form.do_not_approach && (
              <div className="space-y-2 pl-4 border-l-2 border-red-200">
                <div className="space-y-1.5">
                  <Label>Reason</Label>
                  <Input
                    value={form.dna_reason}
                    onChange={(e) => update("dna_reason", e.target.value)}
                    placeholder="e.g. Competitor, Bad history..."
                    disabled={!canEdit}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Notes</Label>
                  <Textarea
                    value={form.dna_notes}
                    onChange={(e) => update("dna_notes", e.target.value)}
                    rows={2}
                    disabled={!canEdit}
                  />
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Notes */}
          <div className="space-y-1.5">
            <Label>Notes</Label>
            <Textarea
              value={form.notes}
              onChange={(e) => update("notes", e.target.value)}
              rows={4}
              placeholder="Internal notes about this lead..."
              disabled={!canEdit}
            />
          </div>

          {/* Meta info */}
          <div className="text-xs text-slate-400 space-y-1 pb-2">
            <p>Created: {formatDate(lead.created_at)}</p>
            {lead.claimed_at && (
              <p>Claimed: {formatDate(lead.claimed_at)}</p>
            )}
            {lead.expires_at && (
              <p>Expires: {formatDate(lead.expires_at)}</p>
            )}
          </div>
        </div>

        {/* Footer */}
        {canEdit && (
          <div className="px-5 py-4 border-t border-slate-200 flex items-center justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="animate-spin" />}
              {saving ? "Saving…" : "Save Changes"}
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
