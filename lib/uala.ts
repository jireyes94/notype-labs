import "server-only";

export type UalaEnvironment = "test" | "production";

type UalaAccessTokenResponse = {
  access_token: string;
  expires_in: number;
  token_type: string;
};

export type CreateUalaCheckoutInput = {
  amountCents: number;
  description: string;
  notificationUrl: string;
  callbackFail: string;
  callbackSuccess: string;
  externalReference: string;
};

export type UalaCheckoutResponse = {
  uuid: string;
  amount: number;
  status: string;
  external_reference: string;
  links: {
    checkout_link: string;
    success: string;
    failed: string;
  };
};

export type UalaOrderStatus =
  | "PENDING"
  | "PROCESSED"
  | "APPROVED"
  | "REJECTED"
  | "REFUNDED";

export type UalaOrderResponse = {
  uuid: string;
  amount: number;
  status: UalaOrderStatus;
  external_reference: string;
  created_date?: string;
  updated_date?: string;
};

type CachedToken = {
  accessToken: string;
  expiresAt: number;
};

let cachedToken: CachedToken | null = null;

const UALA_URLS = {
  test: {
    auth: "https://auth.stage.developers.ar.ua.la/v2/api",
    checkout: "https://checkout.stage.developers.ar.ua.la/v2/api",
  },
  production: {
    auth: "https://auth.developers.ar.ua.la/v2/api",
    checkout: "https://checkout.developers.ar.ua.la/v2/api",
  },
} as const;

function requireServerEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required server environment variable: ${name}`);
  }

  return value;
}

function getEnvironment(): UalaEnvironment {
  const environment = requireServerEnv("UALA_ENVIRONMENT");

  if (environment !== "test" && environment !== "production") {
    throw new Error('UALA_ENVIRONMENT must be either "test" or "production"');
  }

  return environment;
}

async function readProviderError(response: Response): Promise<string> {
  const fallback = `Ualá API request failed with status ${response.status}`;

  try {
    const body = (await response.json()) as {
      message?: string;
      errors?: string[];
    };

    const details = [body.message, ...(body.errors ?? [])]
      .filter(Boolean)
      .join(" ");

    return details || fallback;
  } catch {
    return fallback;
  }
}

export async function getUalaAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) {
    return cachedToken.accessToken;
  }

  const environment = getEnvironment();
  const response = await fetch(`${UALA_URLS[environment].auth}/auth/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      username: requireServerEnv("UALA_USERNAME"),
      client_id: requireServerEnv("UALA_CLIENT_ID"),
      client_secret_id: requireServerEnv("UALA_CLIENT_SECRET_ID"),
      grant_type: "client_credentials",
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(await readProviderError(response));
  }

  const token = (await response.json()) as UalaAccessTokenResponse;

  if (!token.access_token || !Number.isFinite(token.expires_in)) {
    throw new Error("Ualá returned an invalid access token response");
  }

  cachedToken = {
    accessToken: token.access_token,
    expiresAt: Date.now() + token.expires_in * 1000,
  };

  return cachedToken.accessToken;
}

export async function createUalaCheckout(
  input: CreateUalaCheckoutInput,
): Promise<UalaCheckoutResponse> {
  if (!Number.isSafeInteger(input.amountCents) || input.amountCents <= 0) {
    throw new Error("amountCents must be a positive integer");
  }

  const environment = getEnvironment();
  const accessToken = await getUalaAccessToken();
  const response = await fetch(
    `${UALA_URLS[environment].checkout}/checkout`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        amount: String(input.amountCents),
        description: input.description,
        notification_url: input.notificationUrl,
        callback_fail: input.callbackFail,
        callback_success: input.callbackSuccess,
        external_reference: input.externalReference,
      }),
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(await readProviderError(response));
  }

  const checkout = (await response.json()) as UalaCheckoutResponse;

  if (
    !checkout.uuid ||
    !checkout.links?.checkout_link ||
    checkout.external_reference !== input.externalReference
  ) {
    throw new Error("Ualá returned an invalid checkout response");
  }

  return checkout;
}

export async function getUalaOrder(uuid: string): Promise<UalaOrderResponse> {
  if (!/^[0-9a-f-]{36}$/i.test(uuid)) {
    throw new Error("Invalid Ualá order UUID");
  }

  const environment = getEnvironment();
  const accessToken = await getUalaAccessToken();
  const response = await fetch(
    `${UALA_URLS[environment].checkout}/orders/${encodeURIComponent(uuid)}`,
    {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(await readProviderError(response));
  }

  const order = (await response.json()) as UalaOrderResponse;
  if (
    order.uuid !== uuid ||
    !Number.isSafeInteger(order.amount) ||
    !["PENDING", "PROCESSED", "APPROVED", "REJECTED", "REFUNDED"].includes(order.status)
  ) {
    throw new Error("Ualá returned an invalid order response");
  }

  return order;
}
