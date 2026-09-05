/**
 * Supabase Client & Storage Provider Helper
 * Configured for Supabase Auth, PostgreSQL, and Storage (KYC Docs & Crop Media)
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "";

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (supabaseInstance) return supabaseInstance;
  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }
  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  return supabaseInstance;
}

/**
 * Storage upload helper for Crop Media & KYC documents
 * Works with Supabase Storage Bucket ("nam-documents", "nam-crop-images")
 */
export async function uploadToStorage(
  bucket: "nam-documents" | "nam-crop-images",
  filePath: string,
  file: File | Blob
): Promise<string | null> {
  const client = getSupabaseClient();
  if (!client) {
    console.warn("Supabase not configured. Using local / fallback mock storage.");
    return null;
  }

  const { data, error } = await client.storage.from(bucket).upload(filePath, file, {
    upsert: true,
  });

  if (error) {
    console.error("Storage upload error:", error);
    return null;
  }

  const { data: publicUrlData } = client.storage.from(bucket).getPublicUrl(data.path);
  return publicUrlData.publicUrl;
}
