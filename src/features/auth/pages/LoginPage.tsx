import { ChevronDown } from "lucide-react"
import type { FormEvent } from "react"
import { useNavigate } from "react-router-dom"

import mainLogo from "@/assets/mainlogo.svg"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { APP_ROUTES } from "@/routes/paths"

export function LoginPage() {
  const navigate = useNavigate()

  const handleSignIn = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    navigate(APP_ROUTES.dashboard)
  }

  return (
    <main className="relative min-h-svh overflow-hidden bg-auth-background font-sans text-grey-1000">
      <section className="flex min-h-svh items-center justify-center px-5 py-24 sm:px-8">
        <div className="flex w-full max-w-[537px] flex-col items-center gap-10 rounded-[24px] bg-white px-6 py-10 sm:px-10 lg:-translate-y-5">
          <img
            src={mainLogo}
            alt="AdBox"
            className="h-[55.8px] w-[186px] object-contain"
          />

          <form className="flex w-full flex-col gap-[30px]" onSubmit={handleSignIn}>
            <div className="flex w-full flex-col px-0 py-5 sm:px-6">
              <div className="flex w-full flex-col gap-5">
                <label className="flex w-full flex-col gap-2">
                  <span className="text-b2 font-semibold text-grey-1000">
                    Email
                  </span>
                  <Input
                    type="email"
                    placeholder="email@adbox.com"
                    className="h-[52px] rounded-lg border-grey-300 bg-white px-3.5 py-4 text-b2 text-grey-1000 placeholder:text-grey-400 focus-visible:border-grey-400 focus-visible:ring-0"
                  />
                </label>

                <label className="flex w-full flex-col gap-2">
                  <span className="text-b2 font-semibold text-grey-1000">
                    Password
                  </span>
                  <div className="flex h-[52px] items-center gap-2 overflow-hidden rounded-lg border border-grey-300 bg-white px-3.5 py-4 focus-within:border-grey-400">
                    <Input
                      type="password"
                      placeholder="Your Password"
                      className="h-auto flex-1 border-0 bg-transparent p-0 text-b2 text-grey-1000 placeholder:text-grey-400 focus-visible:ring-0"
                    />
                    <ChevronDown
                      aria-hidden="true"
                      className="size-5 shrink-0 text-grey-400"
                      strokeWidth={1.5}
                    />
                  </div>
                </label>
              </div>
            </div>

            <div className="p-0 sm:p-6">
              <Button
                type="submit"
                className="h-11 w-full rounded-[36px] bg-[image:var(--gradient-purple)] px-5 py-3 text-b2 font-semibold text-white hover:opacity-90"
              >
                Sign in
              </Button>
            </div>
          </form>
        </div>
      </section>

      <footer className="absolute bottom-[69px] left-1/2 hidden w-[min(80.3vw,1156px)] -translate-x-1/2 items-center justify-between text-sm font-medium leading-6 tracking-[-0.28px] text-grey-400 lg:flex">
        <p>© 2022 AdBox. All Rights Reserved.</p>
        <nav aria-label="Footer navigation" className="flex items-center gap-[42px]">
          <a href="#" className="transition-colors hover:text-grey-1000">
            Website
          </a>
          <a href="#" className="transition-colors hover:text-grey-1000">
            Terms of Use
          </a>
          <a href="#" className="transition-colors hover:text-grey-1000">
            Blog
          </a>
        </nav>
      </footer>
    </main>
  )
}
