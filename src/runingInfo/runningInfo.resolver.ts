import { Resolver, Query, Args, Int } from '@nestjs/graphql';
import { RunningInfoService } from './runningInfo.service';
import { RunningInfoEntity } from './runningInfo.entity';

@Resolver(() => RunningInfoEntity)
export class RunningInfoResolver {
  constructor(private readonly runningInfoService: RunningInfoService) {}

  @Query(() => RunningInfoEntity)
  async getRunningInfoByIdGQL(
    @Args('id', { type: () => Int }) id: number, // GraphQL의 Int로 명시
  ): Promise<RunningInfoEntity> {
    const runningInfo = await this.runningInfoService.getRunningInfoById(id);

    if (runningInfo) {
      return runningInfo;
    }

    return null; // 데이터가 없는 경우 null 반환
  }
}
