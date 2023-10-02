import { Injectable } from '@nestjs/common';
import { MemberData } from '@/shared/interfaces/member';
import { MemberRepository } from '@/module/organization/repositories/member.repository';

@Injectable()
export class MemberService {
  constructor(private memberRepository: MemberRepository) {}

  async create(memberData: {
    userId: string;
    organizationId: string;
  }): Promise<MemberData> {
    const createdOrg = await this.memberRepository.create(memberData);
    return createdOrg;
  }

  async findById(memberId: string): Promise<MemberData | null> {
    const org = await this.memberRepository.findById(memberId);
    return org;
  }

  async findMemberByUserId(userId: string): Promise<MemberData | null> {
    const org = await this.memberRepository.findMemberByUserId(userId);
    return org;
  }

  async delete(memberId: string): Promise<MemberData> {
    const exists = await this.exists([memberId]);
    if (!exists) throw new Error('Member does not exist.');
    const updatedOrg = await this.memberRepository.update(memberId, {
      deletedAt: new Date(),
    });
    return updatedOrg;
  }

  async exists(memberIds: string[]): Promise<boolean> {
    return this.memberRepository.exists(memberIds);
  }
}
