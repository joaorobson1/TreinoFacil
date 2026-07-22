"use server";

import { createClient } from "@/infrastructure/supabase/server";
import { createAdminClient } from "@/infrastructure/supabase/admin";
import { type Result, ok, err } from "@/core/shared/result";
import type { MediaType } from "@/core/domain/enums";

const MAX_BYTES = 52_428_800; // 50 MB

/**
 * Envia um arquivo de mídia de exercício ao Storage e retorna a URL pública.
 * O upload usa service role (ignora RLS do storage), então validamos o admin aqui.
 */
export async function uploadExerciseMediaAction(
  formData: FormData,
): Promise<Result<{ url: string; type: MediaType }>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return err("Sessão expirada.");

  const { data: me } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();
  if (me?.role !== "admin") return err("Apenas administradores.");

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return err("Arquivo inválido.");
  if (file.size > MAX_BYTES) return err("Arquivo muito grande (máx. 50 MB).");

  const mime = file.type;
  let type: MediaType;
  if (mime === "image/gif") type = "gif";
  else if (mime.startsWith("image/")) type = "image";
  else if (mime.startsWith("video/")) type = "video";
  else return err("Tipo não suportado (use imagem, GIF ou vídeo).");

  const ext = (file.name.split(".").pop() || "bin").toLowerCase().replace(/[^a-z0-9]/g, "");
  const path = `exercises/${crypto.randomUUID()}.${ext}`;

  const admin = createAdminClient();
  const { error } = await admin.storage
    .from("exercise-media")
    .upload(path, file, { contentType: mime, upsert: false });
  if (error) return err("Falha no upload.");

  const { data } = admin.storage.from("exercise-media").getPublicUrl(path);
  return ok({ url: data.publicUrl, type });
}
