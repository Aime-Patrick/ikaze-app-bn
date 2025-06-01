import { Controller, Get, Post, Delete, Put, Body, Param, UseGuards, NotFoundException, UploadedFile, UseInterceptors, BadRequestException } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthService } from '../auth/auth.service';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from 'src/guard/jwt.guard';
import { RolesGuard } from 'src/guard/roles.guard';
import { Roles } from 'src/decorator/roles.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { HashService } from 'src/utils/utils.service';

@ApiTags('users')
@Controller('users')
export class UsersController {

    constructor(
        private readonly usersService: UsersService,
        private readonly authService: AuthService,
        private readonly hashService: HashService,
    ) {}

    @Get()
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('system-admin')
    @ApiOperation({ summary: 'Get all users', description: 'Retrieve a list of all users in the system.' })
    async getAllUsers() {
        return this.usersService.findAllUsers();
    }

    @Post()
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('system-admin')
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(FileInterceptor('profileImage'))
    @ApiOperation({ summary: 'Create user', description: 'Create a new user as admin (no OTP sent). Supports picture upload.' })
    async createUser(
        @Body() createUserDto: CreateUserDto,
        @UploadedFile() profileImage: Express.Multer.File
    ) {
        let pictureUrl: string | undefined;
        if (profileImage) {
            const uploaded = await this.hashService.uploadFileToCloudinary(profileImage);
            pictureUrl = uploaded.url;
        }
        return this.authService.registerUser(
            { ...createUserDto, profileImage: pictureUrl },
            { sendOtp: false }
        );
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get user by ID', description: 'Retrieve a user by their ID.' })
    async getUserById(@Param('id') id: string) {
        const user = await this.usersService.getUserById(id);
        if (!user) throw new NotFoundException('User not found');
        return user;
    }

    @Put(':id')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('system-admin')
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(FileInterceptor('profileImage'))
    @ApiOperation({ summary: 'Update user', description: 'Update a user by their ID. Supports picture upload.' })
    async updateUser(
        @Param('id') id: string,
        @Body() userData: UpdateUserDto,
        @UploadedFile() profileImage: Express.Multer.File
    ) {
        if (profileImage) {
            const uploaded = await this.hashService.uploadFileToCloudinary(profileImage);
            userData.profileImage = uploaded.url;
        }
        const updatedUser = await this.usersService.updateUser(id, userData);
        if (!updatedUser) throw new NotFoundException('User not found');
        return updatedUser;
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete user', description: 'Delete a user by their ID.' })
    async deleteUser(@Param('id') id: string) {
        return this.usersService.deleteUser(id);
    }
}
