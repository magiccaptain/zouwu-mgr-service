import { Readable } from 'stream';

import { BadRequestException } from '@nestjs/common';

import { MinioService } from './minio.service';

describe('MinioService', () => {
  let service: MinioService;

  beforeEach(() => {
    service = new MinioService();
  });

  it('should parse s3 path', () => {
    expect(service.parseS3Path('s3://reports/daily/result.csv')).toEqual({
      bucket: 'reports',
      objectKey: 'daily/result.csv',
    });
  });

  it('should parse plain bucket path', () => {
    expect(
      service.parseObjectPath(
        'fund-acc-statement/2026-05-13/330200062400/report.xlsx'
      )
    ).toEqual({
      bucket: 'fund-acc-statement',
      objectKey: '2026-05-13/330200062400/report.xlsx',
    });
  });

  it('should normalize plain object path when bucket is omitted', () => {
    expect(
      service.normalizeObjectReference({
        objectKey: 'fund-acc-statement/2026-05-13/330200062400/report.xlsx',
      })
    ).toEqual({
      bucket: 'fund-acc-statement',
      objectKey: '2026-05-13/330200062400/report.xlsx',
    });
  });

  it('should reject invalid s3 path', () => {
    expect(() => service.parseObjectPath('reports')).toThrow(
      BadRequestException
    );
  });

  it('should list all files under nested directory', async () => {
    const sendSpy = jest
      .spyOn((service as any).client, 'send')
      .mockResolvedValueOnce({
        Contents: [
          {
            Key: '2026-05-13/330200062400/',
            Size: 0,
          },
          {
            Key: '2026-05-13/330200062400/report-1.xlsx',
            Size: 12,
            ETag: 'etag-1',
          },
        ],
        IsTruncated: true,
        NextContinuationToken: 'token-1',
      })
      .mockResolvedValueOnce({
        Contents: [
          {
            Key: '2026-05-13/330200062401/report-2.xlsx',
            Size: 18,
            ETag: 'etag-2',
          },
        ],
        IsTruncated: false,
      });

    await expect(
      service.listObjects({ path: 'fund-acc-statement/2026-05-13' })
    ).resolves.toEqual([
      {
        bucket: 'fund-acc-statement',
        objectKey: '2026-05-13/330200062400/report-1.xlsx',
        path: 'fund-acc-statement/2026-05-13/330200062400/report-1.xlsx',
        filename: 'report-1.xlsx',
        size: 12,
        eTag: 'etag-1',
        lastModified: undefined,
      },
      {
        bucket: 'fund-acc-statement',
        objectKey: '2026-05-13/330200062401/report-2.xlsx',
        path: 'fund-acc-statement/2026-05-13/330200062401/report-2.xlsx',
        filename: 'report-2.xlsx',
        size: 18,
        eTag: 'etag-2',
        lastModified: undefined,
      },
    ]);

    expect(sendSpy).toHaveBeenCalledTimes(2);
  });

  it('should read object as buffer', async () => {
    const sendSpy = jest
      .spyOn((service as any).client, 'send')
      .mockResolvedValue({
        Body: Readable.from(['hello world']),
        ContentType: 'text/plain',
        ContentLength: 11,
        ContentDisposition: 'attachment; filename="report.txt"',
        ETag: 'etag-1',
      });

    await expect(
      service.getObjectAsBuffer({
        bucket: 'reports',
        objectKey: 'folder/report.txt',
      })
    ).resolves.toEqual({
      bucket: 'reports',
      objectKey: 'folder/report.txt',
      filename: 'report.txt',
      content: Buffer.from('hello world'),
      contentLength: 11,
      contentType: 'text/plain',
      eTag: 'etag-1',
    });

    expect(sendSpy).toHaveBeenCalledTimes(1);
  });
});
