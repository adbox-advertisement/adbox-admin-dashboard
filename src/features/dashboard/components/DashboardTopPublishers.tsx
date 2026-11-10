import { publishers } from "../data/geography"

export function DashboardTopPublishers() {
  return (
    <article className="flex min-h-[326px] flex-col overflow-hidden rounded-[14px] bg-white dark:bg-card shadow-adbox-small">
      <div className="px-4 pb-2 pt-6 sm:px-5">
        <h2 className="font-heading text-h6 font-semibold text-black dark:text-foreground md:text-h5">
          Top Publishers
        </h2>
      </div>
      <div className="min-h-0 flex-1 overflow-x-auto pb-6">
        <table className="w-full min-w-[288px] text-left">
          <thead>
            <tr className="border-b border-divider dark:border-border text-b3 font-semibold text-grey-500 dark:text-muted-foreground md:text-b2">
              <th className="px-4 pb-[14px] pt-[9px] font-semibold sm:px-5">
                User
              </th>
              <th className="px-2 pb-[14px] pt-[9px] font-semibold">
                Spending
              </th>
              <th className="w-[74px] px-2 pb-[14px] pt-[9px] font-semibold">
                Views
              </th>
            </tr>
          </thead>
          <tbody>
            {publishers.map((publisher) => (
              <tr
                key={publisher.name}
                className="text-b3 text-grey-500 dark:text-muted-foreground transition-colors hover:bg-grey-50/70 dark:hover:bg-background/70 md:text-b2"
              >
                <td className="px-4 py-2 sm:px-5">
                  <div className="flex items-center gap-[10px]">
                    <img
                      src={publisher.avatar}
                      alt=""
                      className="size-[30px] shrink-0 rounded-full object-cover"
                    />
                    <span className="min-w-0 truncate">
                      {publisher.name}
                    </span>
                  </div>
                </td>
                <td className="px-2 py-2 font-semibold text-grey-500 dark:text-muted-foreground">
                  {publisher.spending}
                </td>
                <td className="w-[74px] px-2 py-2">{publisher.views}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </article>
  )
}
