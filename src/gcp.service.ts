import { Injectable } from '@nestjs/common';
import { Storage } from '@google-cloud/storage';

@Injectable()
export class GcpService {
  private storage: Storage;
  private bucketName = process.env.GCP_BUCKET_NAME || 'glassnik'; 

  constructor() {
    this.storage = new Storage({
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS || './glassnik-7d5600b7230e.json', 
    });
  }

  async uploadFile(filename: string, content: string): Promise<string> {
    const bucket = this.storage.bucket(this.bucketName);
    const file = bucket.file(filename);

    await file.save(content);

    return `https://storage.googleapis.com/${this.bucketName}/${filename}`;
  }

  async getSignedUploadUrl(
    gcsPath: string,
    mimeType: string,
    expiresInMinutes = 15,
  ): Promise<string> {
    const bucket = this.storage.bucket(this.bucketName);
    const file = bucket.file(gcsPath);

    const [url] = await file.getSignedUrl({
      version: 'v4',
      action: 'write',
      expires: Date.now() + expiresInMinutes * 60 * 1000,
      contentType: mimeType,
    });

    return url;
  }

  getPublicUrl(gcsPath: string): string {
    return `https://storage.googleapis.com/${this.bucketName}/${gcsPath}`;
  }
}