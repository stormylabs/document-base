import {
  COST_PER_BOT_PER_SECOND,
  COST_PER_MESSAGE,
  COST_PER_TRAINING,
} from '../constants/costs';
import {
  BotUsageData,
  ResourceUsageData,
  BillableResource,
} from '../interfaces/usage';

export const getCostsInPeriod = (
  botUsage: BotUsageData[],
  resourceUsage: ResourceUsageData[],
  start: Date,
  end: Date,
) => {
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
    return acc + timeElapsed * COST_PER_BOT_PER_SECOND;
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
  };
};
