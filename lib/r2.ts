import "server-only";

import { S3Client } from "@aws-sdk/client-s3";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name}`);
  return value;
}

let client: S3Client | undefined;
let adminClient: S3Client | undefined;

export function getR2Client(): S3Client {
  client ??= new S3Client({
    region: "auto",
    endpoint: `https://${requireEnv("R2_ACCOUNT_ID")}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: requireEnv("R2_ACCESS_KEY_ID"),
      secretAccessKey: requireEnv("R2_SECRET_ACCESS_KEY"),
    },
  });
  return client;
}

export function getR2Bucket(): string {
  return requireEnv("R2_BUCKET_NAME");
}

export function getR2AdminClient(): S3Client {
  adminClient ??= new S3Client({
    region: "auto",
    endpoint: `https://${requireEnv("R2_ACCOUNT_ID")}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: requireEnv("R2_ADMIN_ACCESS_KEY_ID"),
      secretAccessKey: requireEnv("R2_ADMIN_SECRET_ACCESS_KEY"),
    },
  });
  return adminClient;
}
