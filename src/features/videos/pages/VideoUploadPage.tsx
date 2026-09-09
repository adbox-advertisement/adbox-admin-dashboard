import { useEffect, useRef, useState } from "react"
import { ArrowLeft, FolderOpen } from "lucide-react"

import { Button } from "@/components/ui/button"
import { SchoolUploadWorkspace } from "../components/upload/SchoolUploadWorkspace"
import { SchoolSelection } from "../components/upload/SchoolSelection"
import { UploadSteps } from "../components/upload/UploadSteps"
import { uploadSchools, type UploadSchoolId } from "../data/schools"

export function VideoUploadPage() {
  const [selectedSchoolId, setSelectedSchoolId] = useState<UploadSchoolId | null>(null)
  const [visitedSchools, setVisitedSchools] = useState<UploadSchoolId[]>([])
  const headingRef = useRef<HTMLHeadingElement>(null)
  const schoolPickerRef = useRef<HTMLDivElement>(null)
  const selectedSchool = uploadSchools.find(({ id }) => id === selectedSchoolId)

  useEffect(() => {
    if (selectedSchoolId) headingRef.current?.focus()
  }, [selectedSchoolId])

  function selectSchool(id: UploadSchoolId) {
    setVisitedSchools((current) => current.includes(id) ? current : [...current, id])
    setSelectedSchoolId(id)
  }

  function changeSchool() {
    setSelectedSchoolId(null)
    requestAnimationFrame(() => schoolPickerRef.current?.querySelector<HTMLButtonElement>('button[data-school-choice="' + selectedSchoolId + '"]')?.focus())
  }

  return (
    <>
      <div ref={schoolPickerRef} hidden={selectedSchoolId !== null}>
        <SchoolSelection onSelect={selectSchool} />
      </div>
      {selectedSchool && <div className="video-reveal mb-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <Button type="button" variant="ghost" onClick={changeSchool} className="-ml-2 h-11 rounded-xl text-muted-foreground"><ArrowLeft aria-hidden="true" /> Change school</Button>
          <UploadSteps step={2} />
        </div>
        <div className="flex flex-wrap items-center gap-4 rounded-3xl border border-border/70 bg-card p-4 sm:gap-5 sm:p-5">
          <img src={selectedSchool.image} alt="" className="size-16 shrink-0 rounded-2xl object-cover sm:size-20" />
          <div className="min-w-0 flex-1">
            <p className="mb-1.5 text-xs font-semibold text-secondary">Your upload workspace</p>
            <h2 ref={headingRef} tabIndex={-1} className="font-heading text-xl font-semibold leading-7 outline-none sm:text-2xl">{selectedSchool.name}</h2>
            <p className="mt-1.5 text-xs leading-5 text-muted-foreground">Choose a folder, then add your next story.</p>
          </div>
          <span className="hidden items-center gap-2 rounded-full bg-secondary/5 px-3 py-2 text-xs font-medium text-secondary min-[1400px]:flex"><FolderOpen className="size-4" aria-hidden="true" />Everything in its place</span>
        </div>
      </div>}
      {visitedSchools.map((schoolId) => (
        <div key={schoolId} hidden={selectedSchoolId !== schoolId} data-school={schoolId}>
          <SchoolUploadWorkspace schoolId={schoolId} active={selectedSchoolId === schoolId} />
        </div>
      ))}
    </>
  )
}
