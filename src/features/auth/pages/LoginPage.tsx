import { useState, type FormEvent } from "react"
import { useNavigate } from "react-router-dom"

import mainLogo from "@/assets/mainlogo.svg"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { APP_ROUTES } from "@/routes/paths"
import { loginAdmin } from "@/features/auth/api"

export function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSignIn = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError("")
    setIsSubmitting(true)
    try {
      await loginAdmin(email, password)
      navigate(APP_ROUTES.dashboard, { replace: true })
    } catch {
      setError("Sign in failed. Check your email and password, then try again.")
    } finally {
      setIsSubmitting(false)
    }
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
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    autoComplete="username"
                    required
                    placeholder="email@adbox.com"
                    className="h-[52px] rounded-lg border-grey-300 bg-white px-3.5 py-4 text-b2 text-grey-1000 placeholder:text-grey-400 focus-visible:border-grey-400 focus-visible:ring-0"
                  />
                </label>

                <label className="flex w-full flex-col gap-2">
                  <span className="text-b2 font-semibold text-grey-1000">
                    Password
                  </span>
                  <Input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    autoComplete="current-password"
                    minLength={5}
                    required
                    placeholder="Your Password"
                    className="h-[52px] rounded-lg border-grey-300 bg-white px-3.5 py-4 text-b2 text-grey-1000 placeholder:text-grey-400 focus-visible:border-grey-400 focus-visible:ring-0"
                  />
                </label>
              </div>
            </div>

            {error ? (
              <p role="alert" className="px-6 text-sm font-medium text-error-700">
                {error}
              </p>
            ) : null}

            <div className="p-0 sm:p-6">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-11 w-full rounded-[36px] bg-[image:var(--gradient-purple)] px-5 py-3 text-b2 font-semibold text-white hover:opacity-90"
              >
                {isSubmitting ? "Signing in…" : "Sign in"}
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
