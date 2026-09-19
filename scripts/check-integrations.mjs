import { createClient } from "@supabase/supabase-js";

function requireEnv(name) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Falta la variable ${name}`);
  }

  return value;
}

async function checkSupabase() {
  const client = createClient(
    requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
    {
      auth: {
        autoRefreshToken: false,
        detectSessionInUrl: false,
        persistSession: false,
      },
    },
  );

  const { count, error } = await client
    .from("orders")
    .select("*", { count: "exact", head: true });

  if (error) {
    throw new Error(`Supabase service role: ${error.message}`);
  }

  console.log(`✓ Supabase service role conectado (orders: ${count ?? 0})`);
}

async function checkUala() {
  const environment = requireEnv("UALA_ENVIRONMENT");

  if (environment !== "test") {
    throw new Error(
      "El chequeo local solo permite UALA_ENVIRONMENT=test para evitar operaciones productivas.",
    );
  }

  const response = await fetch(
    "https://auth.stage.developers.ar.ua.la/v2/api/auth/token",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        username: requireEnv("UALA_USERNAME"),
        client_id: requireEnv("UALA_CLIENT_ID"),
        client_secret_id: requireEnv("UALA_CLIENT_SECRET_ID"),
        grant_type: "client_credentials",
      }),
    },
  );

  if (!response.ok) {
    let message = `HTTP ${response.status}`;

    try {
      const body = await response.json();
      message = body.message ?? message;
    } catch {
      // Never print credentials or raw request data.
    }

    throw new Error(`Ualá v2 test: ${message}`);
  }

  const token = await response.json();

  if (!token.access_token || !token.expires_in) {
    throw new Error("Ualá v2 test devolvió una respuesta de token inválida");
  }

  console.log(
    `✓ Ualá v2 test autenticado (token válido por ${token.expires_in} segundos)`,
  );
}

try {
  const downloadSecret = requireEnv("DOWNLOAD_TOKEN_SECRET");
  if (downloadSecret.length < 32) {
    throw new Error("DOWNLOAD_TOKEN_SECRET debe contener al menos 32 caracteres");
  }
  console.log("✓ Secreto de descargas configurado");
  await checkSupabase();
  await checkUala();
  console.log("✓ Integraciones privadas verificadas sin crear órdenes ni pagos");
} catch (error) {
  console.error(
    `✗ ${error instanceof Error ? error.message : "Error desconocido"}`,
  );
  process.exitCode = 1;
}
