import { randomUUID } from "node:crypto";
import { mkdir, writeFile, readFile, unlink } from "node:fs/promises";
import { join } from "node:path";
import { getConfig } from "../config.js";

export interface StoredFile {
  key: string;
  url: string;
  size: number;
}

export interface StorageBackend {
  upload(
    buffer: Buffer,
    filename: string,
    mimeType: string,
  ): Promise<StoredFile>;
  getUrl(key: string): string;
  getBuffer(key: string): Promise<Buffer>;
  remove(key: string): Promise<void>;
}

class LocalStorageBackend implements StorageBackend {
  private readonly baseDir: string;

  constructor() {
    this.baseDir = join(process.cwd(), "uploads", "homework");
  }

  async upload(
    buffer: Buffer,
    filename: string,
    mimeType: string,
  ): Promise<StoredFile> {
    await mkdir(this.baseDir, { recursive: true });
    const ext = filename.split(".").pop() ?? "bin";
    const key = `${randomUUID()}.${ext}`;
    const filePath = join(this.baseDir, key);
    await writeFile(filePath, buffer);
    return {
      key,
      url: `/uploads/homework/${key}`,
      size: buffer.length,
    };
  }

  getUrl(key: string): string {
    return `/uploads/homework/${key}`;
  }

  async getBuffer(key: string): Promise<Buffer> {
    return readFile(join(this.baseDir, key));
  }

  async remove(key: string): Promise<void> {
    try {
      await unlink(join(this.baseDir, key));
    } catch {
      // File may already be deleted
    }
  }
}

class S3StorageBackend implements StorageBackend {
  private readonly bucket: string;
  private readonly region: string;
  private readonly endpoint: string;

  constructor() {
    const config = getConfig();
    this.bucket = config.S3_BUCKET ?? "aivo-homework-uploads";
    this.region = config.S3_REGION ?? "us-east-1";
    this.endpoint = config.S3_ENDPOINT ?? "";
  }

  async upload(
    buffer: Buffer,
    filename: string,
    mimeType: string,
  ): Promise<StoredFile> {
    const ext = filename.split(".").pop() ?? "bin";
    const key = `homework/${randomUUID()}.${ext}`;

    const baseEndpoint = this.endpoint || `https://${this.bucket}.s3.${this.region}.amazonaws.com`;
    const url = `${baseEndpoint}/${key}`;

    const res = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": mimeType,
        "Content-Length": String(buffer.length),
      },
      body: buffer,
    });

    if (!res.ok) {
      throw new Error(`S3 upload failed: ${res.status} ${res.statusText}`);
    }

    return { key, url, size: buffer.length };
  }

  getUrl(key: string): string {
    const baseEndpoint = this.endpoint || `https://${this.bucket}.s3.${this.region}.amazonaws.com`;
    return `${baseEndpoint}/${key}`;
  }

  async getBuffer(key: string): Promise<Buffer> {
    const url = this.getUrl(key);
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`S3 download failed: ${res.status}`);
    }
    const arrayBuf = await res.arrayBuffer();
    return Buffer.from(arrayBuf);
  }

  async remove(key: string): Promise<void> {
    const url = this.getUrl(key);
    await fetch(url, { method: "DELETE" });
  }
}

let _backend: StorageBackend | null = null;

export function getStorageBackend(): StorageBackend {
  if (!_backend) {
    const config = getConfig();
    _backend =
      config.STORAGE_BACKEND === "s3"
        ? new S3StorageBackend()
        : new LocalStorageBackend();
  }
  return _backend;
}
