import { Book } from "./types";

/**
 * Busca uma capa de livro real no Open Library API baseado no título e autor.
 */
export async function fetchOpenLibraryCover(title: string, author: string): Promise<string | null> {
  const cleanTitle = title.trim();
  const cleanAuthor = author.trim();
  
  if (!cleanTitle) return null;

  try {
    // Tenta primeiro busca específica por título e autor para ser mais preciso
    let url = `https://openlibrary.org/search.json?title=${encodeURIComponent(cleanTitle)}`;
    if (cleanAuthor) {
      url += `&author=${encodeURIComponent(cleanAuthor)}`;
    }
    url += "&limit=1";

    let response = await fetch(url);
    if (!response.ok) throw new Error("Falha ao buscar capa específica");
    let data = await response.json();

    if (data.docs && data.docs.length > 0 && data.docs[0].cover_i) {
      return `https://covers.openlibrary.org/b/id/${data.docs[0].cover_i}-L.jpg`;
    }

    // Se falhar e tiver autor, tenta uma busca geral combinada
    if (cleanAuthor) {
      const generalUrl = `https://openlibrary.org/search.json?q=${encodeURIComponent(cleanTitle + " " + cleanAuthor)}&limit=1`;
      response = await fetch(generalUrl);
      if (response.ok) {
        data = await response.json();
        if (data.docs && data.docs.length > 0 && data.docs[0].cover_i) {
          return `https://covers.openlibrary.org/b/id/${data.docs[0].cover_i}-L.jpg`;
        }
      }
    }
    
    return null;
  } catch (err) {
    console.warn("Erro ao buscar a capa:", err);
    return null;
  }
}

/**
 * Cria uma cor de fundo pastel, sofisticada e baseada no gênero para as capas geradas dinamicamente.
 */
export function getGenreColor(genre: string): { bg: string; text: string; border: string; accent: string } {
  const g = (genre || "Outros").toLowerCase().trim();
  
  if (g.includes("ficção") || g.includes("fantasia") || g.includes("sci-fi") || g.includes("scifi")) {
    return { bg: "bg-indigo-950", text: "text-indigo-100", border: "border-indigo-800", accent: "indigo" };
  }
  if (g.includes("mister") || g.includes("policial") || g.includes("suspense") || g.includes("terror")) {
    return { bg: "bg-slate-900", text: "text-slate-100", border: "border-slate-700", accent: "slate" };
  }
  if (g.includes("romance") || g.includes("drama") || g.includes("poesia")) {
    return { bg: "bg-rose-950", text: "text-rose-100", border: "border-rose-900", accent: "rose" };
  }
  if (g.includes("desenvolvimento") || g.includes("pessoal") || g.includes("psicologia") || g.includes("autoajuda")) {
    return { bg: "bg-teal-950", text: "text-teal-100", border: "border-teal-900", accent: "teal" };
  }
  if (g.includes("história") || g.includes("biografia") || g.includes("filosofia") || g.includes("científico")) {
    return { bg: "bg-amber-950", text: "text-amber-100", border: "border-amber-900", accent: "amber" };
  }
  
  // Default: clássico escuro premium
  return { bg: "bg-stone-900", text: "text-stone-100", border: "border-stone-800", accent: "stone" };
}

/**
 * Exporta os livros informados para formato de planilha CSV utilizando o BOM do UTF-8 paras acentuações corretas no Excel.
 */
export function exportBooksToCSV(books: Book[]): void {
  const headers = [
    "Título",
    "Autor",
    "Gênero",
    "Status de Leitura",
    "Avaliação (Estrelas)",
    "Páginas Lidas",
    "Páginas Totais",
    "Data de Início",
    "Data de Conclusão",
    "Resenha / Opinião",
    "Anotações Adicionais (Notas)"
  ];

  const rows = books.map((b) => {
    const statusMap = {
      reading: "Lendo",
      read: "Lido",
      want_to_read: "Quero Ler"
    };

    // Escapa aspas normais para evitar quebra de coluna no CSV
    const escapeCSV = (str: string) => `"${(str || "").replace(/"/g, '""')}"`;
    const notesStr = b.notes && b.notes.length > 0 ? b.notes.join(" | ") : "";

    return [
      escapeCSV(b.title),
      escapeCSV(b.author),
      escapeCSV(b.genre),
      statusMap[b.status] || "Desconhecido",
      b.rating,
      b.pagesRead,
      b.totalPages,
      b.startDate || "-",
      b.endDate || "-",
      escapeCSV(b.review),
      escapeCSV(notesStr)
    ];
  });

  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.join(","))
  ].join("\r\n");

  const BOM = "\ufeff";
  const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });
  
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", `diario_de_leitura_${new Date().toISOString().slice(0, 10)}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
