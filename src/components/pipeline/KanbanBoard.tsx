"use client";
import { useState, useEffect, useCallback } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { createClient } from "@/lib/supabase/client";
import { KanbanColumn } from "./KanbanColumn";
import { KanbanCard } from "./KanbanCard";
import { LeadDetail } from "@/components/leads/LeadDetail";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import type { Lead, User, LeadStatus } from "@/lib/types";
import { LEAD_STATUS_LABELS } from "@/lib/utils";

const COLUMNS: LeadStatus[] = [
  "new",
  "contacted",
  "qualified",
  "proposal",
  "negotiation",
  "closed_won",
  "closed_lost",
];

interface KanbanBoardProps {
  users: Partial<User>[];
  currentUserId?: string;
}

type LeadsByStatus = Record<string, Lead[]>;

export function KanbanBoard({ users, currentUserId }: KanbanBoardProps) {
  const [leadsByStatus, setLeadsByStatus] = useState<LeadsByStatus>({});
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [ownerFilter, setOwnerFilter] = useState("");

  const fetchLeads = useCallback(async () => {
    const supabase = createClient();
    let query = supabase
      .from("leads")
      .select(
        "*, owner:users!leads_owner_id_fkey(id, full_name, email, avatar_url)"
      )
      .is("deleted_at", null)
      .order("updated_at", { ascending: false });

    if (ownerFilter) query = query.eq("owner_id", ownerFilter);

    const { data } = await query;
    const grouped: LeadsByStatus = {};
    COLUMNS.forEach((col) => (grouped[col] = []));
    (data || []).forEach((lead) => {
      const status = lead.status as LeadStatus;
      if (grouped[status]) grouped[status].push(lead as Lead);
    });
    setLeadsByStatus(grouped);
    setLoading(false);
  }, [ownerFilter]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  // Realtime subscription
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("leads_pipeline")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "leads" },
        () => fetchLeads()
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchLeads]);

  const onDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result;
    if (!destination || source.droppableId === destination.droppableId) return;

    const sourceStatus = source.droppableId as LeadStatus;
    const destStatus = destination.droppableId as LeadStatus;

    // Optimistic update
    setLeadsByStatus((prev) => {
      const sourceCopy = [...prev[sourceStatus]];
      const destCopy = [...prev[destStatus]];
      const [moved] = sourceCopy.splice(source.index, 1);
      const updatedLead = { ...moved, status: destStatus };
      destCopy.splice(destination.index, 0, updatedLead);
      return { ...prev, [sourceStatus]: sourceCopy, [destStatus]: destCopy };
    });

    const supabase = createClient();
    const { error } = await supabase
      .from("leads")
      .update({ status: destStatus, updated_at: new Date().toISOString() })
      .eq("id", draggableId);

    if (error) {
      toast.error("Failed to update status");
      fetchLeads(); // revert
    }
  };

  if (loading) {
    return (
      <div className="flex gap-4 p-6 overflow-x-auto">
        {COLUMNS.map((col) => (
          <div key={col} className="flex-shrink-0 w-64 space-y-2">
            <Skeleton className="h-8 w-full" />
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-full rounded-xl" />
            ))}
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-3 p-6 overflow-x-auto h-full pb-8">
          {COLUMNS.map((status) => {
            const leads = leadsByStatus[status] || [];
            return (
              <KanbanColumn
                key={status}
                status={status}
                label={LEAD_STATUS_LABELS[status]}
                count={leads.length}
              >
                <Droppable droppableId={status}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex-1 space-y-2 min-h-[100px] rounded-lg p-1 transition-colors ${
                        snapshot.isDraggingOver ? "bg-indigo-50" : ""
                      }`}
                    >
                      {leads.map((lead, index) => (
                        <Draggable
                          key={lead.id}
                          draggableId={lead.id}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                            >
                              <KanbanCard
                                lead={lead}
                                isDragging={snapshot.isDragging}
                                onClick={() => setSelectedLead(lead)}
                              />
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </KanbanColumn>
            );
          })}
        </div>
      </DragDropContext>

      {selectedLead && (
        <LeadDetail
          lead={selectedLead}
          users={users}
          onClose={() => setSelectedLead(null)}
          onUpdated={(updated) => {
            setSelectedLead(updated);
            fetchLeads();
          }}
        />
      )}
    </>
  );
}
