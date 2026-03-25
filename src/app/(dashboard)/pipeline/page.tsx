import { KanbanBoard } from "@/components/pipeline/KanbanBoard";
import { createClient } from "@/lib/supabase/server";
import { createClient as createServerClient } from "@/lib/supabase/server";

export default async function PipelinePage() {
  const supabase = await createClient();
  const [usersRes, sessionRes] = await Promise.all([
    supabase.from("users").select("id, full_name, email, role, avatar_url").eq("is_active", true).order("full_name"),
    supabase.auth.getUser(),
  ]);

  return (
    <div className="flex flex-col h-full bg-white">
      <KanbanBoard
        users={usersRes.data || []}
        currentUserId={sessionRes.data.user?.id}
      />
    </div>
  );
}
