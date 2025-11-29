import { Controller, Get, Patch, Body, UseGuards, Request } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UserController {
    constructor(private readonly userService: UserService) { }

    @Get('me')
    getProfile(@Request() req) {
        return this.userService.findOne(req.user.id);
    }

    @Patch('me')
    updateProfile(@Request() req, @Body() data: any) {
        return this.userService.update(req.user.id, data);
    }
}
