import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { DebugUploadController } from './debug-upload.controller';

@Module({
  imports: [AuthModule],
  controllers: [DebugUploadController],
})
export class DebugModule {}
