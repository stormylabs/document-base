import { ApiProperty } from '@nestjs/swagger';

import { IsArray, IsNotEmpty, MinLength } from 'class-validator';

export default class ExecuteEngagementDTO {
  @ApiProperty({
    type: 'string',
    description: 'Message',
    minLength: 1,
    required: true,
    default: 'default',
    example: 'Can you introduce a mattress that is environmentally friendly',
  })
  @IsNotEmpty()
  message: string;

  @ApiProperty({
    type: 'string[]',
    description: 'Conversation history',
    required: true,
    default: [],
    example: [
      'User: hi? <END_OF_TURN>',
      '<SalesAgent>: Hello! This is <SalesAgent> from Stormy Labs. How are you today? <END_OF_TURN>',
      'User: Why are you calling? <END_OF_TURN>',
      "<SalesAgent>: I'm calling to discuss how Stormy Labs can help you achieve a better night's sleep. We specialize in providing exceptional sleep solutions. Are you currently looking to improve your sleep quality? <END_OF_TURN>",
    ],
  })
  @IsArray()
  @IsNotEmpty()
  conversationHistory: string[];

  @ApiProperty({ type: 'string', description: 'Engagement ID', required: true })
  @IsNotEmpty()
  engagementId: string;
}
