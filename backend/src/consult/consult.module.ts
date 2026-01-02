import { Module } from '@nestjs/common';
import { ConsultService } from './consult.service';
import { ConsultController } from './consult.controller';

@Module({
  providers: [ConsultService],
  controllers: [ConsultController],
})
export class ConsultModule {}
