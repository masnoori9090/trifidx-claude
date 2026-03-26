"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Lead } from "@/lib/types";

export interface LeadsFilters {
  tab: "everyone" | "mine" | "all";
  search: string;
  status: string;
  source: string;
  country: string;
  owner_id: string;
  page: number;
}

const PAGE_SIZE = 50;

const DEFAULT_FILTERS: LeadsFilters = {
  tab: "everyone",
  search: "",
  status: "",
  source: "",
  country: "",
  owner_id: "",
  page: 0,
};

export function useLeads(
  userId: string | undefined,
  initialLeads?: Lead[],
  initialTotal?: number
) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads || []);
  const [total, setTotal] = useState(initialTotal || 0);
  // If we have initial data, start not-loading so we don't trigger a fetch immediately
  const [loading, setLoading] = useState(!initialLeads);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<LeadsFilters>(DEFAULT_FILTERS);

  const searchTimeout = useRef<ReturnType<typeof setTimeout>>();
  // Track whether the initial server data has been used (skip first fetch if filters are default)
  const hasInitialData = useRef(!!initialLeads);

  const fetchLeads = useCallback(async (f: LeadsFilters) => {
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();

      let query = supabase
        .from("leads")
        .select(
          "*, owner:users!leads_owner_id_fkey(id, full_name, email, avatar_url)",
          { count: "exact" }
        )
        .is("deleted_at", null);

      if (f.tab === "mine" && userId) query = query.eq("owner_id", userId);
      if (f.status) query = query.eq("status", f.status);
      if (f.source) query = query.eq("lead_source", f.source);
      if (f.country) query = query.eq("country", f.country);
      if (f.owner_id === "__unassigned__") {
        query = query.is("owner_id", null);
      } else if (f.owner_id) {
        query = query.eq("owner_id", f.owner_id);
      }
      if (f.search) {
        query = query.or(
          `business_name.ilike.%${f.search}%,first_name.ilike.%${f.search}%,last_name.ilike.%${f.search}%,email.ilike.%${f.search}%,phone.ilike.%${f.search}%`
        );
      }

      const from = f.page * PAGE_SIZE;
      query = query
        .order("created_at", { ascending: false })
        .range(from, from + PAGE_SIZE - 1);

      const { data, count, error: qErr } = await query;

      if (qErr) {
        setError(qErr.message);
        setLeads([]);
        setTotal(0);
      } else {
        setLeads((data as unknown as Lead[]) || []);
        setTotal(count || 0);
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to fetch leads");
      setLeads([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const updateSearch = (search: string) => {
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setFilters((f) => ({ ...f, search, page: 0 }));
    }, 300);
  };

  const updateFilter = (key: keyof LeadsFilters, value: string | number) => {
    setFilters((f) => ({ ...f, [key]: value, page: 0 }));
  };

  const setPage = (page: number) => setFilters((f) => ({ ...f, page }));

  useEffect(() => {
    // Skip the first fetch if we have server-prefetched data and filters are still default
    if (hasInitialData.current) {
      hasInitialData.current = false;
      return;
    }
    fetchLeads(filters);
  }, [filters, fetchLeads]);

  return {
    leads, total, loading, error, filters, pageSize: PAGE_SIZE,
    setFilters, updateSearch, updateFilter, setPage,
    refetch: () => fetchLeads(filters),
  };
}
