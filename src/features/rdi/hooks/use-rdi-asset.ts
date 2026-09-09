import { useMutation } from "@tanstack/react-query"
import { uploadRdiAsset } from "../api/cms-api"
import type { RdiMedia } from "../types"

export function useRdiAssetUpload() {
  return useMutation({
    mutationFn: ({ file, type, alt }: { file: File; type: RdiMedia["type"]; alt: string }) => uploadRdiAsset(file, type, alt),
  })
}
