import { ConfigService as NestConfigService } from '@nestjs/config';
import { ConfigService } from './config.service';

describe('ConfigService', () => {
  let configService: ConfigService;
  let nestConfigService: { get: jest.Mock<string | undefined, [string]> };

  beforeEach(() => {
    nestConfigService = {
      get: jest.fn(),
    };

    configService = new ConfigService(
      nestConfigService as unknown as NestConfigService,
    );
  });

  it('returns fixed values for appName and supportEmail', () => {
    nestConfigService.get.mockReturnValue('production');

    const config = configService.getConfig();

    expect(config.appName).toBe('Next.js + NestJS Boilerplate');
    expect(config.supportEmail).toBe('support@example.com');
  });

  it('returns the environment from the mocked NODE_ENV value', () => {
    nestConfigService.get.mockReturnValue('staging');

    const config = configService.getConfig();

    expect(config.environment).toBe('staging');
    expect(nestConfigService.get).toHaveBeenCalledWith('NODE_ENV');
  });

  it('defaults environment to "development" when NODE_ENV is undefined', () => {
    nestConfigService.get.mockReturnValue(undefined);

    const config = configService.getConfig();

    expect(config.environment).toBe('development');
  });
});
