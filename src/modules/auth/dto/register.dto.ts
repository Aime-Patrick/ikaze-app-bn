import { Optional } from "@nestjs/common";
import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class RegisterDto {
  @ApiProperty({ example: 'Username for user' })
    @IsString()
    @IsNotEmpty({ message: 'field is required' })
    username: string;

    @ApiProperty({ example: 'Email for user' })
    @IsString()
    @IsNotEmpty({ message: 'field is required' })
    @IsEmail({}, { message: 'email must be a valid email' })
    email: string;

    @ApiProperty({ example: 'Phone number for user' })
    @IsString()
    phoneNumber: string;

    @ApiProperty({ example: 'Gender of user' })
    @IsString()
    @IsNotEmpty({ message: 'field is required' })
    gender: string;

    @ApiProperty({ example: 'Password for user' })
    @IsString()
    @IsNotEmpty({ message: 'field is required' })
    password: string;

    @ApiProperty({ example: 'Profile image URL for user', required: false })
    @IsString()
    @Optional()
    profileImage?: string;
}