import { Header } from "@/components/layout/Header";
import { CalendarView } from "@/components/calendar/CalendarView";
import { createClient } from "@/lib/supabase/server";

export default async function CalendarPage() {
  const supabase = await createClient();
  const { data: users } = await supabase
    .from("users")
    .select("id, full_name, email, role, avatar_url")
    .eq("is_active", true)
    .order("full_name");

  return (
    <div className="flex flex-col h-full">
      <Header title="Calendar" />
      <div className="flex-1 overflow-hidden">
        <CalendarView users={users || []} />
      </div>
    </div>
  );
}
