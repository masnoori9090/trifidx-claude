import { Header } from "@/components/layout/Header";
import { KanbanBoard } from "@/components/pipeline/KanbanBoard";
import { createClient } from "@/lib/supabase/server";

export default async function PipelinePage() {
  const supabase = await createClient();
  const { data: users } = await supabase
    .from("users")
    .select("id, full_name, email, role, avatar_url")
    .eq("is_active", true)
    .order("full_name");

  return (
    <div className="flex flex-col h-full">
      <Header title="Sales Pipeline" />
      <div className="flex-1 overflow-hidden">
        <KanbanBoard users={users || []} />
      </div>
    </div>
  );
}
