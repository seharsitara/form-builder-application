import { Controller, Get } from '@nestjs/common';

@Controller()
export class RootController {
  @Get()
  root() {
    return {
      name: 'Form Builder API',
      status: 'ok',
      docs: '/docs',
    };
  }
}
