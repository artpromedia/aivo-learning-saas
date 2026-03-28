"use client";

import React, { useEffect, useState } from "react";
import {
  ShoppingBag,
  Loader2,
  RefreshCw,
  Sparkles,
  Coins,
  Check,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { Modal } from "@/components/ui/Modal";
import { PurpleGradientHeader } from "@/components/brand/PurpleGradientHeader";
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

// Category labels will be resolved via t() in the component

const RARITY_COLORS: Record<string, string> = {
  common: "secondary",
  rare: "default",
  epic: "warning",
  legendary: "error",
};

const RARITY_KEYS: Record<string, string> = {
  common: "common",
  rare: "rare",
  epic: "epic",
  legendary: "legendary",
};

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
      await apiFetch(API_ROUTES.SHOP.PURCHASE, {
        method: "POST",
        body: JSON.stringify({ itemId: selectedItem.id }),
      });
      setItems((prev) =>
        prev.map((i) =>
          i.id === selectedItem.id ? { ...i, owned: true } : i,
        ),
      );
      setSelectedItem(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("purchaseFailed"));
    } finally {
      setPurchasing(false);
    }
  };

  const categories = Array.from(new Set(items.map((i) => i.category)));
  const filteredItems = selectedCategory
    ? items.filter((i) => i.category === selectedCategory)
    : items;

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton height={80} className="w-full rounded-xl" />
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Skeleton key={i} height={200} className="w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error && items.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-red-500 mb-4">{error}</p>
        <Button
          variant="outline"
          onClick={() => window.location.reload()}
          leftIcon={<RefreshCw size={16} />}
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div>
      <PurpleGradientHeader className="rounded-xl mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShoppingBag size={32} />
            <div>
              <h1 className="text-2xl font-bold">{t("avatarShop")}</h1>
              <p className="text-white/80 text-sm">
                {t("shopSubtitle")}
              </p>
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
        <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            selectedCategory === null
              ? "bg-[#7C3AED] text-white"
              : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
          }`}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === cat
                ? "bg-[#7C3AED] text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            {t(cat === "outfit" ? "outfits" : cat === "accessory" ? "accessories" : cat === "background" ? "backgrounds" : cat === "effect" ? "effects" : cat)}
          </button>
        ))}
      </div>

      {/* Items Grid */}
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
        {filteredItems.map((item) => (
          <Card
            key={item.id}
            className={`hover:shadow-md transition-shadow cursor-pointer ${
              item.owned ? "ring-2 ring-green-400" : ""
            }`}
            onClick={() => !item.owned && setSelectedItem(item)}
          >
            <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-t-lg overflow-hidden relative">
              <img
                src={item.imageUrl}
                alt={item.name}
                className="w-full h-full object-cover"
              />
              {item.owned && (
                <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                  <Check className="text-white" size={14} />
                </div>
              )}
            </div>
            <CardBody className="p-3">
              <div className="flex items-center gap-1 mb-1">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                  {item.name}
                </h3>
              </div>
              <div className="flex items-center justify-between">
                <Badge
                  variant={
                    RARITY_COLORS[item.rarity] as
                      | "secondary"
                      | "default"
                      | "warning"
                      | "error"
                  }
                >
                  {item.rarity}
                </Badge>
                {item.owned ? (
                  <span className="text-xs font-medium text-green-600">Owned</span>
                ) : (
                  <span className="text-xs font-bold text-[#7C3AED] flex items-center gap-1">
                    <Coins size={12} />
                    {item.price}
                  </span>
                )}
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <Card>
          <CardBody className="text-center py-12">
            <ShoppingBag className="mx-auto mb-3 text-gray-400" size={48} />
            <p className="text-gray-500 dark:text-gray-400">
              No items in this category.
            </p>
          </CardBody>
        </Card>
      )}

      {/* Purchase Modal */}
      <Modal
        open={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        title="Purchase Item"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setSelectedItem(null)}>
              Cancel
            </Button>
            <Button
              onClick={handlePurchase}
              loading={purchasing}
              disabled={(xp?.totalXp ?? 0) < (selectedItem?.price ?? 0)}
            >
              Buy for {selectedItem?.price} XP
            </Button>
          </div>
        }
      >
        {selectedItem && (
          <div className="text-center">
            <div className="w-32 h-32 mx-auto mb-4 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
              <img
                src={selectedItem.imageUrl}
                alt={selectedItem.name}
                className="w-full h-full object-cover"
              />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
              {selectedItem.name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
              {selectedItem.description}
            </p>
            <div className="flex items-center justify-center gap-2">
              <Badge
                variant={
                  RARITY_COLORS[selectedItem.rarity] as
                    | "secondary"
                    | "default"
                    | "warning"
                    | "error"
                }
              >
                {selectedItem.rarity}
              </Badge>
              <span className="font-bold text-[#7C3AED] flex items-center gap-1">
                <Coins size={14} />
                {selectedItem.price} XP
              </span>
            </div>
            {(xp?.totalXp ?? 0) < selectedItem.price && (
              <p className="mt-3 text-sm text-red-500">
                Not enough XP. You need {selectedItem.price - (xp?.totalXp ?? 0)} more XP.
              </p>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
