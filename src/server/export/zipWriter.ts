export type ZipEntry = {
  content: string | Uint8Array;
  path: string;
};

const textEncoder = new TextEncoder();
const crcTable = new Uint32Array(256);

for (let i = 0; i < 256; i += 1) {
  let crc = i;

  for (let bit = 0; bit < 8; bit += 1) {
    crc = crc & 1 ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1;
  }

  crcTable[i] = crc >>> 0;
}

function encodeContent(content: string | Uint8Array): Uint8Array {
  return typeof content === "string" ? textEncoder.encode(content) : content;
}

function normalizeZipPath(path: string): string {
  const normalizedPath = path.trim().replaceAll("\\", "/").replace(/\/+/g, "/");

  if (
    !normalizedPath ||
    normalizedPath.startsWith("/") ||
    normalizedPath.startsWith("../") ||
    normalizedPath.includes("/../") ||
    /^[a-z]:/i.test(normalizedPath)
  ) {
    throw new Error(`Export zip path is not allowed: ${path}`);
  }

  return normalizedPath;
}

function calculateCrc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;

  bytes.forEach((byte) => {
    crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  });

  return (crc ^ 0xffffffff) >>> 0;
}

function writeLocalHeader(input: {
  contentBytes: Uint8Array;
  crc32: number;
  nameBytes: Uint8Array;
}): Buffer {
  const header = Buffer.alloc(30);

  header.writeUInt32LE(0x04034b50, 0);
  header.writeUInt16LE(20, 4);
  header.writeUInt16LE(0, 6);
  header.writeUInt16LE(0, 8);
  header.writeUInt16LE(0, 10);
  header.writeUInt16LE(0, 12);
  header.writeUInt32LE(input.crc32, 14);
  header.writeUInt32LE(input.contentBytes.byteLength, 18);
  header.writeUInt32LE(input.contentBytes.byteLength, 22);
  header.writeUInt16LE(input.nameBytes.byteLength, 26);
  header.writeUInt16LE(0, 28);

  return header;
}

function writeCentralDirectoryHeader(input: {
  contentBytes: Uint8Array;
  crc32: number;
  localHeaderOffset: number;
  nameBytes: Uint8Array;
}): Buffer {
  const header = Buffer.alloc(46);

  header.writeUInt32LE(0x02014b50, 0);
  header.writeUInt16LE(20, 4);
  header.writeUInt16LE(20, 6);
  header.writeUInt16LE(0, 8);
  header.writeUInt16LE(0, 10);
  header.writeUInt16LE(0, 12);
  header.writeUInt16LE(0, 14);
  header.writeUInt32LE(input.crc32, 16);
  header.writeUInt32LE(input.contentBytes.byteLength, 20);
  header.writeUInt32LE(input.contentBytes.byteLength, 24);
  header.writeUInt16LE(input.nameBytes.byteLength, 28);
  header.writeUInt16LE(0, 30);
  header.writeUInt16LE(0, 32);
  header.writeUInt16LE(0, 34);
  header.writeUInt16LE(0, 36);
  header.writeUInt32LE(0, 38);
  header.writeUInt32LE(input.localHeaderOffset, 42);

  return header;
}

function writeEndOfCentralDirectory(input: {
  centralDirectoryOffset: number;
  centralDirectorySize: number;
  entryCount: number;
}): Buffer {
  const footer = Buffer.alloc(22);

  footer.writeUInt32LE(0x06054b50, 0);
  footer.writeUInt16LE(0, 4);
  footer.writeUInt16LE(0, 6);
  footer.writeUInt16LE(input.entryCount, 8);
  footer.writeUInt16LE(input.entryCount, 10);
  footer.writeUInt32LE(input.centralDirectorySize, 12);
  footer.writeUInt32LE(input.centralDirectoryOffset, 16);
  footer.writeUInt16LE(0, 20);

  return footer;
}

export function createZipArchive(entries: ZipEntry[]): Uint8Array {
  const seenPaths = new Set<string>();
  const fileParts: Buffer[] = [];
  const centralDirectoryParts: Buffer[] = [];
  let offset = 0;

  entries.forEach((entry) => {
    const path = normalizeZipPath(entry.path);

    if (seenPaths.has(path)) {
      throw new Error(`Export zip path is duplicated: ${path}`);
    }

    seenPaths.add(path);

    const nameBytes = textEncoder.encode(path);
    const contentBytes = encodeContent(entry.content);
    const crc32 = calculateCrc32(contentBytes);
    const localHeader = writeLocalHeader({ contentBytes, crc32, nameBytes });

    fileParts.push(localHeader, Buffer.from(nameBytes), Buffer.from(contentBytes));
    centralDirectoryParts.push(
      writeCentralDirectoryHeader({
        contentBytes,
        crc32,
        localHeaderOffset: offset,
        nameBytes
      }),
      Buffer.from(nameBytes)
    );
    offset += localHeader.byteLength + nameBytes.byteLength + contentBytes.byteLength;
  });

  const centralDirectoryOffset = offset;
  const centralDirectory = Buffer.concat(centralDirectoryParts);
  const endOfCentralDirectory = writeEndOfCentralDirectory({
    centralDirectoryOffset,
    centralDirectorySize: centralDirectory.byteLength,
    entryCount: entries.length
  });

  return Buffer.concat([...fileParts, centralDirectory, endOfCentralDirectory]);
}
