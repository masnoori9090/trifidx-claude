import { Header } from "@/components/layout/Header";
import { createClient } from "@/lib/supabase/server";
import { UserCheck, Check, X } from "lucide-react";

export default async function UserApprovalsPage() {
  const supabase = await createClient();
  const { data: users } = await supabase
    .from("users")
    .select("id, full_name, email, role, is_active, created_at")
    .order("created_at", { ascending: false });

  return (
    <div className="flex flex-col h-full">
      <Header title="User Approvals" subtitle="Manage user access and approvals" />
      <div className="flex-1 overflow-auto p-6">
        {!users || users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <UserCheck className="h-12 w-12 mx-auto mb-3 text-slate-300" />
            <p className="text-sm font-medium">No users pending approval</p>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Role</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">{user.full_name}</td>
                    <td className="px-4 py-3 text-slate-500">{user.email}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded capitalize">{user.role}</span>
                    </td>
                    <td className="px-4 py-3">
                      {user.is_active ? (
                        <span className="flex items-center gap-1 text-xs text-green-700">
                          <Check className="h-3.5 w-3.5" /> Active
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs text-red-600">
                          <X className="h-3.5 w-3.5" /> Inactive
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
