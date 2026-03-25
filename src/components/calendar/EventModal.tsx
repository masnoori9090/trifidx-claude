"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/hooks/useAuth";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import type { CalendarEvent, User } from "@/lib/types";

interface EventModalProps {
  event?: CalendarEvent | null;
  defaultDate?: Date;
  users: Partial<User>[];
  onClose: () => void;
  onSaved: () => void;
}

const EVENT_TYPES = [
  { value: "meeting", label: "Meeting" },
  { value: "phone_call", label: "Phone Call" },
  { value: "follow_up", label: "Follow Up" },
  { value: "demo", label: "Demo" },
  { value: "other", label: "Other" },
];

const EVENT_STATUSES = [
  { value: "scheduled", label: "Scheduled" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
  { value: "no_show", label: "No Show" },
];

function toLocalDatetime(isoString: string) {
  const d = new Date(isoString);
  return format(d, "yyyy-MM-dd'T'HH:mm");
}

function toDefaultStart(date?: Date) {
  const d = date || new Date();
  d.setMinutes(0, 0, 0);
  return format(d, "yyyy-MM-dd'T'HH:mm");
}

function toDefaultEnd(date?: Date) {
  const d = date || new Date();
  d.setHours(d.getHours() + 1, 0, 0, 0);
  return format(d, "yyyy-MM-dd'T'HH:mm");
}

export function EventModal({ event, defaultDate, users, onClose, onSaved }: EventModalProps) {
  const { authUser } = useAuth();
  const isEdit = !!event;
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [form, setForm] = useState({
    title: event?.title || "",
    type: event?.type || "meeting",
    status: event?.status || "scheduled",
    start_at: event ? toLocalDatetime(event.start_at) : toDefaultStart(defaultDate),
    end_at: event ? toLocalDatetime(event.end_at) : toDefaultEnd(defaultDate),
    location: event?.location || "",
    meeting_link: event?.meeting_link || "",
    description: event?.description || "",
    assigned_to: event?.assigned_to || authUser?.id || "",
  });

  const update = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.start_at || !form.end_at) return;
    setSaving(true);
    const supabase = createClient();
    const payload = {
      title: form.title,
      type: form.type,
      status: form.status,
      start_at: new Date(form.start_at).toISOString(),
      end_at: new Date(form.end_at).toISOString(),
      location: form.location || null,
      meeting_link: form.meeting_link || null,
      description: form.description || null,
      assigned_to: form.assigned_to || null,
    };

    const { error } = isEdit
      ? await supabase.from("calendar_events").update({ ...payload, updated_at: new Date().toISOString() }).eq("id", event!.id)
      : await supabase.from("calendar_events").insert({ ...payload, created_by: authUser?.id });

    if (error) {
      toast.error("Failed to save: " + error.message);
    } else {
      toast.success(isEdit ? "Event updated" : "Event created");
      onSaved();
      onClose();
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!event) return;
    setDeleting(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("calendar_events")
      .update({ deleted_at: new Date().toISOString(), deleted_by: authUser?.id })
      .eq("id", event.id);
    if (error) {
      toast.error("Failed to delete");
    } else {
      toast.success("Event deleted");
      onSaved();
      onClose();
    }
    setDeleting(false);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Event" : "New Event"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Title <span className="text-red-500">*</span></Label>
            <Input value={form.title} onChange={(e) => update("title", e.target.value)} placeholder="Event title" required />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Type</Label>
              <Select value={form.type} onValueChange={(v) => update("type", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{EVENT_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => update("status", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{EVENT_STATUSES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Start</Label>
              <Input type="datetime-local" value={form.start_at} onChange={(e) => update("start_at", e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label>End</Label>
              <Input type="datetime-local" value={form.end_at} onChange={(e) => update("end_at", e.target.value)} required />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Location</Label>
            <Input value={form.location} onChange={(e) => update("location", e.target.value)} placeholder="Office, Google Meet..." />
          </div>

          <div className="space-y-1.5">
            <Label>Meeting Link</Label>
            <Input value={form.meeting_link} onChange={(e) => update("meeting_link", e.target.value)} placeholder="https://..." />
          </div>

          <div className="space-y-1.5">
            <Label>Assigned To</Label>
            <Select value={form.assigned_to || "__none__"} onValueChange={(v) => update("assigned_to", v === "__none__" ? "" : v)}>
              <SelectTrigger><SelectValue placeholder="Select person" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">Unassigned</SelectItem>
                {users.map((u) => <SelectItem key={u.id!} value={u.id!}>{u.full_name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Description</Label>
            <Textarea value={form.description} onChange={(e) => update("description", e.target.value)} rows={2} />
          </div>

          <DialogFooter className="flex items-center justify-between">
            {isEdit && (
              <Button type="button" variant="destructive" size="sm" onClick={handleDelete} disabled={deleting}>
                {deleting ? <Loader2 className="animate-spin h-4 w-4" /> : <Trash2 className="h-4 w-4" />}
                Delete
              </Button>
            )}
            <div className="flex gap-2 ml-auto">
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="animate-spin" />}
                {saving ? "Saving…" : "Save"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
