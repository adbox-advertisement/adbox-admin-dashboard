import { ArrowLeft, Check, Clock3 } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { Link } from "react-router-dom"

import { DashboardHeader } from "@/components/layout/DashboardHeader"
import { DashboardSidebar } from "@/components/layout/DashboardSidebar"
import { APP_ROUTES } from "@/routes/paths"

export type PendingFeaturePageProps = {
  title: string
  section?: string
  description: string
  icon: LucideIcon
}

export function PendingFeaturePage({
  title,
  section = "AdBox workspace",
  description,
  icon: Icon,
}: PendingFeaturePageProps) {
  return (
    <main className="min-h-svh w-full overflow-x-hidden bg-auth-background font-sans text-grey-1000 lg:pl-[290px]">
      <DashboardSidebar />

      <section className="w-full min-w-0">
        <div className="mx-auto w-full max-w-[1536px] min-w-0">
          <DashboardHeader title={title} />

          <div className="px-4 pb-10 sm:px-6 sm:pb-12">
            <section className="relative flex min-h-[560px] overflow-hidden rounded-[20px] border border-grey-100 bg-white px-6 py-14 shadow-adbox-small sm:px-10 lg:min-h-[620px]">
              <div className="pointer-events-none absolute -right-32 -top-28 size-[360px] rounded-full bg-purple/10 blur-[90px]" />
              <div className="pointer-events-none absolute -bottom-32 -left-24 size-[320px] rounded-full bg-cyan/10 blur-[90px]" />

              <div className="relative mx-auto flex w-full max-w-[680px] flex-col items-center justify-center text-center">
                <div className="relative flex size-[88px] items-center justify-center rounded-[28px] bg-[linear-gradient(145deg,#f4e8ff,#e7f9ff)] shadow-adbox-medium">
                  <span className="absolute right-2 top-2 size-3 rounded-full border-2 border-white bg-warning-400" aria-hidden="true" />
                  <Icon aria-hidden="true" className="size-9 text-purple" strokeWidth={1.55} />
                </div>

                <span className="mt-7 inline-flex items-center gap-2 rounded-full border border-warning-200 bg-warning-50 px-3.5 py-1.5 text-b3 font-semibold text-warning-700">
                  <Clock3 aria-hidden="true" className="size-3.5" strokeWidth={1.8} />
                  Pending
                </span>

                <p className="mt-5 text-b3 font-semibold uppercase tracking-[0.16em] text-grey-400">
                  {section}
                </p>
                <h2 className="mt-3 max-w-[620px] font-heading text-h5 font-semibold leading-tight text-grey-1000 sm:text-h4">
                  {title} is being prepared
                </h2>
                <p className="mt-5 max-w-[560px] text-b2 leading-6 text-grey-500">
                  {description}
                </p>

                <div className="mt-8 grid w-full max-w-[520px] gap-3 text-left sm:grid-cols-2">
                  <div className="flex items-center gap-3 rounded-xl border border-success-100 bg-success-50/60 px-4 py-3 text-b3 text-grey-600">
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-success-100 text-success-700">
                      <Check aria-hidden="true" className="size-3.5" strokeWidth={2} />
                    </span>
                    Navigation is ready
                  </div>
                  <div className="flex items-center gap-3 rounded-xl border border-warning-100 bg-warning-50/60 px-4 py-3 text-b3 text-grey-600">
                    <span className="size-2.5 shrink-0 rounded-full bg-warning-400" aria-hidden="true" />
                    Feature work is pending
                  </div>
                </div>

                <Link
                  to={APP_ROUTES.dashboard}
                  className="mt-8 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-purple px-5 text-b3 font-semibold text-white shadow-adbox-small transition-colors hover:bg-purple/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple focus-visible:ring-offset-2"
                >
                  <ArrowLeft aria-hidden="true" className="size-4" strokeWidth={1.8} />
                  Back to Dashboard
                </Link>
              </div>
            </section>
          </div>
        </div>
      </section>
    </main>
  )
}
