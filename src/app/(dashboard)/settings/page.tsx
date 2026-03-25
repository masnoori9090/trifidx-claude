import { Header } from "@/components/layout/Header";
import { SettingsClient } from "@/components/settings/SettingsClient";
import { createClient } from "@/lib/supabase/server";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: users } = await supabase
    .from("users")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <>
      <Header title="Settings" />
      <SettingsClient users={users || []} />
    </>
  );
}
