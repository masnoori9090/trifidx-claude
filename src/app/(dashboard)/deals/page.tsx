import { Header } from "@/components/layout/Header";
import { DealsClient } from "@/components/deals/DealsClient";
import { createClient } from "@/lib/supabase/server";

export default async function DealsPage() {
  const supabase = await createClient();
  const { data: users } = await supabase
    .from("users")
    .select("id, full_name, email, role, avatar_url")
    .eq("is_active", true)
    .order("full_name");

  return (
    <>
      <Header title="Deals" />
      <DealsClient users={users || []} />
    </>
  );
}
