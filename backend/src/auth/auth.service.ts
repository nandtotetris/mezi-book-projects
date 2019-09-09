import { JwtService } from '@nestjs/jwt';
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { UsersService } from '../common/services/users.service';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { User } from '../common/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  /**
   * Create a JWT with email
   */
  public createToken(email: string): string {
    return this.jwtService.sign({ email });
  }

  /**
   * Check user for validated
   */
  public async validateUser(payload: JwtPayload): Promise<User> {
    const user = await this.usersService.findOneByEmail(payload.email);
    if (!user) {
      throw new HttpException('api.error.unauthorized', HttpStatus.UNAUTHORIZED);
    }

    if (user.enabled === false && !user.emailConfirmationToken) {
      throw new HttpException('api.error.user.disabled', HttpStatus.UNAUTHORIZED);
    }

    if (user.enabled === false && user.emailConfirmationToken) {
      throw new HttpException('api.error.user.not_activated', HttpStatus.UNAUTHORIZED);
    }

    if (user.blocked === true) {
      throw new HttpException('api.error.user.blocked', HttpStatus.UNAUTHORIZED);
    }

    return user;
  }
}
