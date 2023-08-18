import { Injectable } from '@nestjs/common';
import { UserData } from '@/shared/interfaces/user';
import { UserRepository } from '@/module/user/repositories/user.repository';

@Injectable()
export class UserService {
  constructor(private userRepository: UserRepository) {}

  async create(data: { email: string }): Promise<UserData> {
    const userData: Partial<UserData> = data;
    const createdUser = await this.userRepository.create(userData);
    return createdUser;
  }

  async findById(userId: string): Promise<UserData | null> {
    const user = await this.userRepository.findById(userId);
    return user;
  }

  async updateInfo(
    userId: string,
    { email }: { email: string },
  ): Promise<UserData> {
    const exists = await this.exists([userId]);
    if (!exists) throw new Error('User does not exist.');
    const updatedUser = await this.userRepository.update(userId, {
      email,
    });
    return updatedUser;
  }

  async delete(userId: string): Promise<UserData> {
    const exists = await this.exists([userId]);
    if (!exists) throw new Error('User does not exist.');
    const updatedUser = await this.userRepository.update(userId, {
      deletedAt: new Date(),
    });
    return updatedUser;
  }

  async exists(userIds: string[]): Promise<boolean> {
    return this.userRepository.exists(userIds);
  }

  async emailExists(emails: string[]): Promise<boolean> {
    return this.userRepository.emailsExists(emails);
  }
}
