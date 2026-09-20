import "server-only";

import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function requireAdmin(request: Request) {
  const authorization = request.headers.get("authorization") ?? "";
  const token = authorization.startsWith("Bearer ") ? authorization.slice(7).trim() : "";
  if (!token) throw new Error("UNAUTHORIZED");

  const adminUserId = process.env.ADMIN_USER_ID;
  if (!adminUserId) throw new Error("ADMIN_NOT_CONFIGURED");

  const { data, error } = await getSupabaseAdmin().auth.getUser(token);
  if (error || !data.user || data.user.id !== adminUserId) throw new Error("FORBIDDEN");
  return data.user;
}

export function adminErrorResponse(error: unknown): Response | null {
  const message = error instanceof Error ? error.message : "";
  if (message === "UNAUTHORIZED") {
    return Response.json({ error: "Iniciá sesión nuevamente." }, { status: 401 });
  }
  if (message === "FORBIDDEN") {
    return Response.json({ error: "No tenés permisos de administración." }, { status: 403 });
  }
  if (message === "ADMIN_NOT_CONFIGURED") {
    return Response.json({ error: "La administración no está configurada." }, { status: 503 });
  }
  return null;
}
