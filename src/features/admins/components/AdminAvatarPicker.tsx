import { useRef, useState } from "react"
import { Plus, UserRound } from "lucide-react"

const MAX_AVATAR_BYTES = 5 * 1024 * 1024

function readImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => typeof reader.result === "string" ? resolve(reader.result) : reject(new Error("This image could not be read."))
    reader.onerror = () => reject(new Error("This image could not be read."))
    reader.readAsDataURL(file)
  })
}

export function AdminAvatarPicker({ value, onChange }: { value: string; onChange: (dataUrl: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState("")

  async function handleFile(file: File) {
    if (!file.type.startsWith("image/")) {
      setError("Choose an image file.")
      return
    }
    if (file.size > MAX_AVATAR_BYTES) {
      setError("Choose an image smaller than 5 MB.")
      return
    }
    try {
      onChange(await readImage(file))
      setError("")
    } catch {
      setError("This image could not be read.")
    }
  }

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          aria-label={value ? "Change profile photo" : "Upload profile photo"}
          className="flex size-20 items-center justify-center overflow-hidden rounded-full bg-grey-100 outline-none focus-visible:shadow-adbox-focus-secondary"
        >
          {value ? <img src={value} alt="" className="size-full object-cover" /> : <UserRound className="size-8 text-grey-400" strokeWidth={1.5} aria-hidden="true" />}
        </button>
        <span aria-hidden="true" className="pointer-events-none absolute bottom-0 right-0 flex size-7 items-center justify-center rounded-full border-2 border-white bg-purple text-white">
          <Plus className="size-4" strokeWidth={2.5} />
        </span>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          aria-hidden="true"
          tabIndex={-1}
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0]
            if (file) handleFile(file)
            event.target.value = ""
          }}
        />
      </div>
      {error && <p role="alert" className="mt-2 text-center text-xs leading-5 text-destructive">{error}</p>}
    </div>
  )
}
