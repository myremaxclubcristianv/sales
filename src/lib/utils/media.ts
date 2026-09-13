/**
 * Resolves a media file path to a full URL.
 * Supports both external durable URLs (e.g., https://...) and Supabase Storage paths.
 */
export function getMediaUrl(filePath: string | null | undefined): string {
  if (!filePath) return ''
  if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
    return filePath
  }
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  return `${baseUrl}/storage/v1/object/public/media/${filePath}`
}
