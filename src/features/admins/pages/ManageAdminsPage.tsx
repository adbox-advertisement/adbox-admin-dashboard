import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AdminsTable } from "../components/AdminsTable"
import { RolesTable } from "../components/RolesTable"

export function ManageAdminsPage() {
  return (
    <div className="flex w-full min-w-0 flex-col gap-5 pb-10 pt-8 sm:pb-12">
      <section className="min-w-0 px-4 sm:px-6">
        <Tabs defaultValue="admin">
          <TabsList className="mb-5 w-fit gap-1 rounded-xl border-0 bg-white p-1 shadow-adbox-small">
            <TabsTrigger value="admin" className="rounded-lg border-0 px-4 py-2.5 text-b3 data-[state=active]:bg-grey-1000 data-[state=active]:text-white md:text-b2">Admin</TabsTrigger>
            <TabsTrigger value="roles" className="rounded-lg border-0 px-4 py-2.5 text-b3 data-[state=active]:bg-grey-1000 data-[state=active]:text-white md:text-b2">Manage Roles and permissions</TabsTrigger>
          </TabsList>

          <TabsContent value="admin"><AdminsTable /></TabsContent>
          <TabsContent value="roles"><RolesTable /></TabsContent>
        </Tabs>
      </section>
    </div>
  )
}
