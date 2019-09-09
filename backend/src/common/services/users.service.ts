import * as bcrypt from 'bcryptjs';
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Company } from '../entities/company.entity';
import { CreateUserDto, UpdateUserDto } from '../dto/users.dto';
import { TokenGeneratorService } from './token-generator.service';
import { EmailService } from '../../notification/email.service';
import { EmailMessage } from '../../notification/interface/email-message.interface';
import { ActivateAccountEmailPayload } from '../../notification/interface/email-payload/activate-account.payload';

@Injectable()
export class UsersService {
  private readonly saltRounds: number = 10;

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
    private readonly tokenGeneratorService: TokenGeneratorService,
    private readonly emailService: EmailService
  ) { }

  /**
   * Create a user
   */
  public async createUser(data: CreateUserDto): Promise<User> {
    const user = new User();
    user.firstname = data.firstname;
    user.lastname = data.lastname;
    user.email = data.email;
    user.password = data.password;
    user.enabled = true;

    // Encrypt password
    user.password = await this.getHash(data.password);

    await user.save();

    return user;
  }

  /**
   * Get current company by user
   */
  public async findMyCompanyByUser(user: User): Promise<Company> {
    return this.companyRepository.findOne({ id: user.currentCompany.id });
  }

  /**
   * Get a single user by email
   */
  public async findOneByEmail(email: string): Promise<User> {
    return this.userRepository.findOne({ email: email.toLocaleLowerCase() });
  }

  /**
   * Get a single user by token for reset password feature
   */
  public async findOneByPasswordConfirmationToken(passwordConfirmationToken: string): Promise<User> {
    return this.userRepository.findOne({ passwordConfirmationToken });
  }

  /**
   * Update user's password
   */
  public async updatePassword(user: User, newPassword: string): Promise<void> {
    try {
      user.password = await this.getHash(newPassword);
      user.passwordConfirmationToken = this.tokenGeneratorService.generateToken();
      await user.save();
    } catch (err) {
      throw new Error(err);
    }
  }

  /**
   * Encrypt password with Bcrypt
   */
  public async getHash(password: string | undefined): Promise<string> {
    return bcrypt.hash(password, this.saltRounds);
  }

  /**
   * Compare passwords with Bcrypt
   */
  public async compareHash(password: string | undefined, hash: string | undefined): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Generate a confirmation token and send a mail in user
   */
  public async confirmationToken(user: User, baseUrl: string): Promise<User> {
    user.enabled = false;
    user.emailConfirmationToken = this.tokenGeneratorService.generateToken();
    await user.save();

    const message: EmailMessage<ActivateAccountEmailPayload> = {
      To: [{
        Email: user.email,
        Name: user.fullName,
      }],
      TemplateID: 705763,
      Subject: 'Activez votre compte Libeo',
      Variables: {
        fullName: user.fullName,
        emailValidationLink: `${baseUrl}/login/${user.emailConfirmationToken}?email=${user.email}`
      },
    };

    await this.emailService.send([message]);

    return user;
  }

  /**
   * Enabled user by confirmation token
   */
  public async activateUser(confirmationToken: string): Promise<boolean> {
    const user = await this.userRepository.findOne({ enabled: false, emailConfirmationToken: confirmationToken });
    if (!user) {
      throw new HttpException('api.error.user.invalid_confirmation_token', HttpStatus.BAD_REQUEST);
    }

    user.enabled = true;
    user.emailConfirmationToken = null;
    await user.save();

    return true;
  }

  /**
   * Update current user
   *
   * @param   {User}           user  - Current user
   * @param   {UpdateUserDto}  data  - Date of user
   *
   * @return  {Promise<User>}        - Returns updated current user
   */
  public async updateUser(user: User, data: UpdateUserDto): Promise<User> {
    if (data.password) {
      data.password = await this.getHash(data.password);
    }

    user = Object.assign(user, data);
    await user.save();

    return user;
  }
}
