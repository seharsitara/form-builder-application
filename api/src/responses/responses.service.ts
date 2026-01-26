import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateResponseDto } from './dto/create-response.dto';

@Injectable()
export class ResponsesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(formId: string, dto: CreateResponseDto) {
    const form = await this.prisma.form.findUnique({ where: { id: formId }, include: { questions: true } });
    if (!form) {
      throw new NotFoundException('Form not found');
    }

    const questionIds = new Set(form.questions.map((q) => q.id));
    const invalid = (dto.answers ?? []).find((a) => !questionIds.has(a.questionId));
    if (invalid) {
      throw new BadRequestException(`Question ${invalid.questionId} does not belong to this form`);
    }

    const response = await this.prisma.response.create({
      data: {
        respondent: dto.respondent,
        respondentEmail: dto.respondentEmail,
        score: dto.score,
        maxScore: dto.maxScore,
        userId: dto.userId,
        formId,
        answers: {
          create: dto.answers.map((a) => ({
            questionId: a.questionId,
            value: Array.isArray(a.value) ? JSON.stringify(a.value) : String(a.value),
          })),
        },
      },
      include: { answers: true },
    });

    return response;
  }

  async findByForm(formId: string) {
    const responses = await this.prisma.response.findMany({
      where: { formId },
      include: { answers: true },
      orderBy: { createdAt: 'desc' },
    });
    return responses.map((res) => ({
      ...res,
      answers: res.answers.map((a) => ({
        ...a,
        value: parseValue(a.value),
      })),
    }));
  }
}

function parseValue(raw: string): string | string[] {
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed as string[];
  } catch {
    // not JSON, fall through
  }
  return raw;
}
