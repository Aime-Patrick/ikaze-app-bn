import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserRole } from '../../schemas/user.schema'
import { CreateUserDto } from './dto/create-user.dto';
import { HashService } from 'src/utils/utils.service';
import { MailService } from '../mail/mail.service';
@Injectable()
export class UsersService {
    constructor(
        @InjectModel(User.name) private userModel: Model<User>,
        private hashUtils: HashService,
        private mailService: MailService
    ) {}

    async findUserByEmail(email: string): Promise<User | null> {
        return this.userModel.findOne({ email }).select('-password').exec();
    }
    
    async findAllUsers(): Promise<User[]> {
        return (await this.userModel.find().select('-password').exec())
            .filter(user => user.role !== UserRole.SYSTEM_ADMIN);
    }

    async getUserById(userId: string): Promise<User | null> {
        return this.userModel.findById(userId).select('-password').exec();
    }

    async updateUser(userId: string, updateData: Partial<CreateUserDto>): Promise<User | null> {
        if (updateData.password) {
            updateData.password = await this.hashUtils.hashPassword(updateData.password);
        }
        return this.userModel.findByIdAndUpdate(userId, updateData, { new: true }).select('-password').exec();
    }

    async deleteUser(userId: string): Promise<{ message: string }> {
        const result = await this.userModel.findByIdAndDelete(userId).exec();
        if (!result) {
            throw new Error('User not found');
        }
        return { message: 'User deleted successfully' };
    }
}
