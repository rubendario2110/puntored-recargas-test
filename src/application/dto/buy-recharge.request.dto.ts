import { IsInt, IsNotEmpty, IsString, Matches, Max, Min } from 'class-validator';

export class BuyRechargeRequestDTO {
  @IsInt()
  @Min(1000)
  @Max(100000)
  amount!: number;

  @IsString()
  @IsNotEmpty()
  @Matches(/^3\d{9}$/)
  phoneNumber!: string;
}
