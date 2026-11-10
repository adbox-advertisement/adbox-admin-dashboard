import { useEffect, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { getSavedReplies, getSupportSummary, getTicket, getTickets, markRead, replyToTicket, resetSampleDesk, updateTicket } from "./api"
import type { TicketQuery } from "./types"

const keys = {
  all: ["support"] as const,
  list: (query: TicketQuery) => ["support", "tickets", query] as const,
  one: (id: string) => ["support", "ticket", id] as const,
  summary: ["support", "summary"] as const,
  replies: ["support", "saved-replies"] as const,
}

export function useTickets(query: TicketQuery) {
  return useQuery({ queryKey: keys.list(query), queryFn: () => getTickets(query), placeholderData: (previous) => previous })
}

export function useTicket(id: string | null) {
  const client = useQueryClient()
  return useQuery({
    queryKey: keys.one(id ?? ""),
    queryFn: async () => {
      await markRead(id ?? "")
      // Opening it marks it read; the list shows that straight away.
      void client.invalidateQueries({ queryKey: ["support", "tickets"] })
      return getTicket(id ?? "")
    },
    enabled: Boolean(id),
  })
}

export function useSupportSummary() {
  return useQuery({ queryKey: keys.summary, queryFn: getSupportSummary })
}

export function useSavedReplies() {
  return useQuery({ queryKey: keys.replies, queryFn: getSavedReplies, staleTime: Number.POSITIVE_INFINITY })
}

export function useReply() {
  const client = useQueryClient()
  return useMutation({ mutationFn: replyToTicket, onSettled: () => client.invalidateQueries({ queryKey: keys.all }) })
}

export function useUpdateTicket() {
  const client = useQueryClient()
  return useMutation({ mutationFn: updateTicket, onSettled: () => client.invalidateQueries({ queryKey: keys.all }) })
}

/** Puts the sample conversations back as they started. */
export function useResetSampleDesk() {
  const client = useQueryClient()
  return () => {
    resetSampleDesk()
    void client.invalidateQueries({ queryKey: keys.all })
  }
}

/** The current time, ticking so reply deadlines count down on screen. */
export function useNow(intervalMs = 30_000) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), intervalMs)
    return () => clearInterval(timer)
  }, [intervalMs])
  return now
}
