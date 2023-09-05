import { Injectable } from '@nestjs/common';
import { ResourceUsageRepository } from '../repositories/resourceUsage.repository';
import { BillableResource, ResourceUsageData } from '@/shared/interfaces/usage';

@Injectable()
export class ResourceUsageService {
  constructor(private resourceUsageRepository: ResourceUsageRepository) {}

  async onResourceUsed(data: {
    botId: string;
    userId: string;
    resource: BillableResource;
  }): Promise<ResourceUsageData> {
    const createdResourceUsage = await this.resourceUsageRepository.create(
      data,
    );
    return createdResourceUsage;
  }

  async findById(resourceUsageId: string): Promise<ResourceUsageData | null> {
    const resourceUsage = await this.resourceUsageRepository.findById(
      resourceUsageId,
    );
    return resourceUsage;
  }

  async exists(resourceUsageIds: string[]): Promise<boolean> {
    return this.resourceUsageRepository.exists(resourceUsageIds);
  }

  async findUsagesByUserId(
    userId: string,
    from: Date,
    to: Date,
  ): Promise<ResourceUsageData[]> {
    const usages = await this.resourceUsageRepository.find({
      userId,
      from,
      to,
    });
    return usages;
  }

  async findUsagesByBotId(
    botId: string,
    from: Date,
    to: Date,
  ): Promise<ResourceUsageData[]> {
    const usages = await this.resourceUsageRepository.find({
      botId,
      from,
      to,
    });
    return usages;
  }
}
