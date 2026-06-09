import { mkdirSync, writeFileSync } from "node:fs";
import { deflateSync } from "node:zlib";

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function generateIcon(size) {
  const bg = { r: 28, g: 25, b: 23 };
  const gold = { r: 217, g: 119, b: 6 };
  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.35;
  const stroke = Math.max(2, Math.round(size * 0.04));

  const rowSize = 1 + size * 4;
  const raw = Buffer.alloc(rowSize * size);

  for (let y = 0; y < size; y++) {
    const rowStart = y * rowSize;
    raw[rowStart] = 0;
    for (let x = 0; x < size; x++) {
      const i = rowStart + 1 + x * 4;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const onRing =
        dist >= radius - stroke && dist <= radius + stroke;
      const inM =
        y >= cy - size * 0.18 &&
        y <= cy + size * 0.2 &&
        ((x >= cx - size * 0.2 && x <= cx - size * 0.12) ||
          (x >= cx + size * 0.12 && x <= cx + size * 0.2) ||
          (x >= cx - size * 0.04 && x <= cx + size * 0.04 &&
            y <= cy + size * 0.02));

      const color = onRing || inM ? gold : bg;
      raw[i] = color.r;
      raw[i + 1] = color.g;
      raw[i + 2] = color.b;
      raw[i + 3] = 255;
    }
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const idat = deflateSync(raw);
  return Buffer.concat([
    signature,
    chunk("IHDR", ihdr),
    chunk("IDAT", idat),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

mkdirSync("public/icons", { recursive: true });
writeFileSync("public/icons/icon-192.png", generateIcon(192));
writeFileSync("public/icons/icon-512.png", generateIcon(512));
console.log("Icons generated!");
