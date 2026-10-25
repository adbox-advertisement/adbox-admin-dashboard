export type VideoSources = { hlsUrl: string | null; mp4Url: string | null }

// Safari (and iOS) play HLS natively; Chrome, Edge and Firefox do not, so
// they get the original MP4 upload when the backend says it is playable.
export function canPlayHlsNatively(probe: Pick<HTMLVideoElement, "canPlayType"> = document.createElement("video")) {
  return probe.canPlayType("application/vnd.apple.mpegurl") !== ""
}

export function playbackOrder({ hlsUrl, mp4Url }: VideoSources, nativeHls: boolean) {
  const order = nativeHls ? [hlsUrl, mp4Url] : [mp4Url]
  return order.filter((url): url is string => Boolean(url))
}
