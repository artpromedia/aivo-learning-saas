import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import { getConfig } from "../config.js";

export interface S3Client {
  uploadExport(key: string, data: Buffer, contentType: string): Promise<string>;
  getSignedUrl(key: string, expiresInSeconds: number): Promise<string>;
  uploadDocument(key: string, data: Buffer, contentType: string): Promise<string>;
}

declare module "fastify" {
  interface FastifyInstance {
    s3: S3Client;
  }
}

export default fp(async (fastify: FastifyInstance) => {
  const config = getConfig();

  const s3Client: S3Client = {
    async uploadExport(key, data, contentType) {
      const url = `https://${config.S3_BUCKET}.s3.${config.S3_REGION}.amazonaws.com/${key}`;
      const res = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": contentType },
        body: data,
      });
      if (!res.ok) throw new Error(`S3 upload failed: ${res.status}`);
      return url;
    },
    async getSignedUrl(key, expiresInSeconds) {
      const expiry = new Date(Date.now() + expiresInSeconds * 1000).toISOString();
      return `https://${config.S3_BUCKET}.s3.${config.S3_REGION}.amazonaws.com/${key}?expires=${expiry}`;
    },
    async uploadDocument(key, data, contentType) {
      return this.uploadExport(key, data, contentType);
    },
  };

  fastify.decorate("s3", s3Client);
});
