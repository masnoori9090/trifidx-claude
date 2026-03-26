import { KanbanBoard } from "@/components/pipeline/KanbanBoard";
import { createClient } from "@/lib/supabase/server";

export default async function PipelinePage() {
  const supabase = await createClient();
  const [usersRes, sessionRes, dealsRes] = await Promise.all([
    supabase.from("users").select("id, full_name, email, role, avatar_url").eq("is_active", true).order("full_name"),
    supabase.auth.getUser(),
    supabase.from("deals")
      .select("*, owner:users!deals_owner_id_fkey(id, full_name, email, avatar_url)")
      .is("deleted_at", null)
      .order("updated_at", { ascending: false }),
  ]);

  return (
    <div className="flex flex-col h-full bg-white">
      <KanbanBoard
        users={usersRes.data || []}
        currentUserId={sessionRes.data.user?.id}
        initialDeals={(dealsRes.data || []) as never}
      />
    </div>
  );
}
