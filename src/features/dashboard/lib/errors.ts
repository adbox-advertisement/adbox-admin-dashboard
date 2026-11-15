import { isAxiosError } from "axios"

/** The server answered that it has no such route: it is older than this page. */
export const isMissingRoute = (error: unknown) => isAxiosError(error) && error.response?.status === 404
