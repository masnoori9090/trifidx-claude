import { Header } from "@/components/layout/Header";
import { QuotationsClient } from "@/components/quotations/QuotationsClient";
import { createClient } from "@/lib/supabase/server";

export default async function QuotationsPage() {
  const supabase = await createClient();
  const { data: users } = await supabase
    .from("users")
    .select("id, full_name, email, role, avatar_url")
    .eq("is_active", true)
    .order("full_name");

  return (
    <div className="flex flex-col h-full">
      <Header title="Quotations" subtitle="Create and manage quotations" />
      <div className="flex-1 overflow-hidden">
        <QuotationsClient users={users || []} />
      </div>
    </div>
  );
}
