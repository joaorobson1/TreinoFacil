/**
 * Gera um par de chaves VAPID (Web Push) sem dependências externas.
 * Uso: `node scripts/gen-vapid.mjs`
 *
 * - A chave PÚBLICA vai em NEXT_PUBLIC_VAPID_PUBLIC_KEY (.env.local).
 * - A chave PRIVADA vira segredo da Edge Function (VAPID_PRIVATE_KEY).
 *   NUNCA coloque a privada em variável NEXT_PUBLIC_.
 */
import { generateKeyPairSync } from "node:crypto";

const { privateKey } = generateKeyPairSync("ec", { namedCurve: "prime256v1" });
const jwk = privateKey.export({ format: "jwk" });

const x = Buffer.from(jwk.x, "base64url");
const y = Buffer.from(jwk.y, "base64url");
const publicKey = Buffer.concat([Buffer.from([0x04]), x, y]).toString("base64url");
const privateKeyB64 = jwk.d; // já em base64url

console.log("VAPID keys geradas:\n");
console.log("Pública (NEXT_PUBLIC_VAPID_PUBLIC_KEY):");
console.log(publicKey, "\n");
console.log("Privada (segredo VAPID_PRIVATE_KEY da Edge Function):");
console.log(privateKeyB64, "\n");
console.log("→ ponha a pública no .env.local e a privada como segredo (nunca no cliente).");
