import { Header } from "@/components/layout/Header";
import { LeadsClient } from "@/components/leads/LeadsClient";
import { createClient } from "@/lib/supabase/server";

export default async function LeadsPage() {
  const supabase = await createClient();
  const { data: users } = await supabase
    .from("users")
    .select("id, full_name, email, role, avatar_url")
    .eq("is_active", true)
    .order("full_name");

  return (
    <>
      <Header title="Leads" subtitle="Manage your leads and prospects" />
      <LeadsClient users={users || []} />
    </>
  );
}
