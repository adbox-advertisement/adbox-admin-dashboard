import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { InstitutionDirectory } from "../types"
import { InstitutionPicker } from "./InstitutionPicker"
import { ink } from "./tokens"

export type Place = { institutionId: string | null; campusId: string | null; hallId: string | null }

const NONE = "none"
// Radix reports "" when its hidden native select briefly lacks an option; no option here is empty.
const picked = (value: string) => (value === NONE ? null : value)

/** Institution, then one of its campuses, then (for groups) one of that campus's halls. */
export function PlaceFields({ directory, value, onChange, withHall = false }: {
  directory: InstitutionDirectory | undefined
  value: Place
  onChange: (place: Place) => void
  withHall?: boolean
}) {
  const institution = directory?.find((item) => item.id === value.institutionId)
  const campus = institution?.campuses.find((item) => item.id === value.campusId)
  const halls = campus?.halls.filter((hall) => hall.isActive) ?? []

  return <div className="flex flex-col gap-3">
    <div className="flex flex-col gap-1.5">
      <span className={`text-b3 font-semibold ${ink}`}>Institution</span>
      <InstitutionPicker directory={directory} value={value.institutionId} label="Institution" noneLabel="No institution"
        onChange={(institutionId) => onChange({ institutionId, campusId: null, hallId: null })} />
    </div>
    {institution && institution.campuses.length > 0 && <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <label className="flex flex-col gap-1.5">
        <span className={`text-b3 font-semibold ${ink}`}>Campus</span>
        <Select value={value.campusId ?? NONE} onValueChange={(campusId) => { if (campusId) onChange({ ...value, campusId: picked(campusId), hallId: null }) }}>
          <SelectTrigger aria-label="Campus" className="h-11 rounded-2xl"><SelectValue /></SelectTrigger>
          <SelectContent className="video-management-ui">
            <SelectItem value={NONE}>Any campus</SelectItem>
            {institution.campuses.map((item) => <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </label>
      {withHall && halls.length > 0 && <label className="flex flex-col gap-1.5">
        <span className={`text-b3 font-semibold ${ink}`}>Hall</span>
        <Select value={value.hallId ?? NONE} onValueChange={(hallId) => { if (hallId) onChange({ ...value, hallId: picked(hallId) }) }}>
          <SelectTrigger aria-label="Hall" className="h-11 rounded-2xl"><SelectValue /></SelectTrigger>
          <SelectContent className="video-management-ui">
            <SelectItem value={NONE}>No hall</SelectItem>
            {halls.map((hall) => <SelectItem key={hall.id} value={hall.id}>{hall.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </label>}
    </div>}
  </div>
}
