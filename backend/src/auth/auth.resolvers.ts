import { Resolver, Mutation, Args, Context } from '@nestjs/graphql';
import { HttpException, UseGuards, HttpStatus, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../common/services/users.service';
import { SignUpPayload } from './interfaces/signup.dto';
import { SignInPayload } from './interfaces/signin.dto';
import { User } from '../common/entities/user.entity';
import { GqlAuthGuard } from './guards/jwt-auth.guard';
import { ResetPasswordPayload, PasswordReset, SendPasswordResetEmail } from './interfaces/reset-password.dto';
import { EmailService } from '../notification/email.service';
import { EmailMessage } from '../notification/interface/email-message.interface';
import { PasswordResetEmailPayload } from '../notification/interface/email-payload/reset-password.payload';
import { TokenGeneratorService } from '../common/services/token-generator.service';
import { SupportService } from '../notification/support.service';

@Resolver('User')
export class AuthResolvers {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly emailService: EmailService,
    private readonly supportService: SupportService,
    private readonly tokenGeneratorService: TokenGeneratorService
  ) {}

  @Mutation()
  public async signup(@Context() ctx: any, @Args('input') input: SignUpPayload): Promise<User> {
    if (input.password !== input.passwordConfirmation) {
      throw new HttpException('api.error.signup.password_mismatch', HttpStatus.BAD_REQUEST);
    }

    if (input.cgu !== true) {
      throw new HttpException('api.error.signup.cgu', HttpStatus.BAD_REQUEST);
    }

    let user: User = await this.usersService.findOneByEmail(input.email);
    if (user) {
      throw new HttpException('api.error.signup_email_exist', HttpStatus.BAD_REQUEST);
    }

    delete input.cgu;
    user = await this.usersService.createUser(input);

    const baseUrl = (ctx.req.headers && ctx.req.headers.origin) ? ctx.req.headers.origin : null;
    this.usersService.confirmationToken(user, baseUrl);
    await this.supportService.createTicketNewUser(user);

    return user;
  }

  @Mutation()
  public async signin(@Args('input') input: SignInPayload): Promise<User> {
    const user: User = await this.usersService.findOneByEmail(input.email);
    if (!user) {
      throw new HttpException('api.error.signin', HttpStatus.BAD_REQUEST);
    }

    if (user.enabled === false) {
      throw new HttpException('api.error.user.disabled', HttpStatus.UNAUTHORIZED);
    }

    if (user.blocked === true) {
      throw new HttpException('api.error.user.blocked', HttpStatus.UNAUTHORIZED);
    }

    if (!await this.usersService.compareHash(input.password, user.password)) {
      throw new HttpException('api.error.signin', HttpStatus.BAD_REQUEST);
    }

    user.lastLogin = new Date();
    user.token = this.authService.createToken(user.email);
    return user.save();
  }

  @Mutation()
  public async sendPasswordResetEmail(@Context() ctx: any, @Args('input') input: SendPasswordResetEmail): Promise<PasswordReset> {
    const user: User = await this.usersService.findOneByEmail(input.email);
    if (user) {
      user.passwordConfirmationToken = this.tokenGeneratorService.generateToken();
      await user.save();

      const baseUrl: string = (ctx.req.headers && ctx.req.headers.origin) ? ctx.req.headers.origin : `://${process.env.DOMAIN}`;
      const resetPasswordEmail: EmailMessage<PasswordResetEmailPayload> = {
        To: [{
          Email: user.email,
          Name: user.fullName
        }],
        TemplateID: 844925,
        Variables: {
          fullName: user.fullName,
          resetPasswordLink: `${baseUrl}/reset-password/${user.passwordConfirmationToken}`,
        },
        Subject: 'Réinitialisez votre mot de passe'
      };
      await this.emailService.send([resetPasswordEmail]);
    }
    return {status: true};
  }

  @Mutation()
  public async resetPassword(@Args('input') input: ResetPasswordPayload): Promise<boolean> {
    if (input.password !== input.confirmPassword) {
      throw new BadRequestException('api.error.user.password_must_match');
    }
    const user = await this.usersService.findOneByPasswordConfirmationToken(input.confirmationToken);
    if (!user) {
      throw new BadRequestException('api.error.user.wrong_confirm_token');
    }

    await this.usersService.updatePassword(user, input.password);
    return true;
  }

  @Mutation()
  @UseGuards(new GqlAuthGuard())
  public async logout(@Context() ctx: any): Promise<boolean> {
    const user: User = ctx.req.user;
    user.token = null;
    await user.save();

    return true;
  }
}
