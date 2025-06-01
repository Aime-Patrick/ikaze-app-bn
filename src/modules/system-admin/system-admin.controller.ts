import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/guard/jwt.guard';
import { RolesGuard } from 'src/guard/roles.guard';
import { SystemAdminService } from './system-admin.service';

@ApiTags('system-admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('system-admin')
export class SystemAdminController {
  constructor(private readonly systemAdminService: SystemAdminService) {}

  @Get('statistics')
  @ApiOperation({ summary: 'Get system statistics', description: 'Returns dashboard statistics for admin.' })
  async getStatistics() {
    return this.systemAdminService.getStatistics();
  }

  @Get('recent-activities')
  @ApiOperation({ summary: 'Get recent activities', description: 'Returns recent system activities.' })
  async getRecentActivities() {
    return this.systemAdminService.getRecentActivities();
  }

  @Get('reports')
  @ApiOperation({ summary: 'Get dashboard reports', description: 'Returns analytics data for dashboard charts.' })
  async getReports() {
    return this.systemAdminService.getReports();
  }
}

