import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/decorator/roles.decorator';
import { UserRole } from 'src/schemas/user.schema';
import { HashService } from 'src/utils/utils.service';
import { JwtAuthGuard } from 'src/guard/jwt.guard';
import { RolesGuard } from 'src/guard/roles.guard';

@ApiTags('system-admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('system-admin')
export class SystemAdminController {
  constructor(
    private hashService: HashService,
  ) {}
}
