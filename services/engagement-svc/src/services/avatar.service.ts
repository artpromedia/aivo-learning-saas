import type { FastifyInstance } from "fastify";
import type { ItemCategory } from "../data/shop-items.js";

export interface AvatarState {
  learnerId: string;
  equipped: Record<string, string | null>; // slot → itemId
  lastUpdated: string;
}

const AVATAR_PREFIX = "avatar:";
const SLOTS: ItemCategory[] = ["hat", "outfit", "pet", "background", "frame", "effect"];

export class AvatarService {
  constructor(private readonly app: FastifyInstance) {}

  async getAvatar(learnerId: string): Promise<AvatarState> {
    const raw = await this.app.redis.get(`${AVATAR_PREFIX}${learnerId}`);
    if (raw) {
      return JSON.parse(raw) as AvatarState;
    }

    // Default empty avatar
    const equipped: Record<string, string | null> = {};
    for (const slot of SLOTS) {
      equipped[slot] = null;
    }

    return {
      learnerId,
      equipped,
      lastUpdated: new Date().toISOString(),
    };
  }

  async updateAvatar(
    learnerId: string,
    updates: Record<string, string | null>,
  ): Promise<AvatarState> {
    const avatar = await this.getAvatar(learnerId);

    // Verify ownership of equipped items
    const ownedIds = await this.app.redis.smembers(`inventory:${learnerId}`);
    const ownedSet = new Set(ownedIds);

    for (const [slot, itemId] of Object.entries(updates)) {
      if (!SLOTS.includes(slot as ItemCategory)) continue;
      if (itemId === null) {
        avatar.equipped[slot] = null;
      } else if (ownedSet.has(itemId)) {
        avatar.equipped[slot] = itemId;
      } else {
        throw Object.assign(
          new Error(`Item ${itemId} not owned`),
          { statusCode: 400 },
        );
      }
    }

    avatar.lastUpdated = new Date().toISOString();

    await this.app.redis.set(
      `${AVATAR_PREFIX}${learnerId}`,
      JSON.stringify(avatar),
    );

    return avatar;
  }
}
