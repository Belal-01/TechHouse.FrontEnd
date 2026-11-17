"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { dashboardKeys } from "@/features/dashboard"
import { useInvalidateCash } from "@/features/finance"
import { api } from "@/lib/api/client"

export type Material = {
  id: string; name: string; quantity: number; costUsd: number; account: string; date: string; depleted: boolean
}
export type Installation = {
  id: string; customer: string; technician?: string; date: string; receivedUsd: number; materialsUsd: number
  technicianUsd: number; profitUsd: number; receiptAccount: string; technicianAccount?: string
}
type Overview = {
  materials: Material[]; installations: Installation[]; costUsd: number; coveredUsd: number; uncoveredUsd: number
}
type Write =
  | { kind: "deplete"; id: string }
  | { kind: "purchase"; data: { id: string; name: string; quantity: number; costUsd: number; accountId: string; date: string } }
  | { kind: "record"; data: { id: string; customer: string; technician: string; date: string; receivedUsd: number
      materialsUsd: number; technicianUsd: number; receiptAccountId: string; technicianAccountId: string | null } }

const endpoint = "/admin/installations"
const key = ["installations"] as const

export function useInstallations() {
  return useQuery({ queryKey: key, queryFn: () => api.get<Overview>(endpoint) })
}

export function useWriteInstallation() {
  const queryClient = useQueryClient()
  const invalidateCash = useInvalidateCash()
  return useMutation({
    mutationFn: (input: Write) => {
      if (input.kind === "deplete") return api.put<void>(`${endpoint}/materials/${encodeURIComponent(input.id)}/depleted`, {})
      return api.post<void>(input.kind === "purchase" ? `${endpoint}/materials` : endpoint, input.data)
    },
    onSuccess: (_, input) => Promise.all([
      queryClient.invalidateQueries({ queryKey: key }),
      ...(input.kind === "deplete" ? [] : [invalidateCash(), queryClient.invalidateQueries({ queryKey: dashboardKeys.all })]),
    ]),
  })
}
