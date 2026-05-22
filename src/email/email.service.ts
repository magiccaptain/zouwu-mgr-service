import { posix } from 'path';

import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import nodemailer, { SentMessageInfo } from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';

import { settings } from 'src/config';
import { MinioObjectReference, MinioService } from 'src/minio/minio.service';

export interface EmailAttachmentInput extends MinioObjectReference {
  content?: Buffer | string;
  contentType?: string;
  cid?: string;
  filename?: string;
}

export interface SendEmailOptions {
  to: string | string[];
  bcc?: string | string[];
  cc?: string | string[];
  from?: string;
  subject: string;
  text?: string;
  html?: string;
  attachments?: EmailAttachmentInput[];
}

export interface SendDirectoryFilesToRecipientsOptions {
  recipients: string[];
  directoryPath: string;
  date: string;
  bcc?: string | string[];
  cc?: string | string[];
  from?: string;
  html?: string;
  subject?: string;
  text?: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly transporter = nodemailer.createTransport({
    host: settings.email.host,
    port: settings.email.port,
    secure: settings.email.secure,
    auth: settings.email.user
      ? {
          user: settings.email.user,
          pass: settings.email.password,
        }
      : undefined,
  });

  constructor(private readonly minioService: MinioService) {}

  async sendMail(options: SendEmailOptions): Promise<SentMessageInfo> {
    try {
      const attachments = await this.resolveAttachments(options.attachments);
      const info = await this.transporter.sendMail({
        from: options.from || settings.email.from || settings.email.user,
        to: options.to,
        cc: options.cc,
        bcc: options.bcc,
        subject: options.subject,
        text: options.text,
        html: options.html,
        attachments,
      });

      this.logger.log(
        `Email sent successfully: ${info.messageId || options.subject}`
      );
      return info;
    } catch (error) {
      this.logger.error(`Failed to send email: ${options.subject}`, error);
      throw new InternalServerErrorException('Failed to send email');
    }
  }

  async sendDirectoryFilesToRecipients(
    options: SendDirectoryFilesToRecipientsOptions
  ): Promise<SentMessageInfo[]> {
    const {
      recipients,
      directoryPath,
      date,
      subject,
      text,
      html,
      from,
      cc,
      bcc,
    } = options;

    if (!recipients.length) {
      throw new BadRequestException('Recipients are required');
    }

    const prefixPath = this.buildDirectoryPath(directoryPath, date);
    const directoryObjects = await this.minioService.listObjects({
      path: prefixPath,
    });

    if (!directoryObjects.length) {
      throw new NotFoundException(
        `No files found under MinIO path ${prefixPath}`
      );
    }

    const attachments = await Promise.all(
      directoryObjects.map(async (directoryObject) => {
        const minioFile = await this.minioService.getObjectAsBuffer({
          bucket: directoryObject.bucket,
          objectKey: directoryObject.objectKey,
        });

        return {
          filename: minioFile.filename,
          content: minioFile.content,
          contentType: minioFile.contentType,
        } satisfies EmailAttachmentInput;
      })
    );

    return Promise.all(
      recipients.map((recipient) =>
        this.sendMail({
          from,
          to: recipient,
          cc,
          bcc,
          subject: subject || `对账单附件 ${date}`,
          text: text || `附件为 ${prefixPath} 目录下的全部对账单文件，请查收。`,
          html:
            html ||
            `<p>附件为 ${prefixPath} 目录下的全部对账单文件，请查收。</p>`,
          attachments,
        })
      )
    );
  }

  private async resolveAttachments(
    attachments: EmailAttachmentInput[] = []
  ): Promise<Mail.Attachment[]> {
    return Promise.all(
      attachments.map(async (attachment) => {
        if (attachment.content !== undefined) {
          return {
            filename: attachment.filename,
            content: attachment.content,
            contentType: attachment.contentType,
            cid: attachment.cid,
          };
        }

        const minioFile = await this.minioService.getObjectAsBuffer(attachment);

        return {
          filename: attachment.filename || minioFile.filename,
          content: minioFile.content,
          contentType: attachment.contentType || minioFile.contentType,
          cid: attachment.cid,
        };
      })
    );
  }

  private buildDirectoryPath(directoryPath: string, date: string): string {
    const normalizedDirectoryPath = directoryPath.replace(/^\/+|\/+$/g, '');
    const normalizedDate = date.replace(/^\/+|\/+$/g, '');

    return posix.join(normalizedDirectoryPath, normalizedDate);
  }
}
