import nodemailer from 'nodemailer';

import { settings } from 'src/config';
import { MinioService } from 'src/minio/minio.service';

import { EmailService } from './email.service';

jest.mock('nodemailer', () => ({
  __esModule: true,
  default: {
    createTransport: jest.fn(),
  },
}));

describe('EmailService', () => {
  let service: EmailService;
  let sendMailMock: jest.Mock;
  let minioService: jest.Mocked<MinioService>;
  const originalFrom = settings.email.from;
  const originalUser = settings.email.user;

  beforeEach(() => {
    sendMailMock = jest.fn().mockResolvedValue({
      messageId: 'message-1',
      accepted: ['receiver@example.com'],
    });
    (nodemailer.createTransport as jest.Mock).mockReturnValue({
      sendMail: sendMailMock,
    });
    settings.email.from = 'sender@example.com';
    settings.email.user = 'smtp-user@example.com';
    minioService = {
      listObjects: jest.fn().mockResolvedValue([
        {
          bucket: 'fund-acc-statement',
          objectKey:
            '2026-05-13/330200062400/330200062400普通对账单_20260513.xlsx',
          path: 'fund-acc-statement/2026-05-13/330200062400/330200062400普通对账单_20260513.xlsx',
          filename: '330200062400普通对账单_20260513.xlsx',
          size: 128,
        },
        {
          bucket: 'fund-acc-statement',
          objectKey:
            '2026-05-13/330200062401/330200062401普通对账单_20260513.xlsx',
          path: 'fund-acc-statement/2026-05-13/330200062401/330200062401普通对账单_20260513.xlsx',
          filename: '330200062401普通对账单_20260513.xlsx',
          size: 256,
        },
      ]),
      getObjectAsBuffer: jest.fn().mockResolvedValue({
        bucket: 'reports',
        objectKey: 'daily/report.csv',
        filename: 'report.csv',
        content: Buffer.from('csv-content'),
        contentType: 'text/csv',
      }),
    } as unknown as jest.Mocked<MinioService>;
    service = new EmailService(minioService);
  });

  afterAll(() => {
    settings.email.from = originalFrom;
    settings.email.user = originalUser;
  });

  it('should send html email with MinIO attachment', async () => {
    await service.sendMail({
      to: 'receiver@example.com',
      subject: 'Daily report',
      text: 'plain text',
      html: '<strong>daily report</strong>',
      attachments: [
        {
          path: 'fund-acc-statement/2026-05-13/330200062400/330200062400普通对账单_20260513.xlsx',
        },
      ],
    });

    expect(minioService.getObjectAsBuffer).toHaveBeenCalledWith({
      path: 'fund-acc-statement/2026-05-13/330200062400/330200062400普通对账单_20260513.xlsx',
    });
    expect(sendMailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        from: 'sender@example.com',
        to: 'receiver@example.com',
        subject: 'Daily report',
        text: 'plain text',
        html: '<strong>daily report</strong>',
        attachments: [
          expect.objectContaining({
            filename: 'report.csv',
            content: Buffer.from('csv-content'),
            contentType: 'text/csv',
          }),
        ],
      })
    );
  });

  it('should send direct attachment without MinIO lookup', async () => {
    await service.sendMail({
      to: ['receiver@example.com'],
      subject: 'Direct attachment',
      html: '<p>attached</p>',
      attachments: [
        {
          filename: 'hello.txt',
          content: 'hello',
          contentType: 'text/plain',
        },
      ],
    });

    expect(minioService.getObjectAsBuffer).not.toHaveBeenCalled();
    expect(sendMailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        attachments: [
          expect.objectContaining({
            filename: 'hello.txt',
            content: 'hello',
            contentType: 'text/plain',
          }),
        ],
      })
    );
  });

  it('should send all files under directory to every recipient', async () => {
    (minioService.getObjectAsBuffer as jest.Mock)
      .mockResolvedValueOnce({
        bucket: 'fund-acc-statement',
        objectKey:
          '2026-05-13/330200062400/330200062400普通对账单_20260513.xlsx',
        filename: '330200062400普通对账单_20260513.xlsx',
        content: Buffer.from('file-1'),
        contentType:
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
      .mockResolvedValueOnce({
        bucket: 'fund-acc-statement',
        objectKey:
          '2026-05-13/330200062401/330200062401普通对账单_20260513.xlsx',
        filename: '330200062401普通对账单_20260513.xlsx',
        content: Buffer.from('file-2'),
        contentType:
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

    await service.sendDirectoryFilesToRecipients({
      recipients: ['first@example.com', 'second@example.com'],
      directoryPath: 'fund-acc-statement',
      date: '2026-05-13',
    });

    expect(minioService.listObjects).toHaveBeenCalledWith({
      path: 'fund-acc-statement/2026-05-13',
    });
    expect(minioService.getObjectAsBuffer).toHaveBeenCalledTimes(2);
    expect(sendMailMock).toHaveBeenCalledTimes(2);
    expect(sendMailMock.mock.calls[0][0]).toEqual(
      expect.objectContaining({
        to: 'first@example.com',
        subject: '对账单附件 2026-05-13',
        attachments: [
          expect.objectContaining({
            filename: '330200062400普通对账单_20260513.xlsx',
            content: Buffer.from('file-1'),
          }),
          expect.objectContaining({
            filename: '330200062401普通对账单_20260513.xlsx',
            content: Buffer.from('file-2'),
          }),
        ],
      })
    );
    expect(sendMailMock.mock.calls[1][0]).toEqual(
      expect.objectContaining({
        to: 'second@example.com',
        attachments: [
          expect.objectContaining({
            filename: '330200062400普通对账单_20260513.xlsx',
          }),
          expect.objectContaining({
            filename: '330200062401普通对账单_20260513.xlsx',
          }),
        ],
      })
    );
  });
});
