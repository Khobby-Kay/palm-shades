export function isRemoteImageUrl(url: string): boolean {
  return url.startsWith("http://") || url.startsWith("https://");
}

export function shouldUseUnoptimizedImage(url: string): boolean {
  return !isRemoteImageUrl(url) && url.startsWith("/uploads/");
}
