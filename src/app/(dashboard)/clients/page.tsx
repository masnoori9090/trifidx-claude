import { Header } from "@/components/layout/Header";
import { ClientsClient } from "@/components/clients/ClientsClient";
import { createClient } from "@/lib/supabase/server";

export default async function ClientsPage() {
  const supabase = await createClient();
  const { data: users } = await supabase
    .from("users")
    .select("id, full_name, email, role, avatar_url")
    .eq("is_active", true)
    .order("full_name");

  return (
    <div className="flex flex-col h-full">
      <Header title="Clients" />
      <ClientsClient users={users || []} />
    </div>
  );
}
