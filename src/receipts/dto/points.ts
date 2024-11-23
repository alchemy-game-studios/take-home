import { IsInt, Min } from 'class-validator';

export class PointsDTO {
  @IsInt()
  @Min(0)
  points: number;
}
