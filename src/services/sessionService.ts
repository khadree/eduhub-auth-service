import { redis } from '../config/redis';

const SESSION_PREFIX = 'auth:session:';

export interface SessionData {
  userId: string;
  refreshTokenId: string;
}

export const sessionService = {
  async connect() {
    if (redis.status === 'wait' || redis.status === 'end') {
      await redis.connect();
    }
  },

  async storeSession(sessionId: string, data: SessionData, ttlSeconds: number) {
    await this.connect();
    await redis.setex(`${SESSION_PREFIX}${sessionId}`, ttlSeconds, JSON.stringify(data));
  },

  async getSession(sessionId: string): Promise<SessionData | null> {
    await this.connect();
    const json = await redis.get(`${SESSION_PREFIX}${sessionId}`);
    return json ? (JSON.parse(json) as SessionData) : null;
  },

  async deleteSession(sessionId: string) {
    await this.connect();
    await redis.del(`${SESSION_PREFIX}${sessionId}`);
  },
};
