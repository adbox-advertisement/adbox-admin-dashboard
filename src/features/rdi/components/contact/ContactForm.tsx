import { useState, type FormEvent } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
export function ContactForm() {
  const [message, setMessage] = useState("")
  const controlClass = "mt-2 h-11 w-full rounded-md border-slate-300 bg-white px-3 text-sm text-slate-900 shadow-none placeholder:text-slate-400 focus-visible:border-slate-500 focus-visible:ring-slate-300"
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setMessage("This is a preview. Your message has not been sent.")
  }
  return (<form onSubmit={handleSubmit} className="space-y-6">
    <div className="grid gap-6 @min-[640px]/rdi:grid-cols-2">
      <label className="text-sm font-medium text-slate-900">

        First Name

        <Input name="firstName" autoComplete="given-name" required placeholder="John" className={controlClass} />
      </label>
      <label className="text-sm font-medium text-slate-900">

        Last Name

        <Input name="lastName" autoComplete="family-name" required placeholder="Doe" className={controlClass} />
      </label>
    </div>
    <label className="block text-sm font-medium text-slate-900">

      Email Address

      <Input name="email" type="email" autoComplete="email" required placeholder="john@example.com" className={controlClass} />
    </label>
    <label className="block text-sm font-medium text-slate-900">

      Phone Number

      <Input name="phone" type="tel" autoComplete="tel" placeholder="+233 XX XXX XXXX" className={controlClass} />
    </label>
    <label className="block text-sm font-medium text-slate-900">

      Service Interested In


      <select name="service" required defaultValue="" className={controlClass + " border outline-none focus:ring-2"}>
        <option value="" disabled>

          Select a service

        </option>
        {["Construction Services", "Media Services", "Solar Technology Services", "Multi-Division Project", "Other"].map(service => <option key={service}>
          {service}
        </option>)}
      </select>
    </label>
    <label className="block text-sm font-medium text-slate-900">

      Message

      <Textarea name="message" required rows={5} placeholder="Tell us about your project..." className={controlClass + " h-auto min-h-32 py-3"} />
    </label>
    <button type="submit" className="min-h-11 w-full rounded-md bg-slate-900 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-slate-900">

      Send Message

    </button>
    {message && <p role="status" className="rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-600">
      {message}
    </p>}
  </form>)
}
