import { Body, Controller, Post, UseGuards, Req, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User, UserSchema } from '../../schemas/user.schema';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from '../../guard/jwt.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
    ) {}

    @Post('register')
    @ApiOperation({ summary: 'User registration' })
    async register(@Body() registerDto: RegisterDto): Promise<{ message: string }> {
        try {
            return this.authService.registerUser(registerDto,{ sendOtp: true, platform: 'mobile' });
        }
        catch (error) {
            throw error;
        }
    }

    @Post('login')
    @ApiOperation({ summary: 'User login' })
    async login(@Body() loginDto: LoginDto, @Req() req) {
        return this.authService.login(loginDto, req);
    }

    @Get('login-history')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get user login history' })
    async getLoginHistory(@Req() req) {
        return this.authService.getLoginHistory(req.user.id);
    }
}
