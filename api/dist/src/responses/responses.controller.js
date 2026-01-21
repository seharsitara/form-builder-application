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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponsesController = void 0;
const common_1 = require("@nestjs/common");
const create_response_dto_1 = require("./dto/create-response.dto");
const responses_service_1 = require("./responses.service");
let ResponsesController = class ResponsesController {
    responsesService;
    constructor(responsesService) {
        this.responsesService = responsesService;
    }
    create(formId, dto) {
        return this.responsesService.create(formId, dto);
    }
    findAll(formId) {
        return this.responsesService.findByForm(formId);
    }
};
exports.ResponsesController = ResponsesController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Param)('formId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_response_dto_1.CreateResponseDto]),
    __metadata("design:returntype", void 0)
], ResponsesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Param)('formId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ResponsesController.prototype, "findAll", null);
exports.ResponsesController = ResponsesController = __decorate([
    (0, common_1.Controller)('forms/:formId/responses'),
    __metadata("design:paramtypes", [responses_service_1.ResponsesService])
], ResponsesController);
//# sourceMappingURL=responses.controller.js.map