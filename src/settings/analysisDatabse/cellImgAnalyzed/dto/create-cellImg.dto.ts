import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { IsInt } from 'class-validator';

@ObjectType()
@InputType()
export class CellImgAnalyzedDto {
  @IsInt()
  @Field(() => Int)
  id: number;

  @Field(() => String, { nullable: true })
  analysisType?: string;

  @Field(() => String, { nullable: true })
  LPCaptureCount?: string;

  @Field(() => String, { nullable: true })
  iaRootPath?: string;

  @Field(() => Boolean, { nullable: true })
  isAlarm?: boolean;

  @Field(() => String, { nullable: true })
  alarmCount?: string;

  @Field(() => Boolean, { nullable: true })
  keepPage?: boolean;

  @Field(() => String, { nullable: true })
  backupPath?: string;

  @Field(() => Date, { nullable: true })
  backupStartDate?: Date;

  @Field(() => Date, { nullable: true })
  backupEndDate?: Date;

  @Field(() => String, { nullable: true })
  autoBackUpMonth?: string;

  @Field(() => Date, { nullable: true })
  autoBackUpStartDate?: Date;
}
