import { Injectable } from '@nestjs/common';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import sharp from 'sharp';
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
  rhythm: string;
  style: string;
};

type MotionStep = {
  title: string;
  focus: string;
  phasePrompt: string;
};

type MotionPlan = {
  title: string;
  alt: string;
  prompt: string;
  steps: MotionStep[];
};

const VISUAL_VARIANTS: VisualVariantPreset[] = [
  {
    label: 'contact-point',
    camera: 'side view, full body',
    rhythm: 'clean timing emphasis with an easy-to-read pause at contact',
    style: 'clean tennis coaching illustration with clear body alignment',
  },
  {
    label: 'weight-transfer',
    camera: 'three-quarter front view, full body',
    rhythm: 'smooth weight transfer from loading to finish',
    style: 'instructional sports poster look with readable posture',
  },
  {
    label: 'racket-path',
    camera: 'three-quarter side view, full body',
    rhythm: 'continuous racket path from preparation through follow-through',
    style: 'dynamic coaching diagram feel with simplified court context',
  },
  {
    label: 'balance-and-footwork',
    camera: 'wide shot, full body',
    rhythm: 'balanced footwork and posture at every stage of the motion',
    style: 'beginner-friendly technique illustration with a simple background',
  },
];

const DUMMY_ADVICE_IMAGE_RESPONSE_PATH = resolve(
  __dirname,
  '../../fixtures/dummy-advice-image-response.json',
);
const SEQUENCE_LAYOUT = 'sequence' as const;
const PANEL_GAP = 24;
const PANEL_TOP = 56;
const PANEL_HEIGHT = 300;
const PANEL_FOOTER_HEIGHT = 56;
const BOARD_PADDING = 32;
const BOARD_BACKGROUND = '#020617';
const BOARD_PANEL_BACKGROUND = '#0f172a';
const BOARD_PANEL_BORDER = '#334155';
const STEP_ACCENT_COLORS = ['#38bdf8', '#a3e635', '#f59e0b', '#f97316'];

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

  private isLikelyJapanese(text: string): boolean {
    return /[\u3040-\u30ff\u3400-\u9faf]/.test(text);
  }

  private detectMotionType(
    text: string,
  ): 'serve' | 'volley' | 'backhand' | 'forehand' | 'general' {
    const normalized = text.toLowerCase();

    if (normalized.includes('serve') || normalized.includes('サーブ')) {
      return 'serve';
    }

    if (normalized.includes('volley') || normalized.includes('ボレー')) {
      return 'volley';
    }

    if (
      normalized.includes('backhand') ||
      normalized.includes('バックハンド')
    ) {
      return 'backhand';
    }

    if (
      normalized.includes('forehand') ||
      normalized.includes('フォアハンド')
    ) {
      return 'forehand';
    }

    return 'general';
  }

  private buildFallbackMotionPlan(input: AdviceImageRequest): MotionPlan {
    const useJapanese = this.isLikelyJapanese(`${input.question}\n${input.answer}`);
    const motionType = this.detectMotionType(`${input.question}\n${input.answer}`);

    const plans = {
      serve: useJapanese
        ? {
            title: 'サーブの動作イメージ',
            alt: 'サーブ動作を4段階で示したイメージ図',
            steps: [
              {
                title: 'トスを上げる',
                focus: '軸をぶらさずにトスの高さと位置を安定させます。',
                phasePrompt:
                  'tennis serve toss preparation, arm extended upward, body balanced, trophy pose beginning',
              },
              {
                title: '体をしならせる',
                focus: '膝を使って下半身に力をため、肩をしっかり回します。',
                phasePrompt:
                  'tennis serve loading phase, knees bent, shoulders coiled, racket dropped behind the back',
              },
              {
                title: 'インパクト',
                focus: '打点を高く保ち、ボールの真上へ伸び上がります。',
                phasePrompt:
                  'tennis serve impact, full body extension, racket meeting the ball at the highest contact point',
              },
              {
                title: '振り抜く',
                focus: '体重を前へ送りながら自然にフォロースルーします。',
                phasePrompt:
                  'tennis serve follow-through, racket finishing down across the body, forward momentum landing inside the court',
              },
            ],
          }
        : {
            title: 'Serve Motion Sequence',
            alt: 'Four-step tennis serve motion storyboard',
            steps: [
              {
                title: 'Ball Toss',
                focus: 'Lift the tossing arm smoothly and keep the head steady.',
                phasePrompt:
                  'tennis serve toss preparation, arm extended upward, body balanced, trophy pose beginning',
              },
              {
                title: 'Loading',
                focus: 'Store energy with knee bend and shoulder coil.',
                phasePrompt:
                  'tennis serve loading phase, knees bent, shoulders coiled, racket dropped behind the back',
              },
              {
                title: 'Impact',
                focus: 'Reach tall and meet the ball at the highest point.',
                phasePrompt:
                  'tennis serve impact, full body extension, racket meeting the ball at the highest contact point',
              },
              {
                title: 'Follow-through',
                focus: 'Let the racket travel down naturally as the body moves forward.',
                phasePrompt:
                  'tennis serve follow-through, racket finishing down across the body, forward momentum landing inside the court',
              },
            ],
          },
      volley: useJapanese
        ? {
            title: 'ボレーの動作イメージ',
            alt: 'ボレー動作を3段階で示したイメージ図',
            steps: [
              {
                title: '構える',
                focus: '小さくスプリットステップしてラケット面を準備します。',
                phasePrompt:
                  'tennis volley ready position, split step, compact racket preparation, full body visible',
              },
              {
                title: 'インパクト',
                focus: '体の前でコンパクトに当て、面の向きを安定させます。',
                phasePrompt:
                  'tennis volley contact, compact punch, stable racket face, contact in front of the body',
              },
              {
                title: '戻る',
                focus: '重心を前に使ったまま素早くリカバリーします。',
                phasePrompt:
                  'tennis volley recovery, short follow-through, body staying balanced and ready for the next ball',
              },
            ],
          }
        : {
            title: 'Volley Motion Sequence',
            alt: 'Three-step tennis volley storyboard',
            steps: [
              {
                title: 'Ready',
                focus: 'Use a small split-step and prepare the racket face early.',
                phasePrompt:
                  'tennis volley ready position, split step, compact racket preparation, full body visible',
              },
              {
                title: 'Contact',
                focus: 'Meet the ball in front with a compact, stable punch.',
                phasePrompt:
                  'tennis volley contact, compact punch, stable racket face, contact in front of the body',
              },
              {
                title: 'Recover',
                focus: 'Stay balanced and reset quickly for the next ball.',
                phasePrompt:
                  'tennis volley recovery, short follow-through, body staying balanced and ready for the next ball',
              },
            ],
          },
      backhand: useJapanese
        ? {
            title: 'バックハンドの動作イメージ',
            alt: 'バックハンド動作を4段階で示したイメージ図',
            steps: [
              {
                title: '準備する',
                focus: '体を横向きにして早めにラケットを引きます。',
                phasePrompt:
                  'tennis backhand ready position, unit turn, shoulders turned, full body side view',
              },
              {
                title: 'ためを作る',
                focus: '下半身にためを作り、打点へ入る準備をします。',
                phasePrompt:
                  'tennis backhand loading phase, stable base, racket prepared behind the ball, balanced posture',
              },
              {
                title: 'インパクト',
                focus: '体の前でボールを捉え、軸をぶらさずに押します。',
                phasePrompt:
                  'tennis backhand impact, contact in front of the body, eyes on the ball, weight moving forward',
              },
              {
                title: '振り抜く',
                focus: 'ラケットを最後まで運び、次の構えへ戻ります。',
                phasePrompt:
                  'tennis backhand follow-through, racket finishing through the target line, balanced recovery',
              },
            ],
          }
        : {
            title: 'Backhand Motion Sequence',
            alt: 'Four-step tennis backhand storyboard',
            steps: [
              {
                title: 'Set Up',
                focus: 'Turn the shoulders early and prepare the racket.',
                phasePrompt:
                  'tennis backhand ready position, unit turn, shoulders turned, full body side view',
              },
              {
                title: 'Load',
                focus: 'Build a stable base and move into the hitting zone.',
                phasePrompt:
                  'tennis backhand loading phase, stable base, racket prepared behind the ball, balanced posture',
              },
              {
                title: 'Impact',
                focus: 'Contact the ball in front while keeping the head quiet.',
                phasePrompt:
                  'tennis backhand impact, contact in front of the body, eyes on the ball, weight moving forward',
              },
              {
                title: 'Finish',
                focus: 'Carry the swing through the target and recover.',
                phasePrompt:
                  'tennis backhand follow-through, racket finishing through the target line, balanced recovery',
              },
            ],
          },
      forehand: useJapanese
        ? {
            title: 'フォアハンドの動作イメージ',
            alt: 'フォアハンド動作を4段階で示したイメージ図',
            steps: [
              {
                title: '準備する',
                focus: '体を横向きにしてテイクバックを早めに完了します。',
                phasePrompt:
                  'tennis forehand ready position, unit turn, early take-back, full body visible',
              },
              {
                title: 'ためを作る',
                focus: '下半身にためを作り、打点へ入る形を整えます。',
                phasePrompt:
                  'tennis forehand loading phase, hips coiled, knees flexed, racket prepared below the ball',
              },
              {
                title: 'インパクト',
                focus: '打点を前に置き、体重移動を使って押し込みます。',
                phasePrompt:
                  'tennis forehand impact, contact in front of the body, weight transfer forward, full body form',
              },
              {
                title: '振り抜く',
                focus: 'ラケットを目標方向へ運び、バランスよく終わります。',
                phasePrompt:
                  'tennis forehand follow-through, racket finishing high across the body, balanced recovery stance',
              },
            ],
          }
        : {
            title: 'Forehand Motion Sequence',
            alt: 'Four-step tennis forehand storyboard',
            steps: [
              {
                title: 'Set Up',
                focus: 'Turn early and complete the take-back without rushing.',
                phasePrompt:
                  'tennis forehand ready position, unit turn, early take-back, full body visible',
              },
              {
                title: 'Load',
                focus: 'Store energy in the legs and hips before the swing.',
                phasePrompt:
                  'tennis forehand loading phase, hips coiled, knees flexed, racket prepared below the ball',
              },
              {
                title: 'Impact',
                focus: 'Meet the ball in front and drive through it with weight transfer.',
                phasePrompt:
                  'tennis forehand impact, contact in front of the body, weight transfer forward, full body form',
              },
              {
                title: 'Finish',
                focus: 'Finish through the target and stay balanced.',
                phasePrompt:
                  'tennis forehand follow-through, racket finishing high across the body, balanced recovery stance',
              },
            ],
          },
      general: useJapanese
        ? {
            title: '動作の流れイメージ',
            alt: 'テニス動作を4段階で示したイメージ図',
            steps: [
              {
                title: '構える',
                focus: '体勢を整え、次の動きに入る準備をします。',
                phasePrompt:
                  'tennis ready position, balanced athletic stance, full body visible, clear preparation',
              },
              {
                title: 'ためを作る',
                focus: '下半身と上半身の連動を作ります。',
                phasePrompt:
                  'tennis loading phase, balanced lower body, shoulders coiling, preparing to swing',
              },
              {
                title: 'インパクト',
                focus: 'ボールに対して最も安定した姿勢で当てます。',
                phasePrompt:
                  'tennis impact moment, contact in front of the body, eyes on the ball, stable posture',
              },
              {
                title: 'フィニッシュ',
                focus: '自然に振り抜いて次の準備へ戻ります。',
                phasePrompt:
                  'tennis follow-through and recovery, smooth finish, balanced body posture after the hit',
              },
            ],
          }
        : {
            title: 'Tennis Motion Sequence',
            alt: 'Four-step tennis motion storyboard',
            steps: [
              {
                title: 'Ready',
                focus: 'Set an athletic stance before the movement begins.',
                phasePrompt:
                  'tennis ready position, balanced athletic stance, full body visible, clear preparation',
              },
              {
                title: 'Load',
                focus: 'Create body coordination from the ground up.',
                phasePrompt:
                  'tennis loading phase, balanced lower body, shoulders coiling, preparing to swing',
              },
              {
                title: 'Impact',
                focus: 'Meet the ball with the most stable body shape.',
                phasePrompt:
                  'tennis impact moment, contact in front of the body, eyes on the ball, stable posture',
              },
              {
                title: 'Finish',
                focus: 'Let the swing finish naturally and recover.',
                phasePrompt:
                  'tennis follow-through and recovery, smooth finish, balanced body posture after the hit',
              },
            ],
          },
    };

    const selectedPlan = plans[motionType];

    return {
      ...selectedPlan,
      prompt: selectedPlan.steps.map((step) => step.phasePrompt).join(' | '),
    };
  }

  private async loadDummyAdviceImagePanel(): Promise<Buffer> {
    const rawResponse = await readFile(
      DUMMY_ADVICE_IMAGE_RESPONSE_PATH,
      'utf8',
    );
    const parsed = JSON.parse(rawResponse) as {
      visual?: {
        imageDataUrl?: string;
      };
    };
    const imageDataUrl = parsed.visual?.imageDataUrl;

    if (!imageDataUrl) {
      throw new Error('Dummy advice image response is invalid.');
    }

    return this.decodeDataUrl(imageDataUrl);
  }

  private decodeDataUrl(dataUrl: string): Buffer {
    const [metadata, base64] = dataUrl.split(',', 2);
    if (!metadata?.includes(';base64') || !base64) {
      throw new Error('Invalid image data URL.');
    }

    return Buffer.from(base64, 'base64');
  }

  private buildSequenceOverlay(
    plan: MotionPlan,
    width: number,
    height: number,
    panelWidth: number,
  ): string {
    const stepCount = plan.steps.length;
    const arrowY = PANEL_TOP + PANEL_HEIGHT / 2;
    const panels = plan.steps
      .map((_, index) => {
        const left = BOARD_PADDING + index * (panelWidth + PANEL_GAP);
        const color = STEP_ACCENT_COLORS[index % STEP_ACCENT_COLORS.length];

        return `
          <rect x="${left - 1}" y="${PANEL_TOP - 1}" width="${panelWidth + 2}" height="${PANEL_HEIGHT + 2}" rx="20" fill="none" stroke="${BOARD_PANEL_BORDER}" stroke-width="2" />
          <rect x="${left + 16}" y="${PANEL_TOP + 16}" width="${panelWidth - 32}" height="8" rx="4" fill="${color}" opacity="0.9" />
          <circle cx="${left + 28}" cy="${PANEL_TOP + 50}" r="12" fill="${color}" />
        `;
      })
      .join('');

    const arrows = Array.from({ length: stepCount - 1 }, (_, index) => {
      const left = BOARD_PADDING + (index + 1) * panelWidth + index * PANEL_GAP;
      const arrowLeft = left + 6;
      const arrowRight = left + PANEL_GAP - 6;
      const color = STEP_ACCENT_COLORS[(index + 1) % STEP_ACCENT_COLORS.length];

      return `
        <path d="M ${arrowLeft} ${arrowY} L ${arrowRight} ${arrowY}" stroke="${color}" stroke-width="4" stroke-linecap="round" />
        <path d="M ${arrowRight - 10} ${arrowY - 10} L ${arrowRight} ${arrowY} L ${arrowRight - 10} ${arrowY + 10}" stroke="${color}" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round" />
      `;
    }).join('');

    return `
      <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
        <rect x="12" y="12" width="${width - 24}" height="${height - 24}" rx="28" fill="none" stroke="#0f172a" stroke-width="2" />
        ${panels}
        ${arrows}
      </svg>
    `;
  }

  private async composeSequenceBoard(
    images: Buffer[],
    plan: MotionPlan,
  ): Promise<string> {
    const stepCount = plan.steps.length;
    const panelWidth = stepCount === 3 ? 360 : 320;
    const width =
      BOARD_PADDING * 2 +
      panelWidth * stepCount +
      PANEL_GAP * (stepCount - 1);
    const height = PANEL_TOP + PANEL_HEIGHT + PANEL_FOOTER_HEIGHT;

    const panelBuffers = await Promise.all(
      images.map((image) =>
        sharp(image)
          .resize({
            width: panelWidth,
            height: PANEL_HEIGHT,
            fit: 'cover',
            position: 'centre',
          })
          .png()
          .toBuffer(),
      ),
    );

    const composites = panelBuffers.map((input, index) => ({
      input,
      left: BOARD_PADDING + index * (panelWidth + PANEL_GAP),
      top: PANEL_TOP,
    }));

    const overlay = Buffer.from(
      this.buildSequenceOverlay(plan, width, height, panelWidth),
    );

    const buffer = await sharp({
      create: {
        width,
        height,
        channels: 4,
        background: BOARD_BACKGROUND,
      },
    })
      .composite([...composites, { input: overlay, top: 0, left: 0 }])
      .png()
      .toBuffer();

    return `data:image/png;base64,${buffer.toString('base64')}`;
  }

  private async buildMotionPlan(input: AdviceImageRequest): Promise<MotionPlan> {
    const fallbackPlan = this.buildFallbackMotionPlan(input);
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return fallbackPlan;
    }

    const preset = this.getVariantPreset(input.variant);
    const systemPrompt = `
      You are designing a tennis coaching storyboard.
      Return valid JSON with keys "title", "alt", and "steps".

      Rules:
      - Create 3 to 4 sequential motion steps.
      - "title" and each step's "title" and "focus" must use the same language as the user's question and coaching answer.
      - Each step must include "phasePrompt" in English for image generation.
      - The motion must show the movement from start to finish, not isolated unrelated poses.
      - Keep camera angle, player, outfit, and scene consistent across all steps.
      - If the question is about serving, include toss, loading, impact, and follow-through.
      - If the question is about volleys, include ready, contact, and recovery.
      - The "focus" text should be short coaching guidance for that exact step.
    `.trim();

    const userPrompt = `
      Variant label: ${preset.label}
      Camera guidance: ${preset.camera}
      Motion rhythm: ${preset.rhythm}
      Illustration style: ${preset.style}

      Player level: ${input.level ?? 'Not specified'}
      Playing style: ${input.playStyle ?? 'Not specified'}

      User question:
      ${input.question}

      Coaching answer:
      ${input.answer}
    `.trim();

    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: process.env.OPENAI_MODEL ?? 'gpt-5.4-nano',
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
        console.error('OpenAI motion plan generation error:', errorText);
        return fallbackPlan;
      }

      const data = (await res.json()) as OpenAIResponse;
      const content = data.choices?.[0]?.message?.content;

      if (!content) {
        return fallbackPlan;
      }

      const parsed = JSON.parse(content) as Partial<{
        title: string;
        alt: string;
        steps: Array<Partial<MotionStep>>;
      }>;

      const steps =
        parsed.steps
          ?.map((step) => ({
            title: step.title?.trim(),
            focus: step.focus?.trim(),
            phasePrompt: step.phasePrompt?.trim(),
          }))
          .filter(
            (step): step is MotionStep =>
              Boolean(step.title && step.focus && step.phasePrompt),
          )
          .slice(0, 4) ?? [];

      if (steps.length < 3) {
        return fallbackPlan;
      }

      return {
        title: parsed.title?.trim() || fallbackPlan.title,
        alt: parsed.alt?.trim() || fallbackPlan.alt,
        prompt: steps.map((step) => step.phasePrompt).join(' | '),
        steps,
      };
    } catch (error) {
      console.error('Failed to build motion plan:', error);
      return fallbackPlan;
    }
  }

  private async generateStepImage(
    request: AdviceImageRequest,
    step: MotionStep,
    plan: MotionPlan,
  ): Promise<Buffer> {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return this.loadDummyAdviceImagePanel();
    }

    const preset = this.getVariantPreset(request.variant);
    const prompt = `
      Create one single panel for a tennis coaching storyboard.
      Keep the same player, outfit, court, camera angle, and illustration style across every panel.
      Do not create multiple panels. Show only one moment.
      Use ${preset.camera}.
      Use ${preset.style}.
      Emphasize ${preset.rhythm}.
      Player level: ${request.level ?? 'Not specified'}.
      Playing style: ${request.playStyle ?? 'Not specified'}.
      Storyboard title: ${plan.title}.
      Panel title: ${step.title}.
      Coaching focus: ${step.focus}.
      Motion moment: ${step.phasePrompt}.
      Show a full-body tennis player with clear technique and simple background.
      Do not include text, labels, speech bubbles, or watermarks inside the generated image.
    `.trim();

    const res = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_IMAGE_MODEL ?? 'gpt-image-2',
        prompt,
        size: '1024x1024',
        quality: 'medium',
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

    return Buffer.from(imageBase64, 'base64');
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
        model: process.env.OPENAI_MODEL ?? 'gpt-5.4-nano',
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
    const plan = await this.buildMotionPlan(request);
    const apiKey = process.env.OPENAI_API_KEY;
    const panelImages = apiKey
      ? await Promise.all(
          plan.steps.map((step) => this.generateStepImage(request, step, plan)),
        )
      : await Promise.all(plan.steps.map(() => this.loadDummyAdviceImagePanel()));
    const imageDataUrl = await this.composeSequenceBoard(panelImages, plan);

    return AdviceImageResponseSchema.parse({
      visual: {
        imageDataUrl,
        alt: plan.alt,
        prompt: plan.prompt,
        variant: request.variant,
        layout: SEQUENCE_LAYOUT,
        steps: plan.steps.map(({ title, focus }) => ({ title, focus })),
      },
    });
  }
}
