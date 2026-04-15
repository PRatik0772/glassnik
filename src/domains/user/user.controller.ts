import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateMeDto } from './dto/update-me.dto';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // POST /users — public registration (delegates to auth normally, kept for legacy tests)
  @Post()
  createUser(@Body() dto: CreateUserDto) {
    return this.userService.createUser(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMe(@Req() req) {
    return this.userService.getMe(req.user.id);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  updateMe(@Req() req, @Body() dto: UpdateMeDto) {
    return this.userService.updateMe(req.user.id, dto);
  }

  // Public profile — no auth required
  @Get(':id')
  getPublicProfile(@Param('id', ParseIntPipe) id: number) {
    return this.userService.getPublicProfile(id);
  }

  // Public capability list for a user — no auth required
  @Get(':userId/capabilities')
  getUserCapabilities(@Param('userId', ParseIntPipe) userId: number) {
    return this.userService.listUserCapabilities(userId);
  }
}
