import { Challenge, PushupChallengeRepository } from '@/types/excercise';
import { User } from '@/types/user';

export class LocalStoragePushupChallengeRepository
  implements PushupChallengeRepository
{
  private usersKey = 'users';
  private challengesKey = 'challenges';

  // Helper methods for localStorage
  private loadFromStorage<T>(key: string): T[] {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  }

  private saveToStorage<T>(key: string, data: T[]): void {
    localStorage.setItem(key, JSON.stringify(data));
  }

  // User methods
  async getUsers(): Promise<User[]> {
    return this.loadFromStorage<User>(this.usersKey);
  }

  async addUser(user: User): Promise<void> {
    const users = this.loadFromStorage<User>(this.usersKey);
    users.push(user);
    this.saveToStorage(this.usersKey, users);
  }

  // Challenge methods
  async getChallenges(): Promise<Challenge[]> {
    return this.loadFromStorage<Challenge>(this.challengesKey);
  }

  async addChallenge(challenge: Challenge): Promise<void> {
    const challenges = this.loadFromStorage<Challenge>(this.challengesKey);
    challenges.push(challenge);
    this.saveToStorage(this.challengesKey, challenges);
  }

  async joinChallenge(userId: string, challengeId: string): Promise<void> {
    const challenges = this.loadFromStorage<Challenge>(this.challengesKey);
    const challenge = challenges.find((c) => c.challengeId === challengeId);
    if (challenge) {
      challenge.participants.push({
        userId,
        logs: {},
      });
      this.saveToStorage(this.challengesKey, challenges);
    }
  }

  // Push-up log methods
  async logPushups(
    userId: string,
    challengeId: string,
    day: string,
    pushUps: number,
    dailyGoal: number
  ): Promise<void> {
    const challenges = this.loadFromStorage<Challenge>(this.challengesKey);
    const challenge = challenges.find((c) => c.challengeId === challengeId);
    if (challenge) {
      const participant = challenge.participants.find(
        (p) => p.userId === userId
      );
      if (participant) {
        participant.logs[day] = {
          pushUps,
          dailyGoal,
        };
        this.saveToStorage(this.challengesKey, challenges);
      }
    }
  }
}
