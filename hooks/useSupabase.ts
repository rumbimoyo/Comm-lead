"use client";

import { useState, useCallback, useEffect } from "react";
import { createSupabaseBrowserClient } from "@/utils/supabase-browser";
import type { PostgrestError } from "@supabase/supabase-js";

interface QueryState<T> {
  data: T | null;
  isLoading: boolean;
  error: PostgrestError | null;
}

export function useSupabaseQuery<T>(
  queryFn: () => Promise<{ data: T | null; error: PostgrestError | null }>,
  deps: unknown[] = []
) {
  const [state, setState] = useState<QueryState<T>>({
    data: null,
    isLoading: true,
    error: null,
  });

  const execute = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const { data, error } = await queryFn();
      setState({ data, isLoading: false, error });
    } catch (err) {
      console.error("Query error:", err);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    execute();
  }, [execute]);

  return { ...state, refetch: execute };
}

// Simplified query builder for common operations
export function useTable<T>(tableName: string) {
  const supabase = createSupabaseBrowserClient();

  const getAll = useCallback(async (options?: {
    select?: string;
    order?: { column: string; ascending?: boolean };
    limit?: number;
    filters?: Array<{ column: string; operator: string; value: unknown }>;
  }): Promise<{ data: T[] | null; error: PostgrestError | null }> => {
    let query = supabase.from(tableName).select(options?.select || "*");

    if (options?.filters) {
      for (const filter of options.filters) {
        if (filter.operator === "eq") {
          query = query.eq(filter.column, filter.value);
        } else if (filter.operator === "ilike") {
          query = query.ilike(filter.column, filter.value as string);
        } else if (filter.operator === "in") {
          query = query.in(filter.column, filter.value as unknown[]);
        } else if (filter.operator === "gte") {
          query = query.gte(filter.column, filter.value);
        } else if (filter.operator === "lte") {
          query = query.lte(filter.column, filter.value);
        }
      }
    }

    if (options?.order) {
      query = query.order(options.order.column, { ascending: options.order.ascending ?? true });
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const result = await query;
    return result as { data: T[] | null; error: PostgrestError | null };
  }, [supabase, tableName]);

  const getById = useCallback(async (
    id: string,
    select?: string
  ): Promise<{ data: T | null; error: PostgrestError | null }> => {
    return supabase
      .from(tableName)
      .select(select || "*")
      .eq("id", id)
      .single();
  }, [supabase, tableName]);

  const create = useCallback(async (
    data: Partial<T>
  ): Promise<{ data: T | null; error: PostgrestError | null }> => {
    return supabase
      .from(tableName)
      .insert(data)
      .select()
      .single();
  }, [supabase, tableName]);

  const update = useCallback(async (
    id: string,
    data: Partial<T>
  ): Promise<{ data: T | null; error: PostgrestError | null }> => {
    return supabase
      .from(tableName)
      .update(data)
      .eq("id", id)
      .select()
      .single();
  }, [supabase, tableName]);

  const remove = useCallback(async (
    id: string
  ): Promise<{ error: PostgrestError | null }> => {
    return supabase
      .from(tableName)
      .delete()
      .eq("id", id);
  }, [supabase, tableName]);

  return { getAll, getById, create, update, remove, supabase };
}

// Stats aggregation hook
export function useStats() {
  const supabase = createSupabaseBrowserClient();

  const getCount = useCallback(async (
    tableName: string,
    filters?: Array<{ column: string; value: unknown }>
  ): Promise<number> => {
    let query = supabase.from(tableName).select("*", { count: "exact", head: true });
    
    if (filters) {
      for (const filter of filters) {
        query = query.eq(filter.column, filter.value);
      }
    }

    const { count, error } = await query;
    if (error) {
      console.error("Count error:", error);
      return 0;
    }
    
    return count || 0;
  }, [supabase]);

  const getSum = useCallback(async (
    tableName: string,
    column: string,
    filters?: Array<{ column: string; value: unknown }>
  ): Promise<number> => {
    let query = supabase.from(tableName).select(column);
    
    if (filters) {
      for (const filter of filters) {
        query = query.eq(filter.column, filter.value);
      }
    }

    const { data, error } = await query;
    if (error || !data) {
      console.error("Sum error:", error);
      return 0;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return data.reduce((sum: number, row: any) => sum + (Number(row[column]) || 0), 0);
  }, [supabase]);

  return { getCount, getSum };
}
