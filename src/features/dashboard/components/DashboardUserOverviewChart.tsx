import {
  Bar,
  BarChart,
  ReferenceLine,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts"

type UserOverviewDatum = {
  month: string
  users: number
  highlight?: number
}

type BarShapeProps = {
  x?: number
  y?: number
  width?: number
  height?: number
  payload?: UserOverviewDatum
}

const userOverviewData: UserOverviewDatum[] = [
  { month: "Jan", users: 58 },
  { month: "Feb", users: 142 },
  { month: "Mar", users: 98 },
  { month: "Apr", users: 112 },
  { month: "May", users: 90 },
  { month: "Jun", users: 161, highlight: 90 },
  { month: "Jul", users: 78, highlight: 53 },
  { month: "Aug", users: 142 },
  { month: "Sep", users: 39 },
  { month: "Oct", users: 112 },
  { month: "Nov", users: 63 },
  { month: "Dec", users: 98 },
]

function UserOverviewBar({ x = 0, y = 0, width = 0, height = 0, payload }: BarShapeProps) {
  const highlightHeight =
    payload?.highlight && payload.users
      ? Math.max(0, Math.min(height, height * (payload.highlight / payload.users)))
      : 0

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={8}
        ry={8}
        fill="var(--adbox-chart-cyan)"
      />
      {highlightHeight > 0 ? (
        <rect
          x={x}
          y={y + height - highlightHeight}
          width={width}
          height={highlightHeight}
          rx={8}
          ry={8}
          fill="var(--adbox-purple)"
        />
      ) : null}
    </g>
  )
}

export function DashboardUserOverviewChart() {
  return (
    <section className="px-4 sm:px-6">
      <article className="min-h-[364px] max-w-full overflow-hidden rounded-[20px] bg-white pb-[30px] pl-6 pr-2 pt-7 sm:pl-8">
        <div className="mb-[21px]">
          <p className="text-b2 font-semibold text-secondary-grey-600 md:text-b1 md:leading-[19px]">
            User Overview
          </p>
          <p className="font-chart text-[28px] font-bold leading-9 text-chart-ink md:text-[34px] md:leading-[42px]">
            682k
          </p>
        </div>

        <div className="max-w-full overflow-x-auto pb-1">
          <div className="h-[234px] min-w-[720px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={userOverviewData}
                margin={{ top: 5, right: 42, bottom: 0, left: 0 }}
                barCategoryGap="26%"
              >
                <YAxis
                  hide
                  type="number"
                  domain={[0, 190]}
                  allowDataOverflow={false}
                />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  interval={0}
                  minTickGap={0}
                  tickMargin={17}
                  height={39}
                  tick={{
                    fill: "var(--adbox-secondary-grey-600)",
                    fontFamily: "var(--adbox-font-chart)",
                    fontSize: 12,
                    fontWeight: 500,
                  }}
                />
                <ReferenceLine
                  y={179}
                  stroke="var(--adbox-date-accent)"
                  strokeDasharray="6 6"
                  strokeOpacity={0.5}
                  label={{
                    value: "179",
                    position: "right",
                    fill: "var(--adbox-date-accent)",
                    fontSize: 12,
                    fontWeight: 500,
                    fontFamily: "var(--adbox-font-chart)",
                  }}
                />
                <Bar
                  dataKey="users"
                  barSize={24}
                  shape={<UserOverviewBar />}
                  isAnimationActive={false}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </article>
    </section>
  )
}
