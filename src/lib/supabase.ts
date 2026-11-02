import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Validates whether actual Supabase credentials are provided
export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    !supabaseUrl.includes('your-project') &&
    !supabaseAnonKey.includes('your-anon-key') &&
    supabaseUrl.startsWith('https://')
  );
};

// Initialize Supabase Client
// Fallback to placeholder URL to avoid build errors if env is not yet populated
export const supabase = createClient(
  isSupabaseConfigured() ? supabaseUrl : 'https://placeholder-url.supabase.co',
  isSupabaseConfigured() ? supabaseAnonKey : 'placeholder-anon-key'
);

/**
 * Uploads a file (product image or payment proof) to Supabase Storage bucket 'gentina-media'.
 * If the bucket is not ready or Supabase is not configured, provides fallback to base64 DataURL.
 */
export async function uploadMediaFile(
  file: File, 
  folder: 'products' | 'proofs' = 'products'
): Promise<string> {
  if (!isSupabaseConfigured()) {
    // Graceful fallback to DataURL so uploading is testable immediately
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  }

  const fileExt = file.name.split('.').pop() || 'jpg';
  const cleanFileName = file.name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
  const filePath = `${folder}/${Date.now()}_${cleanFileName}.${fileExt}`;

  try {
    const { error: uploadError } = await supabase.storage
      .from('gentina-media')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) {
      console.warn('Storage upload error, falling back to DataURL:', uploadError.message);
      // Fallback to DataURL if bucket is not created or permissions are pending
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
    }

    const { data } = supabase.storage
      .from('gentina-media')
      .getPublicUrl(filePath);

    return data.publicUrl;
  } catch (err) {
    console.error('Upload exception:', err);
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });
  }
}
