export function pageRange(page: number, limit: number, total: number) {
  if (total === 0) return { from: 0, to: 0, pages: 1 }
  return { from: (page - 1) * limit + 1, to: Math.min(page * limit, total), pages: Math.max(1, Math.ceil(total / limit)) }
}
