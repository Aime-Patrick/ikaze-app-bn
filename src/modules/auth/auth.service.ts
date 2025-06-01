import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  HttpException,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserRole } from 'src/schemas/user.schema';
import { HashService } from 'src/utils/utils.service';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import { Request } from 'express';
import { MailService } from '../mail/mail.service';
import { OTP } from 'src/schemas/otp.schema';
import { Activity } from 'src/schemas/activity.schema';
@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(OTP.name) private optModel: Model<OTP>,
    @InjectModel(Activity.name) private activityModel: Model<Activity>,
    private hashUtils: HashService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  async registerUser(
  register: RegisterDto,
  options?: { sendOtp?: boolean, platform?:string }
): Promise<{ message: string, statusCode: number }> {
  try {
    const { email, password, username, phoneNumber } = register;

    const existingUser = await this.userModel.findOne({
      $or: [{ email }, { phoneNumber }, { username }],
    });
    
    if (existingUser) {
      let field = '';
      if (existingUser.email === email) field = 'account';
      else if (existingUser.phoneNumber === phoneNumber) field = 'phone number';
      else if (existingUser.username === username) field = 'username';
    
      throw new BadRequestException(`A user with this ${field} already exists.`);
    }      

    const hashedPassword = await this.hashUtils.hashPassword(password);

    // Default: user is not verified
    const userData: any = {
      ...register,
      password: hashedPassword,
      role: UserRole.USER,
      isEmailVerified: false,
    };

    // If admin is creating the user and wants to skip OTP, mark as verified
    if (options?.sendOtp === false) {
      userData.isEmailVerified = true;
    }

    const newUser = new this.userModel(userData);
    await newUser.save();

    // Log the activity
    await this.activityModel.create({
      action: 'New user registered',
      user: `${newUser.username || newUser.email}`,
    });

    // Only send OTP if requested (e.g., for mobile app registration)
    if (options?.sendOtp !== false) {
      const otp = Math.floor(100000 + Math.random() * 900000); // Generate a 6-digit OTP
      const otpData = new this.optModel({
        email: newUser.email,
        code: otp,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // OTP valid for 10 minutes
        type: 'EMAIL_VERIFICATION',
        isUsed: false,
        userId: newUser._id,
        platform: options?.platform || 'web', // Use the provided platform or default to 'web'
      });
      await otpData.save();

      // Send OTP email
      await this.mailService.sendEmailVerificationOTP(
        newUser.email,
        `Your OTP code is: ${otp}`
      );
    }

    return { message: 'Account created successfully', statusCode: HttpStatus.CREATED };
  } catch (error) {
    throw error;
  }
}

  async login(loginDto: LoginDto, req: Request): Promise<{ token: string; message: string; statusCode: number; user: any }> {
    const { identifier, password } = loginDto;

    try {
      const user = await this.userModel.findOne({
        $or: [{ email: identifier }, { phoneNumber: identifier }, { username: identifier }],
      }).exec();

      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      const isPasswordValid = await this.hashUtils.comparePassword(
        password,
        user.password,
      );

      if (!isPasswordValid) {
        throw new HttpException('Invalid password', HttpStatus.UNAUTHORIZED);
      }

      // Update last login and login history
      await this.updateLoginInfo(user._id.toString(), req);


      const payload = {
        email: user.email,
        sub: user._id,
        role: user.role
      };

      const token = this.jwtService.sign(payload, {
        expiresIn: '1h',
      });
      // Log the activity
      await this.activityModel.create({
        action: 'User logged in',
        user: `${user.username || user.email}`,
        
      });

      return {
        message: 'login successful',
        token,
        statusCode: HttpStatus.OK,
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          username: user.username,
          isEmailVerified: user.isEmailVerified,
          status: user.status,
          lastLogin: user.lastLogin
        }
      };
    } catch (error) {
      throw error;
    }
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userModel.findOne({ email }).exec();
    if (user && await this.hashUtils.comparePassword(password, user.password)) {
      const { password: _, ...result } = user.toJSON();
      return result;
    }
    return null;
  }

  private async updateLoginInfo(userId: string, req: Request) {
    const now = new Date();
    const userAgent = req.headers['user-agent'] || 'Unknown';
    const ip = req.ip || req.socket.remoteAddress || 'Unknown';
    const platform = req.headers['x-platform'] || 'web';

    // Get device info from user agent
    const device = this.getDeviceInfo(userAgent);

    await this.userModel.findByIdAndUpdate(userId, {
      $set: { lastLogin: now },
      $push: {
        loginHistory: {
          timestamp: now,
          ip,
          device,
          platform
        }
      }
    }, { new: true });
  }

  private getDeviceInfo(userAgent: string): string {
    // Basic device detection
    if (userAgent.includes('Mobile')) {
      if (userAgent.includes('Android')) return 'Android Mobile';
      if (userAgent.includes('iPhone')) return 'iPhone';
      if (userAgent.includes('iPad')) return 'iPad';
      return 'Mobile Device';
    }
    if (userAgent.includes('Windows')) return 'Windows PC';
    if (userAgent.includes('Mac')) return 'Mac';
    if (userAgent.includes('Linux')) return 'Linux PC';
    return 'Desktop';
  }

  async getLoginHistory(userId: string) {
    const user = await this.userModel.findById(userId)
      .select('loginHistory')
      .sort({ 'loginHistory.timestamp': -1 })
      .limit(10);
    
    return user?.loginHistory || [];
  }
}
