import { ShieldCheck, Users } from "lucide-react"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAdminsStore } from "../store/admins-store"
import { useRolesStore } from "../store/roles-store"
import { AdminsTable } from "../components/AdminsTable"
import { RolesTable } from "../components/RolesTable"

function SummaryPill({ icon, tone, label, value }: { icon: React.ReactNode; tone: "purple" | "blue"; label: string; value: number }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-2.5 shadow-adbox-small">
      <span className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${tone === "purple" ? "bg-purple/10 text-purple" : "bg-blue/10 text-blue"}`}>
        {icon}
      </span>
      <div>
        <p className="text-b4 leading-none text-grey-500">{label}</p>
        <p className="text-b2 font-semibold leading-tight text-grey-1000">{value}</p>
      </div>
    </div>
  )
}

export function ManageAdminsPage() {
  const adminsCount = useAdminsStore((state) => state.admins.length)
  const rolesCount = useRolesStore((state) => state.roles.length)

  return (
    <div className="flex w-full min-w-0 flex-col gap-6 pb-10 pt-8 sm:pb-12">
      <section className="min-w-0 px-4 sm:px-6">
        <Tabs defaultValue="admin">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <TabsList className="w-fit gap-1 rounded-xl border-0 bg-white p-1 shadow-adbox-small">
              <TabsTrigger value="admin" className="cursor-pointer rounded-lg border-0 px-4 py-2.5 text-b3 text-grey-500 data-[state=active]:bg-purple/10 data-[state=active]:text-purple md:text-b2">
                <Users className="size-4" aria-hidden="true" />Admin
              </TabsTrigger>
              <TabsTrigger value="roles" className="cursor-pointer rounded-lg border-0 px-4 py-2.5 text-b3 text-grey-500 data-[state=active]:bg-purple/10 data-[state=active]:text-purple md:text-b2">
                <ShieldCheck className="size-4" aria-hidden="true" />Manage Roles and permissions
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-3">
              <SummaryPill icon={<Users className="size-4" aria-hidden="true" />} tone="purple" label="Admins" value={adminsCount} />
              <SummaryPill icon={<ShieldCheck className="size-4" aria-hidden="true" />} tone="blue" label="Roles" value={rolesCount} />
            </div>
          </div>

          <TabsContent value="admin"><AdminsTable /></TabsContent>
          <TabsContent value="roles"><RolesTable /></TabsContent>
        </Tabs>
      </section>
    </div>
  )
}
