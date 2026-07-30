import { NextResponse } from "next/server";

/**
 * Digital Asset Links do app Android (TWA).
 *
 * O Chrome/Play consulta https://SEU-DOMINIO/.well-known/assetlinks.json para
 * confirmar que o app Android pertence a este site — é o que remove a barra de
 * URL e deixa a experiência em tela cheia.
 *
 * Preencha as variáveis após gerar o pacote com o Bubblewrap:
 *   TWA_PACKAGE_NAME=com.seudominio.movra
 *   TWA_SHA256_FINGERPRINT=AA:BB:CC:...   (aceita vários, separados por vírgula —
 *     inclua a chave de upload E a de assinatura do Google Play)
 *
 * Sem fingerprint configurado, devolve uma lista vazia: o endpoint continua
 * válido (JSON), apenas não vincula nenhum app ainda.
 */
export const dynamic = "force-dynamic";

export function GET() {
  const pkg = process.env.TWA_PACKAGE_NAME?.trim();
  const fingerprints = (process.env.TWA_SHA256_FINGERPRINT ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (!pkg || fingerprints.length === 0) {
    return NextResponse.json([]);
  }

  return NextResponse.json([
    {
      relation: ["delegate_permission/common.handle_all_urls"],
      target: {
        namespace: "android_app",
        package_name: pkg,
        sha256_cert_fingerprints: fingerprints,
      },
    },
  ]);
}
