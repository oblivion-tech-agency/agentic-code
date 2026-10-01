import { Injectable } from '@nestjs/common';
import { readFileSync } from 'fs';
import { join } from 'path';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello from NestJS Backend!';
  }

  getVersion(): { version: string } {
    const pkgPath = join(__dirname, '..', '..', 'package.json');
    const raw = readFileSync(pkgPath, 'utf-8');
    const { version } = JSON.parse(raw);
    return { version };
  }
}
