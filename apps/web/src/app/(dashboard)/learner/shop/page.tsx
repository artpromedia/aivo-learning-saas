"use client";

import React, { useEffect, useState } from "react";
import {
  ShoppingBag, RefreshCw, Coins, Check,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { Modal } from "@/components/ui/Modal";
import { PurpleGradientHeader } from "@/components/brand/PurpleGradientHeader";
import { PageWrapper, BackLink, EmptyState, AnimatedCard } from "@/components/ui/PageDesign";
import { apiFetch } from "@/lib/api";
import { API_ROUTES } from "@/lib/api-routes";
import { useLearnerStore } from "@/stores/learner.store";
import { useEngagement } from "@/hooks/useEngagement";

interface ShopItem {
  id: string;
  name: string;
  description: string;
  category: "hair" | "outfit" | "accessory" | "background" | "effect";
  imageUrl: string;
  price: number;
  rarity: "common" | "rare" | "epic" | "legendary";
  owned: boolean;
  equipped: boolean;
}

const categoryEmoji: Record<ShopItem["category"], string> = {
  hair: "💇",
  outfit: "👕",
  accessory: "🎩",
  background: "🖼️",
  effect: "✨",
};

function ShopItemImage({ item, size = "sm" }: { item: ShopItem; size?: "sm" | "lg" }) {
  const [failed, setFailed] = useState(false);
  const textSize = size === "lg" ? "text-5xl" : "text-4xl";
  if (!item.imageUrl || failed) {
    return <span className={textSize}>{categoryEmoji[item.category] ?? "🎁"}</span>;
  }
  return (
    <img
      src={item.imageUrl}
      alt={item.name}
      className="w-full h-full object-contain p-2"
      onError={() => setFailed(true)}
    />
  );
}

const RARITY_COLORS: Record<string, string> = { common: "secondary", rare: "default", epic: "warning", legendary: "error" };

export default function ShopPage() {
  const t = useTranslations("dashboard");
  const activeLearner = useLearnerStore((s) => s.activeLearner);
  const { xp } = useEngagement(activeLearner?.id);

  const [items, setItems] = useState<ShopItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    async function fetchItems() {
      try {
        const data = await apiFetch<ShopItem[]>(API_ROUTES.SHOP.ITEMS);
        setItems(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : t("failedToLoadShop"));
      } finally {
        setLoading(false);
      }
    }
    fetchItems();
  }, []);

  const handlePurchase = async () => {
    if (!selectedItem) return;
    setPurchasing(true);
    try {
      await apiFetch(API_ROUTES.SHOP.PURCHASE, { method: "POST", body: JSON.stringify({ itemId: selectedItem.id }) });
      setItems((prev) => prev.map((i) => i.id === selectedItem.id ? { ...i, owned: true } : i));
      setSelectedItem(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("purchaseFailed"));
    } finally {
      setPurchasing(false);
    }
  };

  const categories = Array.from(new Set(items.map((i) => i.category)));
  const filteredItems = selectedCategory ? items.filter((i) => i.category === selectedCategory) : items;

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton height={80} className="w-full rounded-3xl" />
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Skeleton key={i} height={200} className="w-full rounded-3xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error && items.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-red-500 mb-4">{error}</p>
        <Button variant="outline" onClick={() => window.location.reload()} leftIcon={<RefreshCw size={16} />}>{t("retry")}</Button>
      </div>
    );
  }

  return (
    <PageWrapper>
      <BackLink href="/learner">{t("backToHome", { defaultValue: "Back to Home" })}</BackLink>

      <PurpleGradientHeader className="rounded-3xl mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/20">
              <ShoppingBag size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold">{t("avatarShop")}</h1>
              <p className="text-white/80 text-sm">{t("shopCustomizeDescription")}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white/20 rounded-full px-4 py-2">
            <Coins size={18} />
            <span className="font-bold">{xp?.totalXp ?? 0}</span>
            <span className="text-sm text-white/70">XP</span>
          </div>
        </div>
      </PurpleGradientHeader>

      {error && (
        <div className="mb-4 p-3 rounded-3xl bg-[#FFE0E0] dark:bg-[#991B1B]/10 border border-[#FECACA] dark:border-[#991B1B]/30 text-[#991B1B] dark:text-[#F87171] text-sm">{error}</div>
      )}

      <AnimatedCard delay={100}>
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === null
                ? "bg-[#7C3AED] text-white"
                : "bg-[var(--aivo-bg-alt,#FFF5EB)] text-[var(--aivo-text-secondary)] hover:bg-[#F0E6FF] dark:hover:bg-[#3D2D5C]"
            }`}
          >
            {t("shopAll")}
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === cat
                  ? "bg-[#7C3AED] text-white"
                  : "bg-[var(--aivo-bg-alt,#FFF5EB)] text-[var(--aivo-text-secondary)] hover:bg-[#F0E6FF] dark:hover:bg-[#3D2D5C]"
              }`}
            >
              {t(cat === "outfit" ? "outfits" : cat === "accessory" ? "accessories" : cat === "background" ? "backgrounds" : cat === "effect" ? "effects" : cat)}
            </button>
          ))}
        </div>
      </AnimatedCard>

      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
        {filteredItems.map((item, idx) => (
          <AnimatedCard key={item.id} delay={200 + idx * 50}>
            <Card
              className={`hover:shadow-[var(--shadow-card)] transition-all cursor-pointer hover:scale-[1.03] ${
                item.owned ? "ring-2 ring-green-400" : ""
              }`}
              onClick={() => !item.owned && setSelectedItem(item)}
            >
              <div className="aspect-square rounded-t-lg overflow-hidden relative flex items-center justify-center" style={{ backgroundColor: "var(--aivo-bg-alt, #FFF5EB)" }}>
                <ShopItemImage item={item} size="sm" />
                {item.owned && (
                  <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                    <Check className="text-white" size={14} />
                  </div>
                )}
              </div>
              <CardBody className="p-3">
                <h3 className="text-sm font-bold truncate mb-1" style={{ color: "var(--aivo-text)" }}>{item.name}</h3>
                <div className="flex items-center justify-between">
                  <Badge variant={RARITY_COLORS[item.rarity] as "secondary" | "default" | "warning" | "error"}>{item.rarity}</Badge>
                  {item.owned ? (
                    <span className="text-xs font-medium text-green-600">{t("shopOwned")}</span>
                  ) : (
                    <span className="text-xs font-bold flex items-center gap-1" style={{ color: "#7C3AED" }}>
                      <Coins size={12} /> {item.price}
                    </span>
                  )}
                </div>
              </CardBody>
            </Card>
          </AnimatedCard>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <EmptyState
          icon={<ShoppingBag size={32} />}
          title={t("shopNoItems")}
          description={t("shopTryCategory")}
          delay={200}
        />
      )}

      <Modal
        open={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        title={t("shopPurchaseItem")}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setSelectedItem(null)}>{t("shopCancel")}</Button>
            <Button onClick={handlePurchase} loading={purchasing} disabled={(xp?.totalXp ?? 0) < (selectedItem?.price ?? 0)}>
              {t("shopBuyFor", { price: selectedItem?.price ?? 0 })}
            </Button>
          </div>
        }
      >
        {selectedItem && (
          <div className="text-center">
            <div className="w-32 h-32 mx-auto mb-4 rounded-3xl overflow-hidden flex items-center justify-center" style={{ backgroundColor: "var(--aivo-bg-alt, #FFF5EB)" }}>
              <ShopItemImage item={selectedItem} size="lg" />
            </div>
            <h3 className="text-lg font-bold mb-1" style={{ color: "var(--aivo-text)" }}>{selectedItem.name}</h3>
            <p className="text-sm mb-3" style={{ color: "var(--aivo-text-secondary)" }}>{selectedItem.description}</p>
            <div className="flex items-center justify-center gap-2">
              <Badge variant={RARITY_COLORS[selectedItem.rarity] as "secondary" | "default" | "warning" | "error"}>{selectedItem.rarity}</Badge>
              <span className="font-bold flex items-center gap-1" style={{ color: "#7C3AED" }}>
                <Coins size={14} /> {selectedItem.price} XP
              </span>
            </div>
            {(xp?.totalXp ?? 0) < selectedItem.price && (
              <p className="mt-3 text-sm text-red-500">
                {t("shopNotEnoughXp", { needed: selectedItem.price - (xp?.totalXp ?? 0) })}
              </p>
            )}
          </div>
        )}
      </Modal>
    </PageWrapper>
  );
}
