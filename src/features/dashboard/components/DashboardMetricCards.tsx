import { ArrowDownRight, ArrowUpRight } from "lucide-react"

import { cn } from "@/lib/utils"
import revenueSparkline from "@/assets/dashboard/revenue-sparkline.svg"
import userIconBg from "@/assets/dashboard/user-icon-bg.svg"
import userIconGroup1 from "@/assets/dashboard/user-icon-group-1.svg"
import userIconGroup2 from "@/assets/dashboard/user-icon-group-2.svg"
import userIconGroup3 from "@/assets/dashboard/user-icon-group-3.svg"
import userIconGroup4 from "@/assets/dashboard/user-icon-group-4.svg"

const paymentBars = [82, 52, 69, 91, 24]

export type TrendDirection = "up" | "down"

export function UsersGlyph() {
  return (
    <div className="relative size-14 shrink-0" aria-hidden="true">
      <img
        src={userIconBg}
        alt=""
        className="absolute inset-0 size-full object-contain"
      />
      <div className="absolute left-3.5 top-3.5 size-7">
        <img
          src={userIconGroup1}
          alt=""
          className="absolute bottom-[16.67%] right-[4.17%] h-[28.62%] w-[26.37%]"
        />
        <img
          src={userIconGroup2}
          alt=""
          className="absolute bottom-1/2 left-[20.83%] right-[45.83%] top-[16.67%]"
        />
        <img
          src={userIconGroup3}
          alt=""
          className="absolute bottom-1/2 left-[56.96%] right-[20.83%] top-[16.67%]"
        />
        <img
          src={userIconGroup4}
          alt=""
          className="absolute bottom-[16.67%] left-[4.17%] right-[29.17%] top-[54.17%]"
        />
      </div>
    </div>
  )
}

export function TrendBadge({
  direction,
  value,
  tone = "default",
}: {
  direction: TrendDirection
  value: string
  tone?: "default" | "inverse"
}) {
  const isUp = direction === "up"
  const Icon = isUp ? ArrowUpRight : ArrowDownRight

  return (
    <span
      className={cn(
        "inline-flex w-fit items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-semibold leading-none",
        tone === "inverse"
          ? "bg-white/15 text-white"
          : isUp
            ? "bg-success-100 text-success-700"
            : "bg-error-100 text-error-700",
      )}
    >
      <Icon className="size-3" strokeWidth={2.5} aria-hidden="true" />
      {value}
    </span>
  )
}

function MiniBarChart() {
  return (
    <div
      className="flex h-[46px] w-[64px] shrink-0 items-end justify-between gap-[9px]"
      aria-hidden="true"
    >
      {paymentBars.map((height, index) => (
        <div
          key={`${height}-${index}`}
          className="relative h-full w-[5.33px] overflow-hidden rounded-full bg-accent-background"
        >
          <div
            className="absolute bottom-0 left-0 w-full rounded-full bg-purple"
            style={{ height: `${height}%` }}
          />
        </div>
      ))}
    </div>
  )
}

const cardBase =
  "min-h-[112px] overflow-hidden rounded-[20px] shadow-adbox-small transition-all duration-200 hover:-translate-y-0.5 hover:shadow-adbox-medium"

export function DashboardMetricCards() {
  return (
    <section className="px-4 sm:px-6">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-4 md:grid-cols-6 xl:grid-cols-12">
        <article
          className={cn(
            cardBase,
            "col-span-1 flex items-center gap-4 bg-[image:var(--gradient-primary)] p-4 sm:col-span-4 md:col-span-3 xl:col-span-3",
          )}
        >
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <p className="truncate text-b3 text-accent-background md:text-b2">Total Revenue</p>
            <p className="truncate font-heading text-h6 font-semibold text-white md:text-h5">
              $2421,682
            </p>
            <TrendBadge direction="up" value="12.4%" tone="inverse" />
          </div>
          <img
            src={revenueSparkline}
            alt=""
            className="h-11 w-[70px] shrink-0 object-contain"
          />
        </article>

        <article
          className={cn(
            cardBase,
            "col-span-1 flex items-center gap-4 bg-white px-6 py-4 sm:col-span-4 md:col-span-3 xl:col-span-3",
          )}
        >
          <UsersGlyph />
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <p className="truncate text-b3 text-secondary-grey-600 md:text-b2">Total Users</p>
            <p className="truncate font-heading text-h6 font-semibold text-grey-1000 md:text-h5">
              321
            </p>
            <TrendBadge direction="up" value="8.1%" />
          </div>
        </article>

        <article
          className={cn(
            cardBase,
            "col-span-1 flex items-center gap-4 bg-white px-6 py-4 sm:col-span-4 md:col-span-3 xl:col-span-3",
          )}
        >
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <p className="truncate text-b3 text-secondary-grey-600 md:text-b2">Ad Payment</p>
            <p className="truncate font-heading text-h6 font-semibold text-grey-1000 md:text-h5">
              $9,2421,682
            </p>
            <TrendBadge direction="up" value="4.6%" />
          </div>
          <MiniBarChart />
        </article>

        <article
          className={cn(
            cardBase,
            "col-span-1 flex items-center gap-4 bg-white px-6 py-4 sm:col-span-4 md:col-span-3 xl:col-span-3",
          )}
        >
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <p className="truncate text-b3 text-secondary-grey-600 md:text-b2">
              Reward Payment
            </p>
            <p className="truncate font-heading text-h6 font-semibold text-grey-1000 md:text-h5">
              $9,2421
            </p>
            <TrendBadge direction="down" value="2.3%" />
          </div>
          <MiniBarChart />
        </article>
      </div>
    </section>
  )
}
