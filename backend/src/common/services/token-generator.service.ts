import * as crypto from 'crypto';
import { Injectable } from '@nestjs/common';

@Injectable()
export class TokenGeneratorService {
  public generateToken(): string {
    return crypto.randomBytes(32).toString('hex').replace('+/', '-_').replace('=', '').trim();
  }
}
