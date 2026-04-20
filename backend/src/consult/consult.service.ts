import { Injectable } from '@nestjs/common';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import {
  AdviceImageResponseSchema,
  AdviceResponseSchema,
  type AdviceImageRequest,
  type AdviceImageResponse,
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

interface OpenAIImageResponse {
  data?: {
    b64_json?: string;
  }[];
}

type VisualVariantPreset = {
  label: string;
  camera: string;
  focus: string;
  style: string;
};

const VISUAL_VARIANTS: VisualVariantPreset[] = [
  {
    label: 'contact-point',
    camera: 'side view, full body',
    focus: 'contact point in front of the body and stable head position',
    style: 'clean tennis coaching illustration with clear body alignment',
  },
  {
    label: 'weight-transfer',
    camera: 'three-quarter front view, full body',
    focus: 'forward weight transfer from the back leg to the front leg',
    style: 'instructional sports poster look with readable posture',
  },
  {
    label: 'racket-path',
    camera: 'three-quarter side view, full body',
    focus: 'racket path and follow-through direction after contact',
    style: 'dynamic coaching diagram feel with simplified court context',
  },
  {
    label: 'balance-and-footwork',
    camera: 'wide shot, full body',
    focus: 'balance, knee bend, and footwork spacing during the stroke',
    style: 'beginner-friendly technique illustration with a simple background',
  },
];

const DUMMY_ADVICE_IMAGE_RESPONSE_PATH = resolve(
  __dirname,
  '../../fixtures/dummy-advice-image-response.json',
);

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

  private getVariantPreset(variant: number): VisualVariantPreset {
    return VISUAL_VARIANTS[(variant - 1) % VISUAL_VARIANTS.length];
  }

  private async loadDummyAdviceImageResponse(): Promise<AdviceImageResponse> {
    const rawResponse = await readFile(
      DUMMY_ADVICE_IMAGE_RESPONSE_PATH,
      'utf8',
    );

    return AdviceImageResponseSchema.parse(JSON.parse(rawResponse));
  }

  private async buildVisualPrompt(
    input: AdviceImageRequest,
  ): Promise<{ prompt: string; alt: string }> {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error(
        'Image generation requires OPENAI_API_KEY to be configured.',
      );
    }

    const preset = this.getVariantPreset(input.variant);

    const systemPrompt = `
      You write prompts for instructional tennis illustrations.
      Return valid JSON with keys "prompt" and "alt".

      Rules:
      - The prompt must be in English.
      - Show a tennis player as a human figure in motion.
      - Make the body movement clear and educational.
      - Keep the court background simple and secondary.
      - Do not include text, letters, captions, speech bubbles, or watermarks inside the generated image.
      - Prefer an instructional sports illustration instead of a photorealistic style.
      - The alt text should be short and written in English.
    `.trim();

    const userPrompt = `
      Player level: ${input.level ?? 'Not specified'}
      Playing style: ${input.playStyle ?? 'Not specified'}
      Variant focus: ${preset.label}
      Camera guidance: ${preset.camera}
      Technique emphasis: ${preset.focus}
      Illustration style: ${preset.style}

      Original question:
      ${input.question}

      Coaching advice:
      ${input.answer}
    `.trim();

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL ?? 'gpt-5-nano',
        response_format: {
          type: 'json_object',
        },
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('OpenAI prompt generation error:', errorText);
      throw new Error('Failed to prepare the illustration prompt');
    }

    const data = (await res.json()) as OpenAIResponse;
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('Failed to prepare the illustration prompt');
    }

    const parsed = JSON.parse(content) as Partial<{
      prompt: string;
      alt: string;
    }>;

    if (!parsed.prompt || !parsed.alt) {
      throw new Error('Failed to prepare the illustration prompt');
    }

    return {
      prompt: parsed.prompt,
      alt: parsed.alt,
    };
  }

  async getAdvice(request: AdviceRequest): Promise<AdviceResponse> {
    const { question, level, playStyle } = request;

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      const answer = `
        This is standard advice.
        If you want an answer that directly addresses your question, please set OPENAI_API_KEY.

        Sample advice:

        Based on your question, first check whether your swing timing, contact point, and balance are stable.

        Checkpoints:
        - Keep your eyes on the ball until contact
        - Make sure your weight shifts forward smoothly
        - Avoid overswinging when you are under pressure

        Solo drills:
        - Do 20 shadow swings while checking your contact point
        - Rally against a wall with a controlled tempo for 5-10 minutes
        - Record your form and review your posture and follow-through

        Precautions:
        - Increase practice intensity gradually to avoid shoulder or elbow strain
        - If your shots break down, reduce power and rebuild your rhythm first
      `.trim();

      await this.create(question, answer);

      return { answer };
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

  async generateAdviceImage(
    request: AdviceImageRequest,
  ): Promise<AdviceImageResponse> {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return this.loadDummyAdviceImageResponse();
    }

    const { prompt, alt } = await this.buildVisualPrompt(request);
    const res = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_IMAGE_MODEL ?? 'gpt-image-1-mini',
        prompt,
        size: '1024x1024',
        quality: 'low',
        output_format: 'png',
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('OpenAI image generation error:', errorText);
      throw new Error('Failed to generate the illustration');
    }

    const data = (await res.json()) as OpenAIImageResponse;
    const imageBase64 = data.data?.[0]?.b64_json;

    if (!imageBase64) {
      throw new Error('Failed to generate the illustration');
    }

    return AdviceImageResponseSchema.parse({
      visual: {
        imageDataUrl: `data:image/png;base64,${imageBase64}`,
        alt,
        prompt,
        variant: request.variant,
      },
    });
  }
}
