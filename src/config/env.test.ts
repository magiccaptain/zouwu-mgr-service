import { env } from './env';

describe('array contain', () => {
  it('should read settings from env', () => {
    process.env.MQTT_URL = 'some-url';
    const settings = {
      mqtt: {
        url: 'mqtt://localhost:1883',
        username: 'admin',
        password: 'admin',
      },
    };
    expect(env(settings).mqtt.url).toBe('some-url');
  });

  it('should read nested keys with digits from env', () => {
    process.env.MINIO_S3_HOST = '100.78.180.100';
    const settings = {
      minio: {
        s3: {
          host: 'localhost',
        },
      },
    };

    expect(env(settings).minio.s3.host).toBe('100.78.180.100');
  });
});
