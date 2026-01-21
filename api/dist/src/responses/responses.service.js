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
exports.ResponsesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ResponsesService = class ResponsesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(formId, dto) {
        const form = await this.prisma.form.findUnique({ where: { id: formId }, include: { questions: true } });
        if (!form) {
            throw new common_1.NotFoundException('Form not found');
        }
        const questionIds = new Set(form.questions.map((q) => q.id));
        const invalid = (dto.answers ?? []).find((a) => !questionIds.has(a.questionId));
        if (invalid) {
            throw new common_1.BadRequestException(`Question ${invalid.questionId} does not belong to this form`);
        }
        const response = await this.prisma.response.create({
            data: {
                respondent: dto.respondent,
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
    async findByForm(formId) {
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
};
exports.ResponsesService = ResponsesService;
exports.ResponsesService = ResponsesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ResponsesService);
function parseValue(raw) {
    try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed))
            return parsed;
    }
    catch {
    }
    return raw;
}
//# sourceMappingURL=responses.service.js.map