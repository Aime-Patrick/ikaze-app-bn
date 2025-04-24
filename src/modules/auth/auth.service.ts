import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserRole } from 'src/schemas/user.schema';
import { HashService } from 'src/utils/utils.service';
import { ConfigService } from '@nestjs/config';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private hashUtils: HashService,
    private jwtService: JwtService,
  ) {}

  async registerUser(register: RegisterDto): Promise<{ message: string }> {
    try {
      const { email, password, username, phoneNumber } = register;

    const existingUser = await this.userModel.findOne({
      $or: [{ email }, { phoneNumber }, { username }],
    });

    if (existingUser) {
      throw new UnauthorizedException('User already exists');
    }

    const hashedPassword = await this.hashUtils.hashPassword(password);

    const newUser = new this.userModel({
      ...RegisterDto,
      password: hashedPassword,
      role: UserRole.USER,
    });

    await newUser.save();

    return { message: 'Account created successfully' };
    } catch (error) {
      throw error;
    }
  }

  async login(loginDto: LoginDto): Promise<{ token: string; message: string }> {
    const { identifier, password } = loginDto;
  
    try {
      const user = await this.userModel.findOne({
        $or: [{ email: identifier }, { phoneNumber: identifier }, { username: identifier }],
      }).exec();
  
      if (!user) {
        throw new NotFoundException('User not found');
      }
  
      const isPasswordValid = await this.hashUtils.comparePassword(
        password,
        user.password,
      );
  
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid password');
      }
  
      const payload: any = {
        id: user.id,
        role: user.role,
        email: user.email,
        username: user.username,
      };
      const token = this.jwtService.sign(payload, {
        expiresIn:'1h',
      });
  
      return { message: 'login successful', token };
    } catch (error) {
      throw error;
    }
  }
}
