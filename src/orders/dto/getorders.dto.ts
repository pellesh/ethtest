import { IsString, IsOptional } from 'class-validator';

export class getOrdersDTO {
  @IsOptional()
  @IsString()
  tokenA: string;

  @IsOptional()
  @IsString()
  tokenB: string;

  @IsOptional()
  @IsString()
  user: string;
}
