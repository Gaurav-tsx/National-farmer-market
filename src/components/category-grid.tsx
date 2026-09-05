"use client";

import React from "react";
import { useLanguage } from "@/lib/i18n/context";

interface CategoryGridProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export function CategoryGrid({
  selectedCategory,
  onSelectCategory,
}: CategoryGridProps) {
  const { t } = useLanguage();

  const categories = [
    {
      id: "all",
      label: t.categories.all,
      icon: "🌱",
      badge: "All",
      color: "from-emerald-500/20 to-green-600/20 border-emerald-300",
      activeBg: "bg-emerald-700 text-white shadow-md shadow-emerald-700/25 border-emerald-800",
    },
    {
      id: "Vegetables",
      label: t.categories.vegetables,
      icon: "🍅",
      badge: "Nashik / Delhi",
      color: "from-red-500/20 to-orange-600/20 border-red-300",
      activeBg: "bg-red-700 text-white shadow-md shadow-red-700/25 border-red-800",
    },
    {
      id: "Grains",
      label: t.categories.grains,
      icon: "🌾",
      badge: "Punjab / Haryana",
      color: "from-amber-500/20 to-yellow-600/20 border-amber-300",
      activeBg: "bg-amber-700 text-white shadow-md shadow-amber-700/25 border-amber-800",
    },
    {
      id: "Fruits",
      label: t.categories.fruits,
      icon: "🍎",
      badge: "Vashi / Shimla",
      color: "from-pink-500/20 to-rose-600/20 border-pink-300",
      activeBg: "bg-rose-700 text-white shadow-md shadow-rose-700/25 border-rose-800",
    },
    {
      id: "Spices",
      label: t.categories.spices,
      icon: "🌶️",
      badge: "Guntur / Unjha",
      color: "from-orange-500/20 to-amber-600/20 border-orange-300",
      activeBg: "bg-orange-700 text-white shadow-md shadow-orange-700/25 border-orange-800",
    },
    {
      id: "Dairy",
      label: t.categories.dairy,
      icon: "🥛",
      badge: "Anand / Rohtak",
      color: "from-blue-500/20 to-cyan-600/20 border-blue-300",
      activeBg: "bg-blue-700 text-white shadow-md shadow-blue-700/25 border-blue-800",
    },
  ];

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3 px-1">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          {t.hero.categoryTitle}
        </h3>
        <span className="text-[11px] text-emerald-700 font-semibold">
          {categories.length} Categories
        </span>
      </div>

      {/* Thumb-friendly high-contrast tap grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
        {categories.map((cat) => {
          const isActive =
            selectedCategory.toLowerCase() === cat.id.toLowerCase() ||
            (cat.id === "all" && (!selectedCategory || selectedCategory === "all"));

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategory(cat.id)}
              className={`relative flex flex-col items-center text-center p-3 rounded-2xl border transition-all active:scale-95 duration-150 cursor-pointer select-none ${
                isActive
                  ? cat.activeBg
                  : "bg-white hover:bg-slate-50 text-slate-800 border-slate-200 shadow-2xs hover:border-slate-300"
              }`}
            >
              <span className="text-2xl sm:text-3xl mb-1.5 transform transition-transform group-hover:scale-110">
                {cat.icon}
              </span>
              <span className="font-bold text-xs sm:text-sm tracking-tight leading-snug">
                {cat.label}
              </span>
              <span
                className={`text-[9px] mt-1 font-semibold px-2 py-0.5 rounded-full ${
                  isActive
                    ? "bg-white/20 text-white"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {cat.badge}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
