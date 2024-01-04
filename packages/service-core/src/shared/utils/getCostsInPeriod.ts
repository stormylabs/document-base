import { Logger } from '@nestjs/common';
import {
  COST_PER_TOKEN_PER_BOT_PER_DAY,
  COST_PER_MESSAGE,
  COST_PER_TRAINING,
  MAX_TOKENS_PER_BOT,
} from '../constants/costs';
import {
  BotUsageData,
  ResourceUsageData,
  BillableResource,
} from '../interfaces/usage';
import { differenceInDays } from 'date-fns';

export const getCostsInPeriod = (
  botUsage: Array<BotUsageData>,
  resourceUsage: ResourceUsageData[],
  start: Date,
  end: Date,
) => {
  let tokens = 0;
  const botCost = botUsage.reduce((acc, usage) => {
    Logger.log(`calculating bot usage: ${usage?._id}`);
    Logger.log(`calculating bot usage bot: ${usage?.bot?._id}`);

    const now = new Date();
    const activePeriodStart =
      start >= usage.createdAt ? start : usage.createdAt;
    let activePeriodEnd = end;
    if (usage.deletedAt) {
      activePeriodEnd = end >= usage.deletedAt ? usage.deletedAt : end;
    } else {
      activePeriodEnd = end >= now ? now : end;
    }

    const daysActive = differenceInDays(activePeriodEnd, activePeriodStart);

    tokens += usage?.bot?.totalTokens || 0;
    return (
      acc +
      (daysActive * COST_PER_TOKEN_PER_BOT_PER_DAY * usage?.bot?.totalTokens ||
        0) /
        MAX_TOKENS_PER_BOT
    );
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
