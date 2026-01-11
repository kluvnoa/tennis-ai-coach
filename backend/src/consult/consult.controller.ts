import {
  Body,
  Controller,
  Get,
  Post,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ConsultService } from './consult.service';

@Controller('consult')
export class ConsultController {
  constructor(private readonly consultService: ConsultService) {}

  @Get('history')
  getHistory() {
    return this.consultService.getLatest();
  }

  @Post()
  createConsult(@Body() body: { userMessage: string; aiMessage: string }) {
    return this.consultService.create(body.userMessage, body.aiMessage);
  }

  @Post('advice')
  async getAdvice(
    @Body() body: { question: string; level?: string; playStyle?: string },
  ) {
    if (!body.question) {
      throw new HttpException(
        'question field is required',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      return await this.consultService.getAdvice(body);
    } catch (error) {
      console.error(error);
      throw new HttpException(
        error instanceof Error ? error.message : 'An unexpected error occurred',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
