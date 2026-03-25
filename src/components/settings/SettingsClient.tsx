"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Loader2, UserPlus, Shield } from "lucide-react";
import { toast } from "sonner";
import { getInitials, formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { User } from "@/lib/types";

interface SettingsClientProps {
  users: User[];
}

const ROLE_COLORS: Record<string, string> = {
  admin: "bg-red-100 text-red-700",
  manager: "bg-amber-100 text-amber-700",
  salesperson: "bg-blue-100 text-blue-700",
};

export function SettingsClient({ users: initialUsers }: SettingsClientProps) {
  const { appUser } = useAuth();
  const isAdmin = appUser?.role === "admin" || appUser?.role === "manager";
  const [users, setUsers] = useState(initialUsers);
  const [activeTab, setActiveTab] = useState<"profile" | "users">("profile");

  // Profile form
  const [profileForm, setProfileForm] = useState({
    full_name: appUser?.full_name || "",
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [profileSaving, setProfileSaving] = useState(false);

  const handleProfileSave = async () => {
    if (!appUser) return;
    setProfileSaving(true);
    const supabase = createClient();

    const { error } = await supabase
      .from("users")
      .update({ full_name: profileForm.full_name, updated_at: new Date().toISOString() })
      .eq("id", appUser.id);

    if (error) {
      toast.error("Failed to update profile");
    } else {
      toast.success("Profile updated");
    }

    if (profileForm.new_password) {
      if (profileForm.new_password !== profileForm.confirm_password) {
        toast.error("Passwords don't match");
        setProfileSaving(false);
        return;
      }
      const { error: pwErr } = await supabase.auth.updateUser({
        password: profileForm.new_password,
      });
      if (pwErr) toast.error("Password update failed: " + pwErr.message);
      else toast.success("Password updated");
      setProfileForm((f) => ({ ...f, current_password: "", new_password: "", confirm_password: "" }));
    }
    setProfileSaving(false);
  };

  // User management
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviteRole, setInviteRole] = useState<"salesperson" | "manager" | "admin">("salesperson");
  const [inviting, setInviting] = useState(false);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail || !inviteName) return;
    setInviting(true);

    const supabase = createClient();
    // Create auth user via admin API — in production use a server action
    // For now, just insert into users table as a placeholder
    const { error } = await supabase.from("users").insert({
      email: inviteEmail,
      full_name: inviteName,
      role: inviteRole,
      is_active: true,
    } as Partial<User>);

    if (error) {
      toast.error("Failed to invite: " + error.message);
    } else {
      toast.success(`Invited ${inviteName}`);
      setInviteEmail("");
      setInviteName("");
      // Refresh
      const { data } = await supabase.from("users").select("*").order("created_at", { ascending: false });
      if (data) setUsers(data as User[]);
    }
    setInviting(false);
  };

  const toggleActive = async (user: User) => {
    const supabase = createClient();
    const { error } = await supabase
      .from("users")
      .update({ is_active: !user.is_active, updated_at: new Date().toISOString() })
      .eq("id", user.id);
    if (error) {
      toast.error("Failed to update");
    } else {
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, is_active: !u.is_active } : u))
      );
      toast.success(`User ${user.is_active ? "deactivated" : "activated"}`);
    }
  };

  const updateRole = async (user: User, role: User["role"]) => {
    const supabase = createClient();
    const { error } = await supabase
      .from("users")
      .update({ role, updated_at: new Date().toISOString() })
      .eq("id", user.id);
    if (error) {
      toast.error("Failed to update role");
    } else {
      setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, role } : u)));
      toast.success("Role updated");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-slate-200">
        {([["profile", "My Profile"], ...(isAdmin ? [["users", "User Management"]] : [])] as [string, string][]).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setActiveTab(key as "profile" | "users")}
            className={cn(
              "px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors",
              activeTab === key
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === "profile" && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
            <h2 className="text-sm font-semibold text-slate-900">Personal Information</h2>
            <div className="flex items-center gap-4">
              <Avatar className="h-14 w-14">
                <AvatarFallback className="bg-indigo-100 text-indigo-700 text-lg font-semibold">
                  {getInitials(appUser?.full_name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-slate-900">{appUser?.full_name}</p>
                <p className="text-sm text-slate-500">{appUser?.email}</p>
                <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", ROLE_COLORS[appUser?.role || "salesperson"])}>
                  {appUser?.role}
                </span>
              </div>
            </div>

            <Separator />

            <div className="space-y-3 max-w-md">
              <div className="space-y-1.5">
                <Label>Full Name</Label>
                <Input
                  value={profileForm.full_name}
                  onChange={(e) => setProfileForm((f) => ({ ...f, full_name: e.target.value }))}
                />
              </div>
              <Button onClick={handleProfileSave} disabled={profileSaving} size="sm">
                {profileSaving && <Loader2 className="animate-spin" />}
                Save Name
              </Button>
            </div>
          </div>

          {/* Change Password */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
            <h2 className="text-sm font-semibold text-slate-900">Change Password</h2>
            <div className="space-y-3 max-w-md">
              <div className="space-y-1.5">
                <Label>New Password</Label>
                <Input
                  type="password"
                  value={profileForm.new_password}
                  onChange={(e) => setProfileForm((f) => ({ ...f, new_password: e.target.value }))}
                  placeholder="Min 8 characters"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Confirm New Password</Label>
                <Input
                  type="password"
                  value={profileForm.confirm_password}
                  onChange={(e) => setProfileForm((f) => ({ ...f, confirm_password: e.target.value }))}
                />
              </div>
              <Button
                onClick={handleProfileSave}
                disabled={profileSaving || !profileForm.new_password}
                size="sm"
                variant="outline"
              >
                {profileSaving && <Loader2 className="animate-spin" />}
                Update Password
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* User Management Tab */}
      {activeTab === "users" && isAdmin && (
        <div className="space-y-6">
          {/* Invite form */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2 mb-4">
              <UserPlus className="h-4 w-4 text-indigo-600" />
              Invite New User
            </h2>
            <form onSubmit={handleInvite} className="flex flex-wrap items-end gap-3">
              <div className="space-y-1.5">
                <Label>Full Name</Label>
                <Input
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="Jane Smith"
                  className="w-44"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="jane@company.com"
                  className="w-52"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label>Role</Label>
                <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as typeof inviteRole)}>
                  <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="salesperson">Salesperson</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" disabled={inviting} size="sm">
                {inviting ? <Loader2 className="animate-spin" /> : <UserPlus className="h-4 w-4" />}
                Invite
              </Button>
            </form>
          </div>

          {/* Users list */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <Shield className="h-4 w-4 text-slate-400" />
                All Users ({users.length})
              </h2>
            </div>
            <div className="divide-y divide-slate-100">
              {users.map((user) => (
                <div key={user.id} className="flex items-center gap-4 px-5 py-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-indigo-100 text-indigo-700 text-xs font-medium">
                      {getInitials(user.full_name)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-slate-900 truncate">{user.full_name}</p>
                      {!user.is_active && (
                        <span className="text-xs text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">Inactive</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 truncate">{user.email}</p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <Select
                      value={user.role}
                      onValueChange={(v) => updateRole(user, v as User["role"])}
                      disabled={user.id === appUser?.id}
                    >
                      <SelectTrigger className="h-7 w-28 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="salesperson">Salesperson</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>

                    <Switch
                      checked={user.is_active}
                      onCheckedChange={() => toggleActive(user)}
                      disabled={user.id === appUser?.id}
                    />

                    <span className="text-xs text-slate-400 w-20 text-right">{formatDate(user.created_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
