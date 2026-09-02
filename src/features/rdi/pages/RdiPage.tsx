import { DashboardHeader } from "@/components/layout/DashboardHeader"
import { DashboardSidebar } from "@/components/layout/DashboardSidebar"

export function RdiPage() {
  return (
    <main className="min-h-svh w-full overflow-x-hidden bg-auth-background font-sans text-grey-1000 lg:pl-[290px]">
      <DashboardSidebar />

      <section className="w-full min-w-0">
        <div className="mx-auto w-full max-w-[1536px] min-w-0">
          <DashboardHeader title="RDI website management" />
          <div className="flex min-h-[calc(100svh-101px)] w-full min-w-0 flex-col gap-5 px-4 pb-10 pt-8 sm:px-6 sm:pb-12">
            <div className="flex min-h-[320px] w-full flex-1 items-center justify-center rounded-[20px] bg-white p-6 text-b2 font-semibold text-grey-400 shadow-[14px_17px_20px_rgba(112,144,176,0.08)]">
              RDI website management
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
