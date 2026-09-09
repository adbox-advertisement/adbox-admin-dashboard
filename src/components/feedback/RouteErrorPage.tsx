import { isRouteErrorResponse, useRouteError } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { APP_ROUTES } from "@/routes/paths"
export function RouteErrorPage() {
  const error = useRouteError()
  const notFound = isRouteErrorResponse(error) && error.status === 404
  return (
    <main className="flex min-h-svh items-center justify-center bg-auth-background p-6 text-grey-1000">
      <div className="w-full max-w-md rounded-3xl border border-grey-100 bg-white p-8 text-center shadow-adbox-small">
        <h1 className="text-2xl font-semibold">{notFound ? "Page not found" : "We couldn’t open this page"}</h1>
        <p className="mt-3 text-sm leading-6 text-grey-500">{notFound ? "This address may have changed. Return to your workspace to continue." : "Please try again. If the problem continues, check your connection."}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {!notFound && <Button onClick={() => window.location.reload()}>Try again</Button>}
          <Button variant="outline" asChild><a href={APP_ROUTES.root}>Back to AdBox</a></Button>
        </div>
      </div>
    </main>
  )
}
