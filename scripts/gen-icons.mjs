/**
 * Gera favicon + ícones PWA + a logo da home a partir de movra.png.
 * - Ícones (favicon/apple/manifest): recorta só o monograma "M" e centraliza
 *   num quadrado preto (o lockup completo fica ilegível em tamanhos pequenos).
 * - Home: logo completa aparada e centralizada num quadrado preto.
 * A marca foi desenhada sobre fundo preto, então tudo é composto sobre BRAND_BLACK
 * — o mesmo valor usado em background_color no manifest, para a splash não piscar.
 * Uso: `node scripts/gen-icons.mjs`
 */
import { readFileSync, writeFileSync } from "node:fs";
import sharp from "sharp";

const SRC = "movra.png";
/** Preto do arquivo da marca (rgb 1,3,8) — mantém o recorte sem emenda visível. */
const BRAND_BLACK = { r: 1, g: 3, b: 8, alpha: 1 };

// Região do monograma (M + braço + speed lines), sem a wordmark/tagline abaixo.
// Content bbox medido por varredura de luminância: x 242-964, y 362-725.
const MONO = { left: 242, top: 362, width: 723, height: 364 };

/** Apara o fundo e devolve um buffer PNG quadrado (conteúdo centralizado + margem). */
async function squareOnBlack(input, { pad = 0.1 } = {}) {
  const trimmed = await sharp(input).trim({ threshold: 12 }).png().toBuffer();
  const { width, height } = await sharp(trimmed).metadata();
  const side = Math.round(Math.max(width, height) * (1 + pad * 2));
  return sharp({
    create: { width: side, height: side, channels: 4, background: BRAND_BLACK },
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
  const mono = () => sharp(readFileSync(SRC)).extract(MONO).png().toBuffer();

  // O monograma é largo (~2:1); margem menor que a da marca antiga para o "M"
  // não encolher demais dentro do quadrado.
  const monogram = await squareOnBlack(await mono(), { pad: 0.08 });

  // favicon (Next: src/app/icon.png) + favicon.ico legado
  await sharp(monogram).resize(512, 512).png().toFile("src/app/icon.png");
  const ico32 = await sharp(monogram).resize(48, 48).png().toBuffer();
  writeFileSync("src/app/favicon.ico", pngToIco(ico32, 48));

  // Apple touch icon — iOS arredonda; um pouco mais de respiro
  const appleBg = await squareOnBlack(await mono(), { pad: 0.14 });
  await sharp(appleBg).resize(180, 180).png().toFile("src/app/apple-icon.png");

  // Ícones do manifest (PWA)
  await sharp(monogram).resize(192, 192).png().toFile("public/icon-192.png");
  await sharp(monogram).resize(512, 512).png().toFile("public/icon-512.png");

  // Ícones maskable (Android/TWA): o launcher recorta em círculo/squircle, então
  // o conteúdo precisa caber na "safe zone" central (~80%). Margem maior garante
  // que o monograma nunca seja cortado; o fundo preto preenche os cantos.
  const maskable = await squareOnBlack(await mono(), { pad: 0.32 });
  await sharp(maskable).resize(192, 192).png().toFile("public/icon-192-maskable.png");
  await sharp(maskable).resize(512, 512).png().toFile("public/icon-512-maskable.png");

  // Logo completa (monograma + wordmark + tagline) para a home
  const fullLogo = await squareOnBlack(readFileSync(SRC), { pad: 0.06 });
  await sharp(fullLogo).resize(512, 512).png().toFile("public/movra.png");

  console.log("✓ ícones gerados: icon.png, apple-icon.png, favicon.ico, icon-192/512, icon-192/512-maskable, movra.png");
}

main().catch((e) => { console.error(e); process.exit(1); });
