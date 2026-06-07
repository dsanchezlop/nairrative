"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronRight, BookOpen, Search, ChevronLeft, Heart } from "lucide-react";
import type { Category, Generation } from "@/lib/types";

const CATEGORY_LABELS: Record<Category, string> = {
  personaje: "🧙 Personaje",
  historia: "📖 Historia",
  mundo: "🌍 Mundo",
  encuentro: "⚔️ Encuentro",
  otro: "✨ Otro",
};

const CATEGORY_COLORS: Record<Category, string> = {
  personaje: "bg-violet-900/50 text-violet-300 border-violet-700/50",
  historia: "bg-amber-900/50 text-amber-300 border-amber-700/50",
  mundo: "bg-emerald-900/50 text-emerald-300 border-emerald-700/50",
  encuentro: "bg-red-900/50 text-red-300 border-red-700/50",
  otro: "bg-blue-900/50 text-blue-300 border-blue-700/50",
};

const CATEGORIES: { value: Category | "todas"; label: string }[] = [
  { value: "todas", label: "Todas" },
  { value: "personaje", label: "🧙 Personaje" },
  { value: "historia", label: "📖 Historia" },
  { value: "mundo", label: "🌍 Mundo" },
  { value: "encuentro", label: "⚔️ Encuentro" },
  { value: "otro", label: "✨ Otro" },
];

export default function GenerationList({
  refreshKey,
  campaignId,
}: {
  refreshKey: number;
  campaignId?: string | null;
}) {
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [filter, setFilter] = useState<Category | "todas">("todas");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const ITEMS_PER_PAGE = 5;

  const fetchGenerations = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    let query = supabase
      .from("generations")
      .select("*")
      .order("created_at", { ascending: false });

    if (filter !== "todas") {
      query = query.eq("category", filter);
    }

    if (campaignId) {
      query = query.eq("campaign_id", campaignId);
    }

    const { data } = await query;
    setGenerations(data ?? []);
    setLoading(false);
  }, [filter, campaignId]);

  async function handleToggleFavorite(
    e: React.MouseEvent,
    generationId: string,
    isFavorite: boolean,
  ) {
    e.preventDefault();
    e.stopPropagation();

    try {
      const res = await fetch("/api/generation/toggle-favorite", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ generationId, isFavorite: !isFavorite }),
      });

      if (res.ok) {
        setGenerations((prevs) =>
          prevs.map((g) =>
            g.id === generationId ? { ...g, is_favorite: !isFavorite } : g,
          ),
        );
      }
    } catch (err) {
      console.error("Error toggling favorite:", err);
    }
  }

  useEffect(() => {
    fetchGenerations();
    setCurrentPage(1);
  }, [fetchGenerations, refreshKey]);

  return (
    <div className="space-y-4">
      {/* Búsqueda */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
        <Input
          type="text"
          placeholder="Buscar por título..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="pl-10 bg-[#1a1a3a] border-purple-900/50 text-white placeholder:text-gray-600 focus-visible:ring-purple-500"
        />
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setFilter(cat.value)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors border ${
              filter === cat.value
                ? "bg-purple-700 text-white border-purple-500"
                : "bg-[#1a1a3a] text-gray-400 border-purple-900/30 hover:border-purple-600 hover:text-gray-200"
            }`}
          >
            {cat.label}
          </button>
        ))}
        <button
          onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors border flex items-center gap-1 ${
            showOnlyFavorites
              ? "bg-red-700/70 text-red-100 border-red-500"
              : "bg-[#1a1a3a] text-gray-400 border-purple-900/30 hover:border-purple-600 hover:text-gray-200"
          }`}
        >
          <Heart className={`h-3 w-3 ${showOnlyFavorites ? "fill-current" : ""}`} />
          Favoritos
        </button>
      </div>

      {/* Lista */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-20 rounded-lg bg-[#12122a] animate-pulse border border-purple-900/20"
            />
          ))}
        </div>
      ) : (() => {
        const filtered = generations.filter((gen) => {
          const matchesSearch = gen.title
            .toLowerCase()
            .includes(searchTerm.toLowerCase());
          const matchesFavorite = !showOnlyFavorites || gen.is_favorite;
          return matchesSearch && matchesFavorite;
        });

        if (filtered.length === 0) {
          return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <BookOpen className="h-12 w-12 text-purple-900 mb-3" />
              <p className="text-gray-500 text-sm">
                {filter === "todas" && searchTerm
                  ? `No hay textos que coincidan con "${searchTerm}"`
                  : filter === "todas"
                    ? "Aún no has generado ningún texto. ¡Empieza arriba!"
                    : `No tienes textos de tipo "${CATEGORY_LABELS[filter as Category]}".`}
              </p>
            </div>
          );
        }

        const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
        const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
        const paginatedGenerations = filtered.slice(startIdx, startIdx + ITEMS_PER_PAGE);

        return (
          <div className="space-y-4">
            <div className="space-y-3">
              {paginatedGenerations.map((gen) => (
                <Link key={gen.id} href={`/generation/${gen.id}`}>
                  <Card className="bg-[#12122a] border-purple-900/30 hover:border-purple-600/50 transition-colors cursor-pointer group">
                    <CardContent className="p-4 flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge
                            variant="outline"
                            className={`text-xs ${CATEGORY_COLORS[gen.category as Category]}`}
                          >
                            {CATEGORY_LABELS[gen.category as Category]}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {new Date(gen.created_at).toLocaleDateString("es-ES", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                        <p className="text-gray-200 font-medium truncate">
                          {gen.title}
                        </p>
                        <p className="text-gray-500 text-xs truncate">
                          {gen.prompt}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={(e) =>
                            handleToggleFavorite(e, gen.id, gen.is_favorite ?? false)
                          }
                          className="p-1 text-gray-500 hover:text-red-400 transition-colors"
                        >
                          <Heart
                            className={`h-4 w-4 ${
                              gen.is_favorite ? "fill-red-400 text-red-400" : ""
                            }`}
                          />
                        </button>
                        <ChevronRight className="h-4 w-4 text-gray-600 group-hover:text-purple-400 transition-colors" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="border-purple-900/30 hover:border-purple-600 text-gray-400 hover:text-gray-200"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-gray-400">
                  Página {currentPage} de {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="border-purple-900/30 hover:border-purple-600 text-gray-400 hover:text-gray-200"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
}
