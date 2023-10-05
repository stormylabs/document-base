import {
  COST_PER_TOKEN_PER_BOT_PER_SECOND,
  COST_PER_MESSAGE,
  COST_PER_TRAINING,
} from '../constants/costs';
import {
  BotUsageData,
  ResourceUsageData,
  BillableResource,
} from '../interfaces/usage';

export const getCostsInPeriod = (
  botUsage: Array<BotUsageData & { tokens: number }>,
  resourceUsage: ResourceUsageData[],
  start: Date,
  end: Date,
) => {
  let tokens = 0;
  const botCost = botUsage.reduce((acc, usage) => {
    const now = new Date();
    const activePeriodStart =
      start >= usage.createdAt ? start : usage.createdAt;
    let activePeriodEnd = end;
    if (usage.deletedAt) {
      activePeriodEnd = end >= usage.deletedAt ? usage.deletedAt : end;
    } else {
      activePeriodEnd = end >= now ? now : end;
    }
    const timeElapsed =
      (activePeriodEnd.getTime() - activePeriodStart.getTime()) / 1000;

    tokens += usage.tokens;
    return acc + timeElapsed * COST_PER_TOKEN_PER_BOT_PER_SECOND * usage.tokens;
  }, 0);
  const resourceCost = resourceUsage.reduce((acc, usage) => {
    if (usage.resource === BillableResource.Message) {
      return acc + COST_PER_MESSAGE;
    }
    return acc + COST_PER_TRAINING;
  }, 0);

  return {
    bot: botCost,
    resource: resourceCost,
    total: botCost + resourceCost,
    tokens,
  };
};
