import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateFormDto } from './dto/create-form.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FormsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateFormDto, creatorId: string) {
    const form = await this.prisma.form.create({
      data: {
        title: dto.title,
        description: dto.description,
        isQuiz: dto.isQuiz ?? false,
        creatorId,
        questions: {
          create: (dto.questions ?? []).map((q, index) => ({
            label: q.label,
            type: q.type,
            required: q.required,
            options: q.options ?? [],
            order: index,
          })),
        },
      },
      include: { questions: true },
    });
    return form;
  }

  async findAll() {
    return this.prisma.form.findMany({
      include: { questions: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const found = await this.prisma.form.findUnique({
      where: { id },
      include: { questions: true },
    });
    if (!found) {
      throw new NotFoundException('Form not found');
    }
    return found;
  }
}
