"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FormsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let FormsService = class FormsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto, creatorId) {
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
                        correctAnswers: q.correctAnswers ?? [],
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
    async findOne(id) {
        const found = await this.prisma.form.findUnique({
            where: { id },
            include: { questions: true },
        });
        if (!found) {
            throw new common_1.NotFoundException('Form not found');
        }
        return found;
    }
};
exports.FormsService = FormsService;
exports.FormsService = FormsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], FormsService);
//# sourceMappingURL=forms.service.js.map