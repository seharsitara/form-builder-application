import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { CreateFormDto } from './dto/create-form.dto';
import { FormsService } from './forms.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('forms')
export class FormsController {
  constructor(private readonly formsService: FormsService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('creator', 'admin')
  create(@Body() body: CreateFormDto, @Req() req: any) {
    return this.formsService.create(body, req.user.id);
  }

  @Get()
  findAll() {
    return this.formsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.formsService.findOne(id);
  }
}
