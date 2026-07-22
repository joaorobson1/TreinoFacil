/**
 * Gera favicon + ícones PWA + a logo da home a partir de logotreinofacil.png.
 * - Ícones (favicon/apple/manifest): recorta só o monograma "TF" e centraliza
 *   num quadrado branco (o lockup completo fica ilegível em tamanhos pequenos).
 * - Home: logo completa aparada e centralizada num quadrado branco.
 * Uso: `node scripts/gen-icons.mjs`
 */
import { readFileSync, writeFileSync } from "node:fs";
import sharp from "sharp";

const SRC = "logotreinofacil.png";
const WHITE = { r: 255, g: 255, b: 255, alpha: 1 };

// Região do monograma (frame + TF), sem a wordmark/slogan abaixo.
// Content bbox medido via trim: offset (163,202), 955x817.
const MONO = { left: 163, top: 202, width: 955, height: 600 };

/** Apara o branco e devolve um buffer PNG quadrado (conteúdo centralizado + margem). */
async function squareOnWhite(input, { pad = 0.1 } = {}) {
  const trimmed = await sharp(input).trim({ threshold: 10 }).png().toBuffer();
  const { width, height } = await sharp(trimmed).metadata();
  const side = Math.round(Math.max(width, height) * (1 + pad * 2));
  return sharp({
    create: { width: side, height: side, channels: 4, background: WHITE },
  })
    .composite([{ input: trimmed, gravity: "center" }])
    .png()
    .toBuffer();
}

/** Empacota um PNG num container .ico de 1 entrada (ICO aceita PNG desde o Vista). */
function pngToIco(pngBuf, size) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type = icon
  header.writeUInt16LE(1, 4); // count
  const entry = Buffer.alloc(16);
  entry.writeUInt8(size >= 256 ? 0 : size, 0); // width (0 = 256)
  entry.writeUInt8(size >= 256 ? 0 : size, 1); // height
  entry.writeUInt8(0, 2); // palette
  entry.writeUInt8(0, 3); // reserved
  entry.writeUInt16LE(1, 4); // color planes
  entry.writeUInt16LE(32, 6); // bits per pixel
  entry.writeUInt32LE(pngBuf.length, 8); // size
  entry.writeUInt32LE(22, 12); // offset (6 + 16)
  return Buffer.concat([header, entry, pngBuf]);
}

async function main() {
  const monogram = await squareOnWhite(
    await sharp(readFileSync(SRC)).extract(MONO).png().toBuffer(),
    { pad: 0.12 },
  );

  // favicon (Next: src/app/icon.png) + favicon.ico legado
  await sharp(monogram).resize(512, 512).png().toFile("src/app/icon.png");
  const ico32 = await sharp(monogram).resize(48, 48).png().toBuffer();
  writeFileSync("src/app/favicon.ico", pngToIco(ico32, 48));

  // Apple touch icon — iOS arredonda; um pouco mais de respiro
  const appleBg = await squareOnWhite(
    await sharp(readFileSync(SRC)).extract(MONO).png().toBuffer(),
    { pad: 0.18 },
  );
  await sharp(appleBg).resize(180, 180).png().toFile("src/app/apple-icon.png");

  // Ícones do manifest (PWA)
  await sharp(monogram).resize(192, 192).png().toFile("public/icon-192.png");
  await sharp(monogram).resize(512, 512).png().toFile("public/icon-512.png");

  // Logo completa para a home
  const fullLogo = await squareOnWhite(readFileSync(SRC), { pad: 0.06 });
  await sharp(fullLogo).resize(512, 512).png().toFile("public/logotreinofacil.png");

  console.log("✓ ícones gerados: icon.png, apple-icon.png, favicon.ico, icon-192/512, logotreinofacil.png");
}

main().catch((e) => { console.error(e); process.exit(1); });
