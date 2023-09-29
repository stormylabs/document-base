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

export const getCostsFromUsage = (
  botUsage: BotUsageData[],
  resourceUsage: ResourceUsageData[],
  start: Date,
) => {
  const botCost = botUsage.reduce((acc, usage) => {
    const periodStart = usage.createdAt > start ? usage.createdAt : start;
    const periodEnd = usage.deletedAt || new Date();
    const timeElapsed = (periodEnd.getTime() - periodStart.getTime()) / 1000;
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
