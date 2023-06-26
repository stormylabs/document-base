import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  constructor() {
    //
  }

  @Get('/health')
  getHealthCheck() {
    return {
      status: 200,
      message: 'Service is alive',
    };
  }
}
