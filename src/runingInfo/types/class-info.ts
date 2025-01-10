import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ClassInfo {
  @Field(() => String, { nullable: true })
  classId?: string;

  @Field(() => String, { nullable: true })
  beforeGrade?: string;

  @Field(() => String, { nullable: true })
  afterGrade?: string;

  @Field(() => Number)
  count?: number;
}

@ObjectType()
export class TotalClassInfo {
  @Field(() => String, { nullable: true })
  id?: string;

  @Field(() => String, { nullable: true })
  name?: string;

  @Field(() => [ClassInfo], { nullable: true }) // ClassInfo 객체 배열
  classInfo?: ClassInfo[];
}
