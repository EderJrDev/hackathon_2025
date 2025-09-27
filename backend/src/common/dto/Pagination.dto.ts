import { IsNumber, IsOptional, IsPositive, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class PaginationDto {
  @IsNumber()
  @IsPositive()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  page: number = 1;
}
