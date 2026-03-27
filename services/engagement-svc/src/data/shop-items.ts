export type ItemCategory = "hat" | "outfit" | "pet" | "background" | "frame" | "effect";
export type ItemRarity = "COMMON" | "RARE" | "EPIC" | "LEGENDARY";

export interface ShopItem {
  id: string;
  name: string;
  category: ItemCategory;
  priceCoins: number;
  rarity: ItemRarity;
  gradeBands: string[];
  previewUrl: string;
}

export const SHOP_ITEMS: ShopItem[] = [
  // ── Hats (10) ──────────────────────────────────────────────────────────────
  { id: "hat_001", name: "Star Crown", category: "hat", priceCoins: 50, rarity: "COMMON", gradeBands: ["K-2", "3-5", "6-8", "9-12"], previewUrl: "/shop/hats/star_crown.png" },
  { id: "hat_002", name: "Wizard Hat", category: "hat", priceCoins: 75, rarity: "COMMON", gradeBands: ["K-2", "3-5", "6-8", "9-12"], previewUrl: "/shop/hats/wizard_hat.png" },
  { id: "hat_003", name: "Dino Cap", category: "hat", priceCoins: 60, rarity: "COMMON", gradeBands: ["K-2", "3-5"], previewUrl: "/shop/hats/dino_cap.png" },
  { id: "hat_004", name: "Astronaut Helmet", category: "hat", priceCoins: 150, rarity: "RARE", gradeBands: ["3-5", "6-8", "9-12"], previewUrl: "/shop/hats/astronaut_helmet.png" },
  { id: "hat_005", name: "Pirate Bandana", category: "hat", priceCoins: 80, rarity: "COMMON", gradeBands: ["K-2", "3-5", "6-8"], previewUrl: "/shop/hats/pirate_bandana.png" },
  { id: "hat_006", name: "Neon Headband", category: "hat", priceCoins: 200, rarity: "RARE", gradeBands: ["6-8", "9-12"], previewUrl: "/shop/hats/neon_headband.png" },
  { id: "hat_007", name: "Flower Crown", category: "hat", priceCoins: 100, rarity: "RARE", gradeBands: ["K-2", "3-5", "6-8"], previewUrl: "/shop/hats/flower_crown.png" },
  { id: "hat_008", name: "Robot Visor", category: "hat", priceCoins: 300, rarity: "EPIC", gradeBands: ["3-5", "6-8", "9-12"], previewUrl: "/shop/hats/robot_visor.png" },
  { id: "hat_009", name: "Dragon Horns", category: "hat", priceCoins: 500, rarity: "LEGENDARY", gradeBands: ["K-2", "3-5", "6-8", "9-12"], previewUrl: "/shop/hats/dragon_horns.png" },
  { id: "hat_010", name: "Galaxy Halo", category: "hat", priceCoins: 400, rarity: "EPIC", gradeBands: ["6-8", "9-12"], previewUrl: "/shop/hats/galaxy_halo.png" },

  // ── Outfits (10) ───────────────────────────────────────────────────────────
  { id: "outfit_001", name: "Superhero Cape", category: "outfit", priceCoins: 100, rarity: "COMMON", gradeBands: ["K-2", "3-5", "6-8", "9-12"], previewUrl: "/shop/outfits/superhero_cape.png" },
  { id: "outfit_002", name: "Lab Coat", category: "outfit", priceCoins: 120, rarity: "COMMON", gradeBands: ["3-5", "6-8", "9-12"], previewUrl: "/shop/outfits/lab_coat.png" },
  { id: "outfit_003", name: "Teddy Onesie", category: "outfit", priceCoins: 80, rarity: "COMMON", gradeBands: ["K-2", "3-5"], previewUrl: "/shop/outfits/teddy_onesie.png" },
  { id: "outfit_004", name: "Space Suit", category: "outfit", priceCoins: 250, rarity: "RARE", gradeBands: ["3-5", "6-8", "9-12"], previewUrl: "/shop/outfits/space_suit.png" },
  { id: "outfit_005", name: "Ninja Outfit", category: "outfit", priceCoins: 200, rarity: "RARE", gradeBands: ["3-5", "6-8", "9-12"], previewUrl: "/shop/outfits/ninja_outfit.png" },
  { id: "outfit_006", name: "Rainbow Hoodie", category: "outfit", priceCoins: 150, rarity: "RARE", gradeBands: ["K-2", "3-5", "6-8"], previewUrl: "/shop/outfits/rainbow_hoodie.png" },
  { id: "outfit_007", name: "Knight Armor", category: "outfit", priceCoins: 400, rarity: "EPIC", gradeBands: ["3-5", "6-8", "9-12"], previewUrl: "/shop/outfits/knight_armor.png" },
  { id: "outfit_008", name: "Pixel Jacket", category: "outfit", priceCoins: 350, rarity: "EPIC", gradeBands: ["6-8", "9-12"], previewUrl: "/shop/outfits/pixel_jacket.png" },
  { id: "outfit_009", name: "Dragon Scale Robe", category: "outfit", priceCoins: 600, rarity: "LEGENDARY", gradeBands: ["K-2", "3-5", "6-8", "9-12"], previewUrl: "/shop/outfits/dragon_robe.png" },
  { id: "outfit_010", name: "Cyber Suit", category: "outfit", priceCoins: 500, rarity: "LEGENDARY", gradeBands: ["6-8", "9-12"], previewUrl: "/shop/outfits/cyber_suit.png" },

  // ── Pets (10) ──────────────────────────────────────────────────────────────
  { id: "pet_001", name: "Pixel Puppy", category: "pet", priceCoins: 100, rarity: "COMMON", gradeBands: ["K-2", "3-5", "6-8", "9-12"], previewUrl: "/shop/pets/pixel_puppy.png" },
  { id: "pet_002", name: "Star Kitten", category: "pet", priceCoins: 100, rarity: "COMMON", gradeBands: ["K-2", "3-5", "6-8", "9-12"], previewUrl: "/shop/pets/star_kitten.png" },
  { id: "pet_003", name: "Baby Dino", category: "pet", priceCoins: 150, rarity: "RARE", gradeBands: ["K-2", "3-5"], previewUrl: "/shop/pets/baby_dino.png" },
  { id: "pet_004", name: "Robo Hamster", category: "pet", priceCoins: 200, rarity: "RARE", gradeBands: ["3-5", "6-8", "9-12"], previewUrl: "/shop/pets/robo_hamster.png" },
  { id: "pet_005", name: "Cloud Bunny", category: "pet", priceCoins: 120, rarity: "COMMON", gradeBands: ["K-2", "3-5"], previewUrl: "/shop/pets/cloud_bunny.png" },
  { id: "pet_006", name: "Fire Fox", category: "pet", priceCoins: 300, rarity: "EPIC", gradeBands: ["3-5", "6-8", "9-12"], previewUrl: "/shop/pets/fire_fox.png" },
  { id: "pet_007", name: "Crystal Owl", category: "pet", priceCoins: 350, rarity: "EPIC", gradeBands: ["6-8", "9-12"], previewUrl: "/shop/pets/crystal_owl.png" },
  { id: "pet_008", name: "Mini Phoenix", category: "pet", priceCoins: 500, rarity: "LEGENDARY", gradeBands: ["K-2", "3-5", "6-8", "9-12"], previewUrl: "/shop/pets/mini_phoenix.png" },
  { id: "pet_009", name: "Galaxy Turtle", category: "pet", priceCoins: 250, rarity: "RARE", gradeBands: ["K-2", "3-5", "6-8"], previewUrl: "/shop/pets/galaxy_turtle.png" },
  { id: "pet_010", name: "Shadow Wolf", category: "pet", priceCoins: 450, rarity: "EPIC", gradeBands: ["6-8", "9-12"], previewUrl: "/shop/pets/shadow_wolf.png" },

  // ── Backgrounds (10) ──────────────────────────────────────────────────────
  { id: "bg_001", name: "Sunny Meadow", category: "background", priceCoins: 50, rarity: "COMMON", gradeBands: ["K-2", "3-5", "6-8", "9-12"], previewUrl: "/shop/backgrounds/sunny_meadow.png" },
  { id: "bg_002", name: "Deep Space", category: "background", priceCoins: 100, rarity: "COMMON", gradeBands: ["3-5", "6-8", "9-12"], previewUrl: "/shop/backgrounds/deep_space.png" },
  { id: "bg_003", name: "Candy Land", category: "background", priceCoins: 60, rarity: "COMMON", gradeBands: ["K-2", "3-5"], previewUrl: "/shop/backgrounds/candy_land.png" },
  { id: "bg_004", name: "Underwater Kingdom", category: "background", priceCoins: 150, rarity: "RARE", gradeBands: ["K-2", "3-5", "6-8"], previewUrl: "/shop/backgrounds/underwater.png" },
  { id: "bg_005", name: "Neon City", category: "background", priceCoins: 200, rarity: "RARE", gradeBands: ["6-8", "9-12"], previewUrl: "/shop/backgrounds/neon_city.png" },
  { id: "bg_006", name: "Enchanted Forest", category: "background", priceCoins: 180, rarity: "RARE", gradeBands: ["K-2", "3-5", "6-8"], previewUrl: "/shop/backgrounds/enchanted_forest.png" },
  { id: "bg_007", name: "Volcano Island", category: "background", priceCoins: 300, rarity: "EPIC", gradeBands: ["3-5", "6-8", "9-12"], previewUrl: "/shop/backgrounds/volcano_island.png" },
  { id: "bg_008", name: "Crystal Cavern", category: "background", priceCoins: 350, rarity: "EPIC", gradeBands: ["3-5", "6-8", "9-12"], previewUrl: "/shop/backgrounds/crystal_cavern.png" },
  { id: "bg_009", name: "Aurora Borealis", category: "background", priceCoins: 500, rarity: "LEGENDARY", gradeBands: ["K-2", "3-5", "6-8", "9-12"], previewUrl: "/shop/backgrounds/aurora.png" },
  { id: "bg_010", name: "Pixel World", category: "background", priceCoins: 250, rarity: "RARE", gradeBands: ["6-8", "9-12"], previewUrl: "/shop/backgrounds/pixel_world.png" },

  // ── Frames (5) ────────────────────────────────────────────────────────────
  { id: "frame_001", name: "Gold Frame", category: "frame", priceCoins: 100, rarity: "COMMON", gradeBands: ["K-2", "3-5", "6-8", "9-12"], previewUrl: "/shop/frames/gold_frame.png" },
  { id: "frame_002", name: "Rainbow Frame", category: "frame", priceCoins: 150, rarity: "RARE", gradeBands: ["K-2", "3-5", "6-8"], previewUrl: "/shop/frames/rainbow_frame.png" },
  { id: "frame_003", name: "Fire Frame", category: "frame", priceCoins: 250, rarity: "EPIC", gradeBands: ["3-5", "6-8", "9-12"], previewUrl: "/shop/frames/fire_frame.png" },
  { id: "frame_004", name: "Ice Crystal Frame", category: "frame", priceCoins: 300, rarity: "EPIC", gradeBands: ["6-8", "9-12"], previewUrl: "/shop/frames/ice_frame.png" },
  { id: "frame_005", name: "Legendary Dragon Frame", category: "frame", priceCoins: 500, rarity: "LEGENDARY", gradeBands: ["K-2", "3-5", "6-8", "9-12"], previewUrl: "/shop/frames/dragon_frame.png" },

  // ── Effects (6) ───────────────────────────────────────────────────────────
  { id: "effect_001", name: "Sparkle Trail", category: "effect", priceCoins: 100, rarity: "COMMON", gradeBands: ["K-2", "3-5", "6-8", "9-12"], previewUrl: "/shop/effects/sparkle_trail.png" },
  { id: "effect_002", name: "Rainbow Aura", category: "effect", priceCoins: 200, rarity: "RARE", gradeBands: ["K-2", "3-5", "6-8"], previewUrl: "/shop/effects/rainbow_aura.png" },
  { id: "effect_003", name: "Lightning Bolts", category: "effect", priceCoins: 250, rarity: "RARE", gradeBands: ["3-5", "6-8", "9-12"], previewUrl: "/shop/effects/lightning_bolts.png" },
  { id: "effect_004", name: "Flame Wings", category: "effect", priceCoins: 400, rarity: "EPIC", gradeBands: ["3-5", "6-8", "9-12"], previewUrl: "/shop/effects/flame_wings.png" },
  { id: "effect_005", name: "Galaxy Swirl", category: "effect", priceCoins: 450, rarity: "EPIC", gradeBands: ["6-8", "9-12"], previewUrl: "/shop/effects/galaxy_swirl.png" },
  { id: "effect_006", name: "Cosmic Explosion", category: "effect", priceCoins: 600, rarity: "LEGENDARY", gradeBands: ["K-2", "3-5", "6-8", "9-12"], previewUrl: "/shop/effects/cosmic_explosion.png" },
];

export function getShopItemById(id: string): ShopItem | undefined {
  return SHOP_ITEMS.find((item) => item.id === id);
}

export function filterShopItems(filters: {
  category?: ItemCategory;
  gradeBand?: string;
  rarity?: ItemRarity;
}): ShopItem[] {
  return SHOP_ITEMS.filter((item) => {
    if (filters.category && item.category !== filters.category) return false;
    if (filters.gradeBand && !item.gradeBands.includes(filters.gradeBand)) return false;
    if (filters.rarity && item.rarity !== filters.rarity) return false;
    return true;
  });
}
