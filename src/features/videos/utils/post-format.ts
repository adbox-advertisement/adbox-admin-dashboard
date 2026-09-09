const compactNumber = new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 })
const postDate = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "Africa/Accra" })

export function formatPostNumber(value: number) { return compactNumber.format(value) }
export function formatPostDate(value: string) { return postDate.format(new Date(value)) }
