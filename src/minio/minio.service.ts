import { basename } from 'path';
import { Readable } from 'stream';

import {
  GetObjectCommand,
  ListObjectsV2Command,
  S3Client,
} from '@aws-sdk/client-s3';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';

import { settings } from 'src/config';

const DEFAULT_MINIO_REGION = 'us-east-1';

export interface MinioObjectReference {
  bucket?: string;
  objectKey?: string;
  path?: string;
  s3Path?: string;
}

export interface MinioObjectFile {
  bucket: string;
  objectKey: string;
  filename: string;
  content: Buffer;
  contentLength?: number;
  contentType?: string;
  eTag?: string;
}

export interface MinioObjectSummary {
  bucket: string;
  objectKey: string;
  path: string;
  filename: string;
  size?: number;
  eTag?: string;
  lastModified?: Date;
}

@Injectable()
export class MinioService {
  private readonly logger = new Logger(MinioService.name);
  private readonly client = new S3Client({
    endpoint: this.buildEndpoint(),
    region: DEFAULT_MINIO_REGION,
    forcePathStyle: settings.minio.s3.force_path_style,
    credentials: {
      accessKeyId: settings.minio.s3.access_key,
      secretAccessKey: settings.minio.s3.secret,
    },
  });

  parseObjectPath(
    rawPath: string
  ): Required<Pick<MinioObjectReference, 'bucket' | 'objectKey'>> {
    const normalizedPath = rawPath?.startsWith('s3://')
      ? rawPath.slice('s3://'.length)
      : rawPath;
    const firstSeparator = normalizedPath?.indexOf('/');

    if (
      !normalizedPath ||
      firstSeparator <= 0 ||
      firstSeparator === normalizedPath.length - 1
    ) {
      throw new BadRequestException(`Invalid MinIO object path: ${rawPath}`);
    }

    return {
      bucket: normalizedPath.slice(0, firstSeparator),
      objectKey: normalizedPath.slice(firstSeparator + 1),
    };
  }

  parseS3Path(
    s3Path: string
  ): Required<Pick<MinioObjectReference, 'bucket' | 'objectKey'>> {
    return this.parseObjectPath(s3Path);
  }

  normalizeObjectReference(
    reference: MinioObjectReference
  ): Required<Pick<MinioObjectReference, 'bucket' | 'objectKey'>> {
    if (reference.path) {
      return this.parseObjectPath(reference.path);
    }

    if (reference.s3Path) {
      return this.parseObjectPath(reference.s3Path);
    }

    if (!reference.bucket && reference.objectKey) {
      return this.parseObjectPath(reference.objectKey);
    }

    const bucket = reference.bucket;
    const objectKey = reference.objectKey;

    if (!bucket) {
      throw new BadRequestException('MinIO bucket is required');
    }

    if (!objectKey) {
      throw new BadRequestException('MinIO objectKey is required');
    }

    return {
      bucket,
      objectKey,
    };
  }

  async getObjectAsBuffer(
    reference: MinioObjectReference
  ): Promise<MinioObjectFile> {
    const { bucket, objectKey } = this.normalizeObjectReference(reference);

    try {
      const response = await this.client.send(
        new GetObjectCommand({
          Bucket: bucket,
          Key: objectKey,
        })
      );

      if (!response.Body) {
        throw new NotFoundException(
          `MinIO object ${bucket}/${objectKey} has no response body`
        );
      }

      return {
        bucket,
        objectKey,
        filename: this.resolveFilename(objectKey, response.ContentDisposition),
        content: await this.toBuffer(response.Body),
        contentLength: response.ContentLength,
        contentType: response.ContentType,
        eTag: response.ETag,
      };
    } catch (error) {
      this.logger.error(
        `Failed to get MinIO object ${bucket}/${objectKey}`,
        error
      );

      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      const code = (error as { name?: string })?.name;

      if (code === 'NoSuchKey' || code === 'NotFound') {
        throw new NotFoundException(
          `MinIO object ${bucket}/${objectKey} was not found`
        );
      }

      throw new InternalServerErrorException(
        `Failed to get MinIO object ${bucket}/${objectKey}`
      );
    }
  }

  async listObjects(
    reference: MinioObjectReference
  ): Promise<MinioObjectSummary[]> {
    const { bucket, objectKey } = this.normalizeObjectReference(reference);
    const prefix = objectKey.endsWith('/') ? objectKey : `${objectKey}/`;
    const objects: MinioObjectSummary[] = [];
    let continuationToken: string | undefined;

    try {
      do {
        const response = await this.client.send(
          new ListObjectsV2Command({
            Bucket: bucket,
            Prefix: prefix,
            ContinuationToken: continuationToken,
          })
        );

        for (const item of response.Contents || []) {
          if (!item.Key || item.Key.endsWith('/')) {
            continue;
          }

          objects.push({
            bucket,
            objectKey: item.Key,
            path: `${bucket}/${item.Key}`,
            filename: basename(item.Key),
            size: item.Size,
            eTag: item.ETag,
            lastModified: item.LastModified,
          });
        }

        continuationToken = response.IsTruncated
          ? response.NextContinuationToken
          : undefined;
      } while (continuationToken);

      return objects;
    } catch (error) {
      this.logger.error(
        `Failed to list MinIO objects under ${bucket}/${prefix}`,
        error
      );

      throw new InternalServerErrorException(
        `Failed to list MinIO objects under ${bucket}/${prefix}`
      );
    }
  }

  private buildEndpoint(): string {
    const host = settings.minio.s3.host;

    if (host.startsWith('http://') || host.startsWith('https://')) {
      return `${host}:${settings.minio.s3.port}`;
    }

    return `http://${host}:${settings.minio.s3.port}`;
  }

  private resolveFilename(
    objectKey: string,
    contentDisposition?: string
  ): string {
    const filenameMatch = contentDisposition?.match(
      /filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/i
    );
    const filename = filenameMatch?.[1] || filenameMatch?.[2];

    if (filename) {
      return decodeURIComponent(filename);
    }

    return basename(objectKey);
  }

  private async toBuffer(body: unknown): Promise<Buffer> {
    if (Buffer.isBuffer(body)) {
      return body;
    }

    if (body instanceof Uint8Array) {
      return Buffer.from(body);
    }

    if (
      typeof body === 'object' &&
      body !== null &&
      'transformToByteArray' in body &&
      typeof body.transformToByteArray === 'function'
    ) {
      const bytes = await body.transformToByteArray();
      return Buffer.from(bytes);
    }

    if (body instanceof Readable || this.isAsyncIterable(body)) {
      const chunks: Uint8Array[] = [];

      for await (const chunk of body as AsyncIterable<
        Uint8Array | Buffer | string
      >) {
        if (typeof chunk === 'string') {
          chunks.push(Uint8Array.from(Buffer.from(chunk)));
          continue;
        }

        if (Buffer.isBuffer(chunk)) {
          chunks.push(Uint8Array.from(chunk));
          continue;
        }

        chunks.push(Uint8Array.from(Buffer.from(chunk)));
      }

      return Buffer.concat(chunks);
    }

    throw new InternalServerErrorException(
      'Unsupported MinIO object body type'
    );
  }

  private isAsyncIterable(value: unknown): value is AsyncIterable<unknown> {
    return (
      typeof value === 'object' &&
      value !== null &&
      Symbol.asyncIterator in value &&
      typeof value[Symbol.asyncIterator] === 'function'
    );
  }
}
