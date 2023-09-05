export enum BillableResource {
  Message = 'message',
  Training = 'training',
}

export interface ResourceUsageData {
  _id: string;
  bot: string;
  user: string;
  resource: BillableResource;
  createdAt: Date;
}

export interface BotUsageData {
  _id: string;
  bot: string;
  user: string;
  days: number;
  activatedAt: Date;
  disabledAt: Date;
}
