import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ClassInfo {
  @Field(() => String, { nullable: true })
  classId?: string;

  @Field(() => String, { nullable: true })
  classNm?: string;

  @Field(() => String, { nullable: true })
  degree?: string;
}

@ObjectType()
export class MoInfo {
  @Field(() => [ClassInfo], { nullable: true }) // ClassInfo 객체 배열
  classInfo?: ClassInfo[];

  @Field(() => String, { nullable: true })
  categoryId?: string;

  @Field(() => String, { nullable: true })
  categoryNm?: string;
}
