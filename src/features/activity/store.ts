import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"

type ActivitySoundState = {
  soundEnabled: boolean
  setSoundEnabled: (soundEnabled: boolean) => void
}

/** A per-browser preference, like the theme: on unless the admin turns it off. */
export const useActivitySound = create<ActivitySoundState>()(
  persist(
    (set) => ({
      soundEnabled: true,
      setSoundEnabled: (soundEnabled) => set({ soundEnabled }),
    }),
    {
      name: "adbox-activity-sound",
      storage: createJSONStorage(() => window.localStorage),
      partialize: ({ soundEnabled }) => ({ soundEnabled }),
    },
  ),
)
