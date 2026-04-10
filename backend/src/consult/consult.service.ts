import { Injectable } from '@nestjs/common';
import {
  AdviceResponseSchema,
  type AdviceRequest,
  type AdviceResponse,
} from '@tennis-ai-coach/api-contracts/consult';
import { PrismaService } from '../prisma/prisma.service';
import { ConsultHistory } from '@prisma/client';

interface OpenAIResponse {
  choices?: {
    message?: {
      content?: string;
    };
  }[];
}

@Injectable()
export class ConsultService {
  constructor(private readonly prisma: PrismaService) {}

  getLatest(): Promise<ConsultHistory[]> {
    return this.prisma.consultHistory.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
    });
  }

  create(userMessage: string, aiMessage: string) {
    return this.prisma.consultHistory.create({
      data: {
        userMessage,
        aiMessage,
      },
    });
  }

  async getAdvice(request: AdviceRequest): Promise<AdviceResponse> {
    const { question, level, playStyle } = request;

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    const systemPrompt = `
      You are a professional tennis coach.
      Based on the user's challenges and playing style, provide clear improvement points and practice methods.

      Always include the following:
      - Potential cause points (form / rhythm / weight transfer / contact point, etc.)
      - 2-3 "checkpoints"
      - Specific practice drills that can be done alone
      - Add precautions as needed
      `.trim();

    const userContext = `
      [Player Information]
      - Level: ${level ?? 'Not specified'}
      - Playing Style: ${playStyle ?? 'Not specified'}

      [Consultation Content]
      ${question}
          `.trim();

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL ?? 'gpt-5-nano',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userContext },
        ],
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('OpenAI API error:', errorText);
      throw new Error('Failed to call OpenAI API');
    }

    const data = (await res.json()) as OpenAIResponse;
    const answer: string =
      data.choices?.[0]?.message?.content ??
      'Sorry, could not generate a response. Please try again.';
    const response = AdviceResponseSchema.parse({ answer });

    await this.create(question, response.answer);

    return response;
  }
}
