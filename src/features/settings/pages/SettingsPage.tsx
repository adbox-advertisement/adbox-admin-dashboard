import { Bell, LogOut, Monitor, Moon, Sun, UserRound, Volume2, VolumeX } from "lucide-react"
import { useTheme } from "next-themes"
import { Form, useNavigation } from "react-router-dom"
import { ThemeToggle } from "@/components/layout/ThemeToggle"
import { Button } from "@/components/ui/button"
import { playChime, useActivitySound } from "@/features/activity"
import { APP_ROUTES } from "@/routes/paths"

export function SettingsPage() {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"
  const ThemeIcon = isDark ? Moon : Sun
  const navigation = useNavigation()
  const isLoggingOut = navigation.state !== "idle" && navigation.formAction === APP_ROUTES.logout
  const soundEnabled = useActivitySound((state) => state.soundEnabled)
  const setSoundEnabled = useActivitySound((state) => state.setSoundEnabled)
  const SoundIcon = soundEnabled ? Volume2 : VolumeX

  return (
    <div className="space-y-8 px-4 pb-12 pt-2 sm:px-6">
      <p className="max-w-xl text-sm leading-6 text-muted-foreground">
        Personalize your AdBox workspace. Changes apply as soon as you make them.
      </p>

      <section aria-labelledby="appearance-heading" className="grid grid-cols-1 items-start gap-6 sm:grid-cols-4 md:grid-cols-6 xl:grid-cols-12">
        <div className="sm:col-span-4 md:col-span-6 xl:col-span-3">
          <span className="mb-4 flex size-11 items-center justify-center rounded-2xl bg-blue/10 text-blue dark:bg-cyan/10 dark:text-cyan">
            <Monitor className="size-5" aria-hidden="true" />
          </span>
          <h2 id="appearance-heading" className="text-lg font-semibold">Appearance</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Choose a look that feels comfortable for you.
          </p>
        </div>

        <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-adbox-small sm:col-span-4 md:col-span-6 xl:col-span-9">
          <div className="flex flex-col gap-6 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-7">
            <div className="flex items-start gap-4">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-muted text-blue dark:text-cyan">
                <ThemeIcon className="size-6" aria-hidden="true" />
              </span>
              <div>
                <h3 className="text-base font-semibold">Theme</h3>
                <p role="status" className="mt-1 text-sm text-muted-foreground">
                  {isDark ? "Dark mode is on" : "Light mode is on"}
                </p>
                <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                  Apply light or dark mode across the entire application.
                </p>
              </div>
            </div>
            <ThemeToggle />
          </div>
          <p className="border-t border-border bg-muted/30 px-5 py-4 text-xs leading-5 text-muted-foreground sm:px-7">
            Your preference is remembered in this browser and shared across open AdBox tabs.
          </p>
        </div>
      </section>

      <section aria-labelledby="notifications-heading" className="grid grid-cols-1 items-start gap-6 sm:grid-cols-4 md:grid-cols-6 xl:grid-cols-12">
        <div className="sm:col-span-4 md:col-span-6 xl:col-span-3">
          <span className="mb-4 flex size-11 items-center justify-center rounded-2xl bg-blue/10 text-blue dark:bg-cyan/10 dark:text-cyan">
            <Bell className="size-5" aria-hidden="true" />
          </span>
          <h2 id="notifications-heading" className="text-lg font-semibold">Notifications</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Know when new work arrives while AdBox is open.
          </p>
        </div>

        <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-adbox-small sm:col-span-4 md:col-span-6 xl:col-span-9">
          <div className="flex flex-col gap-6 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-7">
            <div className="flex items-start gap-4">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-muted text-blue dark:text-cyan">
                <SoundIcon className="size-6" aria-hidden="true" />
              </span>
              <div>
                <h3 className="text-base font-semibold">Sound for new work</h3>
                <p role="status" className="mt-1 text-sm text-muted-foreground">
                  {soundEnabled ? "Sound is on" : "Sound is off"}
                </p>
                <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                  A short chime plays when something new needs a review, such as an ad request or a report. The menu always shows how many are waiting.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 sm:shrink-0 sm:justify-end">
              <Button type="button" variant="outline" className="min-h-11 rounded-full bg-card px-5 text-foreground" onClick={() => setSoundEnabled(!soundEnabled)}>
                {soundEnabled ? "Turn sound off" : "Turn sound on"}
              </Button>
              <Button type="button" variant="ghost" className="min-h-11 rounded-full px-5" onClick={() => playChime({ force: true })}>
                Play sound
              </Button>
            </div>
          </div>
          <p className="border-t border-border bg-muted/30 px-5 py-4 text-xs leading-5 text-muted-foreground sm:px-7">
            Your choice is remembered in this browser.
          </p>
        </div>
      </section>

      <section aria-labelledby="account-heading" className="grid grid-cols-1 items-start gap-6 sm:grid-cols-4 md:grid-cols-6 xl:grid-cols-12">
        <div className="sm:col-span-4 md:col-span-6 xl:col-span-3">
          <span className="mb-4 flex size-11 items-center justify-center rounded-2xl bg-blue/10 text-blue dark:bg-cyan/10 dark:text-cyan">
            <UserRound className="size-5" aria-hidden="true" />
          </span>
          <h2 id="account-heading" className="text-lg font-semibold">Account</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Manage your session on this device.
          </p>
        </div>

        <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-adbox-small sm:col-span-4 md:col-span-6 xl:col-span-9">
          <div className="flex flex-col gap-6 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-7">
            <div className="flex items-start gap-4">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-error-50 text-error-500 dark:bg-error-400/10">
                <LogOut className="size-6" aria-hidden="true" />
              </span>
              <div>
                <h3 className="text-base font-semibold">Log out</h3>
                <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                  End your session and return to the sign-in page.
                </p>
              </div>
            </div>
            <Form method="post" action={APP_ROUTES.logout}>
              <button
                type="submit"
                disabled={isLoggingOut}
                className="flex h-11 items-center gap-2 rounded-xl border border-error-100 px-4 text-sm font-semibold text-error-500 outline-none transition-colors hover:bg-error-50 focus-visible:ring-2 focus-visible:ring-error-300 disabled:opacity-60 dark:border-error-400/20 dark:hover:bg-error-400/10"
              >
                <LogOut className="size-4" aria-hidden="true" />
                {isLoggingOut ? "Logging out…" : "Log Out"}
              </button>
            </Form>
          </div>
        </div>
      </section>
    </div>
  )
}
