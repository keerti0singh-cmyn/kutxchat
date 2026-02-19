import { createClient } from '@/lib/supabase'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

export async function uploadFile(
  file: File,
  bucket: 'avatars' | 'stories' | 'attachments'
): Promise<string | null> {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('File size must be less than 5MB')
  }

  const supabase = createClient()
  const fileExt = file.name.split('.').pop()
  const fileName = `${Date.now()}.${fileExt}`
  const filePath = `${fileName}`

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(filePath, file)

  if (uploadError) {
    throw uploadError
  }

  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath)

  return publicUrl
}

export function validateFileType(file: File, allowedTypes: string[]): boolean {
  return allowedTypes.includes(file.type)
}
