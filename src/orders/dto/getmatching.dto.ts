import { IsString, IsNumberString, IsBooleanString } from 'class-validator';

export class getMatchingOrdersDTO {
  @IsString()
  tokenA: string;

  @IsString()
  tokenB: string;

  @IsNumberString()
  amountA: number;

  @IsNumberString()
  amountB: string;

  @IsBooleanString()
  isMarket: boolean;
}
