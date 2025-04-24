import { Module } from '@nestjs/common';
import { SystemAdminController } from './system-admin.controller';
import { SystemAdminService } from './system-admin.service';
import { UtilsModule } from 'src/utils/utils.module';
@Module({
  imports:[ UtilsModule],
  controllers: [SystemAdminController],
  providers: [SystemAdminService]
})
export class SystemAdminModule {}
