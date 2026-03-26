import { Header } from "@/components/layout/Header";
import { QuotationsClient } from "@/components/quotations/QuotationsClient";
import { createClient } from "@/lib/supabase/server";
import type { Quotation } from "@/lib/types";

export default async function QuotationsPage() {
  const supabase = await createClient();
  const [usersRes, quotationsRes] = await Promise.all([
    supabase
      .from("users")
      .select("id, full_name, email, role, avatar_url")
      .eq("is_active", true)
      .order("full_name"),
    supabase
      .from("quotations")
      .select("*, creator:users!quotations_created_by_fkey(id, full_name, email, avatar_url), line_items:quotation_line_items(*)")
      .is("deleted_at", null)
      .order("created_at", { ascending: false }),
  ]);

  return (
    <div className="flex flex-col h-full">
      <Header title="Quotations" subtitle="Create and manage quotations" />
      <div className="flex-1 overflow-hidden">
        <QuotationsClient
          users={usersRes.data || []}
          initialQuotations={(quotationsRes.data || []) as unknown as Quotation[]}
        />
      </div>
    </div>
  );
}
