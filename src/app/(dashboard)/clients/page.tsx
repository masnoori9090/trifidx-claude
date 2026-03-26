import { Header } from "@/components/layout/Header";
import { ClientsClient } from "@/components/clients/ClientsClient";
import { createClient } from "@/lib/supabase/server";
import type { Lead } from "@/lib/types";

export default async function ClientsPage() {
  const supabase = await createClient();
  const [usersRes, clientsRes] = await Promise.all([
    supabase
      .from("users")
      .select("id, full_name, email, role, avatar_url")
      .eq("is_active", true)
      .order("full_name"),
    supabase
      .from("leads")
      .select("*, owner:users!leads_owner_id_fkey(id, full_name, email, avatar_url)")
      .eq("is_client", true)
      .is("deleted_at", null)
      .order("updated_at", { ascending: false }),
  ]);

  return (
    <div className="flex flex-col h-full">
      <Header title="My Clients" />
      <ClientsClient
        users={usersRes.data || []}
        initialClients={(clientsRes.data || []) as unknown as Lead[]}
      />
    </div>
  );
}
