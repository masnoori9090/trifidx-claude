import { Header } from "@/components/layout/Header";
import { LeadsClient } from "@/components/leads/LeadsClient";
import { createClient } from "@/lib/supabase/server";
import type { Lead } from "@/lib/types";

export default async function LeadsPage() {
  const supabase = await createClient();
  const [usersRes, leadsRes] = await Promise.all([
    supabase
      .from("users")
      .select("id, full_name, email, role, avatar_url")
      .eq("is_active", true)
      .order("full_name"),
    supabase
      .from("leads")
      .select("*, owner:users!leads_owner_id_fkey(id, full_name, email, avatar_url)", { count: "exact" })
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .range(0, 49),
  ]);

  return (
    <>
      <Header title="Leads" subtitle="Manage your leads and prospects" />
      <LeadsClient
        users={usersRes.data || []}
        initialLeads={(leadsRes.data || []) as unknown as Lead[]}
        initialTotal={leadsRes.count || 0}
      />
    </>
  );
}
