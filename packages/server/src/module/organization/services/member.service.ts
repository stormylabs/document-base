import { Injectable } from '@nestjs/common';
import { MemberData } from '@/shared/interfaces/member';
import { MemberRepository } from '@/module/organization/repositories/member.repository';
import { AccessLevel } from '@/shared/interfaces/accessLevel';

@Injectable()
export class MemberService {
  constructor(private memberRepository: MemberRepository) {}

  async create(memberData: {
    userId: string;
    organizationId: string;
    accessLevel?: AccessLevel;
  }): Promise<MemberData> {
    const createdMember = await this.memberRepository.create(memberData);
    return createdMember;
  }

  async findById(memberId: string): Promise<MemberData | null> {
    const member = await this.memberRepository.findById(memberId);
    return member;
  }

  async findMemberByUserId(queries: {
    userId: string;
    organizationId: string;
  }): Promise<MemberData> {
    const member = await this.memberRepository.findMemberByUserId(queries);
    return member;
  }

  /**
   * getMemberOfOrganization
   *
   * Get all member of organization
   *
   * @param orgId
   * @returns
   */
  async getMemberOfOrganization(orgId: string): Promise<MemberData[]> {
    const members = await this.memberRepository.findMembersByOrgId(orgId);
    return members;
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
