import type { Metadata } from "next"
import { PeopleView } from "@/features/finance"

export const metadata: Metadata = {
  title: "السلف",
}

export default function Page() {
  return <PeopleView />
}
