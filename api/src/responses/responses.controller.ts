import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CreateResponseDto } from './dto/create-response.dto';
import { ResponsesService } from './responses.service';

@Controller('forms/:formId/responses')
export class ResponsesController {
  constructor(private readonly responsesService: ResponsesService) {}

  @Post()
  create(@Param('formId') formId: string, @Body() dto: CreateResponseDto) {
    return this.responsesService.create(formId, dto);
  }

  @Get()
  findAll(@Param('formId') formId: string) {
    return this.responsesService.findByForm(formId);
  }
}
