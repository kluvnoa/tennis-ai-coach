import {
  Body,
  Controller,
  Get,
  Post,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import {
  AdviceRequestSchema,
  AdviceResponseSchema,
  CreateConsultRequestSchema,
  CreateConsultResponseSchema,
  HistoryResponseSchema,
  type AdviceRequest,
  type AdviceResponse,
  type CreateConsultRequest,
  type CreateConsultResponse,
  type HistoryResponse,
} from '@tennis-ai-coach/api-contracts/consult';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { ConsultService } from './consult.service';

@Controller('consult')
export class ConsultController {
  constructor(private readonly consultService: ConsultService) {}

  @Get('history')
  async getHistory(): Promise<HistoryResponse> {
    return HistoryResponseSchema.parse(await this.consultService.getLatest());
  }

  @Post()
  async createConsult(
    @Body(new ZodValidationPipe(CreateConsultRequestSchema))
    body: CreateConsultRequest,
  ): Promise<CreateConsultResponse> {
    return CreateConsultResponseSchema.parse(
      await this.consultService.create(body.userMessage, body.aiMessage),
    );
  }

  @Post('advice')
  async getAdvice(
    @Body(new ZodValidationPipe(AdviceRequestSchema)) body: AdviceRequest,
  ): Promise<AdviceResponse> {
    try {
      return AdviceResponseSchema.parse(
        await this.consultService.getAdvice(body),
      );
    } catch (error) {
      console.error(error);
      throw new HttpException(
        error instanceof Error ? error.message : 'An unexpected error occurred',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
