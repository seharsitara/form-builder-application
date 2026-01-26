import { Type } from 'class-transformer';
import { IsArray, IsEmail, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';

class AnswerDto {
  @IsString()
  questionId: string;

  // Accept raw string or pre-stringified array; validation keeps it simple
  @IsString()
  value: string;
}

export class CreateResponseDto {
  @IsOptional()
  @IsString()
  respondent?: string;

  @IsOptional()
  @IsEmail()
  respondentEmail?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  score?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxScore?: number;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AnswerDto)
  answers: AnswerDto[];
}
