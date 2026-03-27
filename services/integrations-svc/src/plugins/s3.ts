import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getConfig } from "../config.js";

export interface S3Plugin {
  upload(key: string, body: Buffer | string, contentType: string): Promise<string>;
  getSignedDownloadUrl(key: string): Promise<string>;
}

declare module "fastify" {
  interface FastifyInstance {
    s3: S3Plugin;
  }
}

export default fp(async (fastify: FastifyInstance) => {
  const config = getConfig();
  const client = new S3Client({ region: config.AWS_REGION });
  const bucket = config.AWS_S3_BUCKET;

  const s3Plugin: S3Plugin = {
    async upload(key, body, contentType) {
      await client.send(new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
      }));
      return `s3://${bucket}/${key}`;
    },

    async getSignedDownloadUrl(key) {
      const command = new GetObjectCommand({ Bucket: bucket, Key: key });
      return getSignedUrl(client, command, { expiresIn: 3600 });
    },
  };

  fastify.decorate("s3", s3Plugin);
});
