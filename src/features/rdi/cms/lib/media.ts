import type { CmsAsset, CmsDraft } from "../types"
export const imageSource = (value: string, assets: CmsAsset[]) => value.startsWith("asset:") ? assets.find(asset => `asset:${asset.id}` === value)?.src ?? "" : value
export const assetValue = (asset: CmsAsset) => asset.addedAt ? `asset:${asset.id}` : asset.src
export async function readImage(file: File): Promise<CmsAsset> {
  if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type))
    throw new Error("Choose a JPG, PNG, WebP, or GIF image.")
  if (file.size > 2 * 1024 * 1024)
    throw new Error("This image is larger than 2 MB. Choose a smaller image.")
  const bitmap = await createImageBitmap(file)
  const tooLarge = bitmap.width > 10000 || bitmap.height > 10000
  bitmap.close()
  if (tooLarge)
    throw new Error("Choose an image smaller than 10,000 pixels on each side.")
  const src = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => typeof reader.result === "string" ? resolve(reader.result) : reject(new Error("This image could not be read."))
    reader.onerror = () => reject(new Error("This image could not be read."))
    reader.readAsDataURL(file)
  })
  return { id: crypto.randomUUID(), name: file.name.slice(0, 200), src, alt: "", category: "Uploads", addedAt: new Date().toISOString() }
}
export function assertLibrarySpace(draft: CmsDraft, incoming: CmsAsset[]) {
  if (draft.assets.length + incoming.length > 50)
    throw new Error("Your local library is full. Remove an unused uploaded image to make space.")
  if (JSON.stringify({ ...draft, assets: [...incoming, ...draft.assets] }).length * 2 > 4 * 1024 * 1024) {
    throw new Error("Your local library is full. Remove an unused image or choose a smaller file.")
  }
}
