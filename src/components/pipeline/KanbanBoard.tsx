"use client";
import { useState, useEffect, useCallback } from "react";
import {
  DragDropContext, Droppable, Draggable, DropResult,
} from "@hello-pangea/dnd";
import { createClient } from "@/lib/supabase/client";
import { KanbanColumn } from "./KanbanColumn";
import { KanbanCard } from "./KanbanCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { Deal, User, DealStage } from "@/lib/types";
import {
  DEAL_STAGE_LABELS, formatCurrency,
} from "@/lib/utils";
import { Plus, RefreshCw, AlertTriangle, TrendingDown } from "lucide-react";
import { AddDealModal } from "@/components/deals/AddDealModal";

const STAGES: DealStage[] = [
  "new_lead",
  "attempting_contact",
  "contacted",
  "qualified",
  "meeting_booked",
  "meeting_completed",
  "proposal_sent",
  "negotiation",
];

interface KanbanBoardProps {
  users: Partial<User>[];
  currentUserId?: string;
  initialDeals?: Deal[];
}

type DealsByStage = Record<string, Deal[]>;

function groupByStage(deals: Deal[]): DealsByStage {
  const grouped: DealsByStage = {};
  STAGES.forEach((s) => (grouped[s] = []));
  deals.forEach((deal) => {
    const stage = deal.stage as DealStage;
    if (grouped[stage]) grouped[stage].push(deal);
  });
  return grouped;
}

export function KanbanBoard({ users, currentUserId, initialDeals }: KanbanBoardProps) {
  const [dealsByStage, setDealsByStage] = useState<DealsByStage>(
    initialDeals ? groupByStage(initialDeals) : {}
  );
  const [loading, setLoading] = useState(!initialDeals);
  const [viewFilter, setViewFilter] = useState<"mine" | "all">("mine");
  const [addModalOpen, setAddModalOpen] = useState(false);

  const fetchDeals = useCallback(async () => {
    const supabase = createClient();
    let query = supabase
      .from("deals")
      .select("*, owner:users!deals_owner_id_fkey(id, full_name, email, avatar_url)")
      .is("deleted_at", null)
      .order("updated_at", { ascending: false });

    if (viewFilter === "mine" && currentUserId) {
      query = query.eq("owner_id", currentUserId);
    }

    const { data } = await query;
    setDealsByStage(groupByStage((data || []) as Deal[]));
    setLoading(false);
  }, [viewFilter, currentUserId]);

  useEffect(() => {
    fetchDeals();
  }, [fetchDeals]);

  // Realtime subscription
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("deals_pipeline")
      .on("postgres_changes", { event: "*", schema: "public", table: "deals" }, () => fetchDeals())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchDeals]);

  const onDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result;
    if (!destination || source.droppableId === destination.droppableId) return;

    const sourceStage = source.droppableId as DealStage;
    const destStage = destination.droppableId as DealStage;

    setDealsByStage((prev) => {
      const sourceCopy = [...prev[sourceStage]];
      const destCopy = [...(prev[destStage] || [])];
      const [moved] = sourceCopy.splice(source.index, 1);
      destCopy.splice(destination.index, 0, { ...moved, stage: destStage });
      return { ...prev, [sourceStage]: sourceCopy, [destStage]: destCopy };
    });

    const supabase = createClient();
    const { error } = await supabase
      .from("deals")
      .update({ stage: destStage, updated_at: new Date().toISOString() })
      .eq("id", draggableId);

    if (error) {
      toast.error("Failed to update stage");
      fetchDeals();
    }
  };

  // Stats
  const totalDeals = STAGES.reduce((s, stage) => s + (dealsByStage[stage]?.length || 0), 0);
  const pipelineValue = STAGES.reduce((s, stage) => {
    return s + (dealsByStage[stage] || []).reduce((sum, d) => sum + (d.value || 0), 0);
  }, 0);
  const atRisk = Object.values(dealsByStage).flat().filter((d) => {
    const daysSince = (Date.now() - new Date(d.updated_at).getTime()) / (1000 * 60 * 60 * 24);
    return daysSince > 7;
  }).length;
  const avgAge = totalDeals > 0
    ? Math.round(Object.values(dealsByStage).flat().reduce((s, d) => {
        return s + (Date.now() - new Date(d.created_at).getTime()) / (1000 * 60 * 60 * 24);
      }, 0) / totalDeals)
    : 0;

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex gap-4 overflow-x-auto">
          {STAGES.map((s) => (
            <div key={s} className="flex-shrink-0 w-60 space-y-2">
              <Skeleton className="h-16 w-full rounded-xl" />
              {[1, 2].map((i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-3 bg-white border-b border-slate-200 flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-slate-900">My Pipeline</h2>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400">{totalDeals} deals</span>
          <div className="flex rounded-lg border border-slate-200 overflow-hidden">
            <button
              onClick={() => setViewFilter("mine")}
              className={`px-3 py-1 text-xs font-medium transition-colors ${viewFilter === "mine" ? "bg-slate-900 text-white" : "bg-white text-slate-600 hover:bg-slate-50"}`}
            >
              My Pipeline
            </button>
            <button
              onClick={() => setViewFilter("all")}
              className={`px-3 py-1 text-xs font-medium transition-colors ${viewFilter === "all" ? "bg-slate-900 text-white" : "bg-white text-slate-600 hover:bg-slate-50"}`}
            >
              All
            </button>
          </div>
          <Button size="sm" variant="outline" onClick={() => fetchDeals()} className="h-8">
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
          <Button size="sm" onClick={() => setAddModalOpen(true)} className="h-8">
            <Plus className="h-4 w-4" />
            Deal
          </Button>
        </div>
      </div>

      {/* Stats bar */}
      <div className="px-6 py-2.5 bg-white border-b border-slate-100 flex items-center gap-6 text-sm overflow-x-auto">
        <div>
          <span className="text-xs text-slate-400 block">Total Deals</span>
          <span className="font-semibold text-slate-900">{totalDeals}</span>
        </div>
        <div>
          <span className="text-xs text-slate-400 block">Pipeline Value</span>
          <span className="font-semibold text-slate-900">{formatCurrency(pipelineValue, "AED")}</span>
        </div>
        <div>
          <span className="text-xs text-slate-400 block">Won This Month</span>
          <span className="font-semibold text-slate-900">0 — AED 0</span>
        </div>
        <div>
          <span className="text-xs text-slate-400 block flex items-center gap-1">
            <AlertTriangle className="h-3 w-3 text-amber-500" />
            At Risk
          </span>
          <span className="font-semibold text-amber-600">{atRisk}</span>
        </div>
        <div>
          <span className="text-xs text-slate-400 block">Avg Deal Age</span>
          <span className="font-semibold text-slate-900">{avgAge}d</span>
        </div>
        <div>
          <span className="text-xs text-slate-400 block">Pipeline Health</span>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded ${atRisk > 0 ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"}`}>
            {atRisk > 0 ? "At Risk" : "Healthy"}
          </span>
        </div>
      </div>

      {/* Kanban */}
      <div className="flex-1 overflow-hidden">
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex gap-3 p-4 overflow-x-auto h-full pb-8">
            {STAGES.map((stage) => {
              const deals = dealsByStage[stage] || [];
              const stageValue = deals.reduce((s, d) => s + (d.value || 0), 0);
              return (
                <KanbanColumn
                  key={stage}
                  stage={stage}
                  label={DEAL_STAGE_LABELS[stage]}
                  count={deals.length}
                  value={stageValue}
                  currency="AED"
                >
                  <Droppable droppableId={stage}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`flex-1 space-y-2 min-h-[60px] rounded-lg p-1 transition-colors ${snapshot.isDraggingOver ? "bg-zinc-100" : ""}`}
                      >
                        {deals.map((deal, index) => (
                          <Draggable key={deal.id} draggableId={deal.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                              >
                                <KanbanCard
                                  deal={deal}
                                  isDragging={snapshot.isDragging}
                                  onClick={() => {}}
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
      </div>

      <AddDealModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onCreated={fetchDeals}
        users={users}
        currentUserId={currentUserId}
      />
    </div>
  );
}
