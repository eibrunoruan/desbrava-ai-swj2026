"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Search,
  Star,
  Users,
  Clock,
  ExternalLink,
  BookOpen,
  Sparkles,
  Filter,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUserStore } from "@/store/user";
import { PremiumGate } from "@/components/premium-gate";

interface Course {
  id?: string;
  title: string;
  url: string;
  platform: string;
  rating: number;
  students_count: number;
  price: number;
  duration: string;
  language: string;
  compatibility_score: number;
}

interface PdiItem {
  id: string;
  title: string;
  type: string;
  module: string;
}

function SkeletonCard() {
  return (
    <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="h-5 w-3/4 animate-pulse rounded bg-white/10" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-white/10 mt-2" />
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2">
          <div className="h-6 w-16 animate-pulse rounded-full bg-white/10" />
          <div className="h-6 w-20 animate-pulse rounded-full bg-white/10" />
        </div>
        <div className="h-4 w-full animate-pulse rounded bg-white/10" />
        <div className="h-4 w-2/3 animate-pulse rounded bg-white/10" />
        <div className="h-10 w-full animate-pulse rounded bg-white/10 mt-4" />
      </CardContent>
    </Card>
  );
}

function compatibilityColor(score: number) {
  if (score >= 90) return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
  if (score >= 75) return "bg-blue-500/20 text-blue-400 border-blue-500/30";
  if (score >= 60) return "bg-amber-500/20 text-amber-400 border-amber-500/30";
  return "bg-zinc-500/20 text-zinc-400 border-zinc-500/30";
}

function formatStudents(count: number) {
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
  return count.toString();
}

function renderStars(rating: number) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.5;
  const stars = [];
  for (let i = 0; i < fullStars; i++) {
    stars.push(
      <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
    );
  }
  if (hasHalf) {
    stars.push(
      <Star
        key="half"
        className="h-3.5 w-3.5 fill-amber-400/50 text-amber-400"
      />
    );
  }
  return stars;
}

export default function CoursesPage() {
  const user = useUserStore((s) => s.user);

  if (!user?.plan || user.plan === "free") {
    return (
      <PremiumGate
        feature="Curadoria de Cursos Inteligente"
        description="Com o plano Premium, voce recebe recomendacoes personalizadas de cursos baseadas no seu perfil, PDI e objetivos. Encontre os melhores cursos para acelerar sua carreira."
      />
    );
  }

  return <CoursesContent />;
}

function CoursesContent() {
  const user = useUserStore((s) => s.user);
  const [searchQuery, setSearchQuery] = useState("");
  const [courses, setCourses] = useState<Course[]>([]);
  const [pdiCourses, setPdiCourses] = useState<Course[]>([]);
  const [pdiItems, setPdiItems] = useState<PdiItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [pdiLoading, setPdiLoading] = useState(true);
  const [languageFilter, setLanguageFilter] = useState("all");
  const [priceFilter, setPriceFilter] = useState("all");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [hasSearched, setHasSearched] = useState(false);

  // Load PDI items and their recommended courses
  const loadPdiCourses = useCallback(async () => {
    if (!user?.id) {
      setPdiLoading(false);
      return;
    }

    try {
      // Fetch user's PDIs (returns { pdis: [...] } with items nested)
      const pdiRes = await fetch(`/api/pdi?userId=${user.id}`);
      if (!pdiRes.ok) {
        setPdiLoading(false);
        return;
      }

      const pdiData = await pdiRes.json();
      const pdis = pdiData.pdis || [];
      if (pdis.length === 0) {
        setPdiLoading(false);
        return;
      }

      const pdi = pdis[0];
      const allItems = pdi.items || [];
      const courseItems = allItems.filter(
        (item: PdiItem) => item.type === "course"
      );
      setPdiItems(courseItems);

      // For the first course item, search for recommendations
      if (courseItems.length > 0) {
        const firstItem = courseItems[0];
        const searchRes = await fetch("/api/courses/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            skill: firstItem.title,
            userId: user.id,
            pdiItemId: firstItem.id,
          }),
        });
        if (searchRes.ok) {
          const searchData = await searchRes.json();
          setPdiCourses(searchData.courses || []);
        }
      }
    } catch (err) {
      console.error("Error loading PDI courses:", err);
    } finally {
      setPdiLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadPdiCourses();
  }, [loadPdiCourses]);

  const handleSearch = async () => {
    if (!searchQuery.trim() || !user?.id) return;

    setLoading(true);
    setHasSearched(true);

    try {
      const res = await fetch("/api/courses/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skill: searchQuery,
          userId: user.id,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setCourses(data.courses || []);
      }
    } catch (err) {
      console.error("Error searching courses:", err);
    } finally {
      setLoading(false);
    }
  };

  const filterCourses = (courseList: Course[]) => {
    return courseList.filter((course) => {
      if (languageFilter !== "all" && course.language !== languageFilter) return false;
      if (priceFilter === "free" && course.price > 0) return false;
      if (priceFilter === "under50" && course.price > 50) return false;
      if (priceFilter === "under100" && course.price > 100) return false;
      if (ratingFilter === "4.8" && course.rating < 4.8) return false;
      if (ratingFilter === "4.5" && course.rating < 4.5) return false;
      return true;
    });
  };

  const filteredCourses = filterCourses(courses);
  const filteredPdiCourses = filterCourses(pdiCourses);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          <span className="text-sm text-muted-foreground">
            Curadoria de Cursos
          </span>
        </div>
        <h1 className="text-3xl font-bold">
          <span className="bg-gradient-to-r from-green-400 to-lime-400 bg-clip-text text-transparent">
            Cursos Recomendados
          </span>
        </h1>
        <p className="text-muted-foreground">
          Encontre os melhores cursos para acelerar seu desenvolvimento
          profissional, personalizados para o seu perfil.
        </p>
      </div>

      {/* Search Bar */}
      <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por habilidade (ex: React, Lideranca, Data Science...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="pl-10 border-white/10 bg-white/5"
              />
            </div>
            <Button
              onClick={handleSearch}
              disabled={loading || !searchQuery.trim()}
              className="bg-gradient-to-r from-green-600 to-lime-600 hover:from-green-700 hover:to-lime-700"
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4" />
              )}
              Buscar com IA
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <Select value={languageFilter} onValueChange={setLanguageFilter}>
          <SelectTrigger className="w-[140px] border-white/10 bg-white/5">
            <SelectValue placeholder="Idioma" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos idiomas</SelectItem>
            <SelectItem value="PT-BR">Portugues</SelectItem>
            <SelectItem value="EN">English</SelectItem>
          </SelectContent>
        </Select>

        <Select value={priceFilter} onValueChange={setPriceFilter}>
          <SelectTrigger className="w-[150px] border-white/10 bg-white/5">
            <SelectValue placeholder="Preco" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos precos</SelectItem>
            <SelectItem value="free">Gratuito</SelectItem>
            <SelectItem value="under50">Ate R$50</SelectItem>
            <SelectItem value="under100">Ate R$100</SelectItem>
          </SelectContent>
        </Select>

        <Select value={ratingFilter} onValueChange={setRatingFilter}>
          <SelectTrigger className="w-[140px] border-white/10 bg-white/5">
            <SelectValue placeholder="Avaliacao" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas notas</SelectItem>
            <SelectItem value="4.5">4.5+ estrelas</SelectItem>
            <SelectItem value="4.8">4.8+ estrelas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* PDI Recommended Courses */}
      {pdiItems.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-green-400" />
            <h2 className="text-xl font-semibold">
              Cursos Recomendados para seu PDI
            </h2>
          </div>
          {pdiLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : filteredPdiCourses.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredPdiCourses.map((course, index) => (
                <CourseCard key={course.id || index} course={course} />
              ))}
            </div>
          ) : (
            <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
              <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                <BookOpen className="mb-3 h-8 w-8 text-muted-foreground" />
                <p className="text-muted-foreground">
                  Nenhum curso encontrado com os filtros selecionados.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Search Results */}
      {hasSearched && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">
            Resultados para &ldquo;{searchQuery}&rdquo;
          </h2>
          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : filteredCourses.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredCourses.map((course, index) => (
                <CourseCard key={course.id || index} course={course} />
              ))}
            </div>
          ) : (
            <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Search className="mb-3 h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Nenhum curso encontrado. Tente buscar por outra habilidade.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Empty state */}
      {!hasSearched && pdiItems.length === 0 && !pdiLoading && (
        <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-green-500/20 to-lime-500/20">
              <BookOpen className="h-8 w-8 text-green-400" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">
              Descubra os melhores cursos para voce
            </h3>
            <p className="mb-6 max-w-md text-sm text-muted-foreground">
              Use a busca acima para encontrar cursos personalizados com base no
              seu perfil. Complete seus assessments para recomendacoes ainda mais
              precisas.
            </p>
            <Button
              onClick={() => {
                setSearchQuery("Lideranca");
                handleSearch();
              }}
              variant="outline"
              className="border-green-500/30 hover:bg-green-500/10"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Experimentar uma busca
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function CourseCard({ course }: { course: Course }) {
  return (
    <Card className="group relative overflow-hidden border-white/10 bg-white/5 backdrop-blur-sm transition-all hover:border-green-500/30 hover:shadow-lg hover:shadow-green-500/5">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-sm font-semibold leading-tight line-clamp-2">
            {course.title}
          </CardTitle>
          <Badge
            variant="outline"
            className={`shrink-0 text-xs ${compatibilityColor(course.compatibility_score)}`}
          >
            {course.compatibility_score}%
          </Badge>
        </div>
        <Badge
          variant="secondary"
          className="w-fit bg-lime-500/20 text-lime-300 text-xs"
        >
          {course.platform}
        </Badge>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Rating */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-0.5">
            {renderStars(course.rating)}
          </div>
          <span className="text-sm font-medium text-amber-400">
            {course.rating.toFixed(1)}
          </span>
          <span className="text-xs text-muted-foreground">
            <Users className="mr-1 inline h-3 w-3" />
            {formatStudents(course.students_count)} alunos
          </span>
        </div>

        {/* Details */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            {course.duration}
          </div>
          <Badge variant="outline" className="text-xs border-white/10">
            {course.language}
          </Badge>
        </div>

        {/* Price */}
        <div className="text-lg font-bold text-green-400">
          {course.price === 0
            ? "Gratuito"
            : `R$ ${course.price.toFixed(2)}`}
        </div>

        {/* Action */}
        <a
          href={course.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block"
        >
          <Button
            className="w-full bg-gradient-to-r from-green-600 to-lime-600 hover:from-green-700 hover:to-lime-700"
            size="sm"
          >
            <ExternalLink className="mr-2 h-3.5 w-3.5" />
            Ver Curso
          </Button>
        </a>
      </CardContent>
    </Card>
  );
}
