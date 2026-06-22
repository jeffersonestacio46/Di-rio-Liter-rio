import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" })); // Aumentando o limite para suportar fotos em Base64 nos comentários/notas
app.use(express.urlencoded({ limit: "50mb", extended: true }));

const DB_FILE = path.join(process.cwd(), "db.json");

// Inicializa o banco de dados se não existir
function initDB() {
  if (!fs.existsSync(DB_FILE)) {
    const initialDB = {
      accounts: {
        "ana": {
          username: "ana",
          password: "123",
          name: "Ana Carolina",
          avatarColor: "bg-rose-500",
          bio: "Amante de clássicos literários e do realismo mágico. 📚✨",
          books: [
            {
              id: "1",
              title: "Dom Casmurro",
              author: "Machado de Assis",
              status: "read",
              rating: 5,
              review: "Uma obra-prima absoluta sobre a dúvida, ciúme e a sociedade carioca do século XIX.",
              notes: [
                {
                  id: "note_1",
                  text: "Lido originalmente para o clube do livro.",
                  timestamp: new Date().toISOString()
                }
              ],
              coverUrl: "https://covers.openlibrary.org/b/id/12818556-L.jpg",
              genre: "Literatura Brasileira",
              startDate: "2026-04-05",
              endDate: "2026-04-20",
              pagesRead: 256,
              totalPages: 256,
              lastUpdated: new Date().toISOString()
            }
          ],
          preferences: {
            favoriteGenres: ["Literatura Brasileira", "Clássicos"],
            favoriteAuthors: ["Machado de Assis"],
            readingGoalPerMonth: 3,
            readingGoalPerYear: 36,
            reminderTime: "19:00",
            reminderEnabled: true
          },
          friends: [
            { id: "f2", username: "lucas", name: "Lucas Silveira", avatarColor: "bg-blue-500", favoriteGenre: "Ficção Científica" },
            { id: "f3", username: "beatriz", name: "Beatriz Melo", avatarColor: "bg-emerald-500", favoriteGenre: "Romance / Fantasia" }
          ],
          pendingRequests: [],
          isDarkMode: true
        },
        "lucas": {
          username: "lucas",
          password: "123",
          name: "Lucas Silveira",
          avatarColor: "bg-blue-500",
          bio: "Explorando as estrelas através da ficção científica e tecnologia. 🚀🌌",
          books: [
            {
              id: "lucas_1",
              title: "Fundação",
              author: "Isaac Asimov",
              status: "read",
              rating: 5,
              review: "Excelente! Conceito fantástico de psico-história.",
              notes: [],
              coverUrl: null,
              genre: "Ficção Científica",
              startDate: "2026-01-05",
              endDate: "2026-02-15",
              pagesRead: 240,
              totalPages: 240,
              lastUpdated: new Date().toISOString()
            }
          ],
          preferences: {
            favoriteGenres: ["Ficção Científica", "Tecnologia"],
            favoriteAuthors: ["Isaac Asimov"],
            readingGoalPerMonth: 4,
            readingGoalPerYear: 48,
            reminderTime: "21:30",
            reminderEnabled: true
          },
          friends: [
            { id: "f1", username: "ana", name: "Ana Carolina", avatarColor: "bg-rose-500", favoriteGenre: "Literatura Brasileira" },
            { id: "f3", username: "beatriz", name: "Beatriz Melo", avatarColor: "bg-emerald-500", favoriteGenre: "Romance / Fantasia" }
          ],
          pendingRequests: [],
          isDarkMode: true
        },
        "beatriz": {
          username: "beatriz",
          password: "123",
          name: "Beatriz Melo",
          avatarColor: "bg-emerald-500",
          bio: "Perdida em mundos fantásticos e romances medievais. 🗡️🌹",
          books: [],
          preferences: {
            favoriteGenres: ["Romance", "Fantasia"],
            favoriteAuthors: ["J.R.R. Tolkien"],
            readingGoalPerMonth: 2,
            readingGoalPerYear: 24,
            reminderTime: "20:00",
            reminderEnabled: true
          },
          friends: [
            { id: "f1", username: "ana", name: "Ana Carolina", avatarColor: "bg-rose-500", favoriteGenre: "Literatura Brasileira" },
            { id: "f2", username: "lucas", name: "Lucas Silveira", avatarColor: "bg-blue-500", favoriteGenre: "Ficção Científica" }
          ],
          pendingRequests: [],
          isDarkMode: true
        }
      },
      chatMessages: [
        { id: "chat1", senderUsername: "lucas", receiverUsername: "ana", text: "Oi Ana! Já começou a ler Cem Anos de Solidão?", timestamp: new Date(Date.now() - 3600000 * 25).toISOString() },
        { id: "chat2", senderUsername: "ana", receiverUsername: "lucas", text: "Oi Lucas! Sim, estou amando cada capítulo! O realismo mágico é incrível.", timestamp: new Date(Date.now() - 3600000 * 24).toISOString() }
      ],
      friendRequests: [],
      activities: [
        {
          id: "act1",
          friendId: "f1",
          friendName: "Ana Carolina",
          avatarColor: "bg-rose-500",
          bookTitle: "Grande Sertão: Veredas",
          bookAuthor: "João Guimarães Rosa",
          type: "reading",
          timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
          likes: 3,
          likedByMe: false,
          comments: []
        }
      ]
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialDB, null, 2), "utf-8");
  } else {
    // Se o arquivo já existe, garantir que as contas padrão tenham a senha "123" caso esteja em branco
    // e tenham suas respectivas bios para enriquecer o sistema
    try {
      const data = fs.readFileSync(DB_FILE, "utf-8");
      const db = JSON.parse(data);
      let changed = false;
      if (db.accounts) {
        if (db.accounts.ana && !db.accounts.ana.password) {
          db.accounts.ana.password = "123";
          if (!db.accounts.ana.bio) db.accounts.ana.bio = "Amante de clássicos literários e do realismo mágico. 📚✨";
          changed = true;
        }
        if (db.accounts.lucas && !db.accounts.lucas.password) {
          db.accounts.lucas.password = "123";
          if (!db.accounts.lucas.bio) db.accounts.lucas.bio = "Explorando as estrelas através da ficção científica e tecnologia. 🚀🌌";
          changed = true;
        }
        if (db.accounts.beatriz && !db.accounts.beatriz.password) {
          db.accounts.beatriz.password = "123";
          if (!db.accounts.beatriz.bio) db.accounts.beatriz.bio = "Perdida em mundos fantásticos e romances medievais. 🗡️🌹";
          changed = true;
        }
      }
      if (changed) {
        fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf-8");
      }
    } catch (e) {
      console.error("Falha ao migrar db.json existente:", e);
    }
  }
}

initDB();

function getDB() {
  initDB();
  const data = fs.readFileSync(DB_FILE, "utf-8");
  return JSON.parse(data);
}

function saveDB(db: any) {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf-8");
}

// Endpoints do Banco de Dados Centralizado (Site Database)
app.get("/api/community/db", (req, res) => {
  try {
    const db = getDB();
    res.json(db);
  } catch (err: any) {
    res.status(500).json({ error: "Erro ao ler banco de dados: " + err.message });
  }
});

app.post("/api/community/sync", (req, res) => {
  try {
    const { accounts, chatMessages, friendRequests, activities } = req.body;
    const db = getDB();
    if (accounts) db.accounts = accounts;
    if (chatMessages) db.chatMessages = chatMessages;
    if (friendRequests) db.friendRequests = friendRequests;
    if (activities) db.activities = activities;
    saveDB(db);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: "Erro ao salvar banco de dados: " + err.message });
  }
});

// Instanciação preguiçosa do GoogleGenAI para evitar travamentos se a chave não estiver configurada
let aiClient: GoogleGenAI | null = null;

function getAIClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    aiClient = new GoogleGenAI({
      apiKey: apiKey || "",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Endpoint para recomendações com o Gemini 3.5 Flash
app.post("/api/gemini/recommendations", async (req, res) => {
  try {
    const { favoriteGenres = [], favoriteAuthors = [], history = [] } = req.body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(200).json({
        error: "Para obter recomendações personalizadas da Inteligência Artificial, por favor configure sua chave GEMINI_API_KEY nas Configurações > Secrets.",
        recommendations: [
          {
            title: "O Senhor dos Anéis",
            author: "J.R.R. Tolkien",
            genre: "Fantasia",
            reason: "Um clássico eterno da literatura de fantasia. Como você gosta de grandes jornadas e universos ricos, esta saga é indispensável.",
            estimatedPages: 1200
          },
          {
            title: "Fundação",
            author: "Isaac Asimov",
            genre: "Ficção Científica",
            reason: "Excelente obra de ficção científica sociológica que idealiza o futuro da humanidade, combinando com seus gostos por ficções elaboradas.",
            estimatedPages: 240
          },
          {
            title: "1984",
            author: "George Orwell",
            genre: "Ficção Distópica",
            reason: "Uma crítica política perspicaz do totalitarismo. Uma leitura marcante que gera ótimas reflexões e notas pessoais.",
            estimatedPages: 328
          }
        ]
      });
    }

    const ai = getAIClient();

    const genresStr = favoriteGenres.length > 0 ? favoriteGenres.join(", ") : "Qualquer gênero";
    const authorsStr = favoriteAuthors.length > 0 ? favoriteAuthors.join(", ") : "Autores diversos";
    const historyStr = history.length > 0 ? history.join(", ") : "Nenhum livro cadastrado ainda";

    const prompt = `Você é um curador e crítico literário de elite. O usuário quer recomendações de livros altamente personalizadas baseadas em seu perfil de leitura.
Dadas as seguintes preferências do usuário:
- Gêneros favoritos do usuário: ${genresStr}
- Autores favoritos do usuário: ${authorsStr}
- Livros lidos ou cadastrados no diário de leitura: ${historyStr}

Recomende exatamente 4 livros reais que combinem muito com esse perfil.
Para cada recomendação, forneça:
1. "title": O título do livro em português.
2. "author": O nome do autor.
3. "genre": O gênero principal do livro.
4. "reason": Um texto cativante em português explicando por que esse livro é perfeito para eles baseando-se estritamente em suas preferências.
5. "estimatedPages": O número estimado de páginas do livro (um número inteiro).

Responda em JSON seguindo rigorosamente o esquema definido.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "Você é um conselheiro literário prestativo e amigável. Todas as recomendações devem ser livros catalogados reais e em português brasileiro.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            recommendations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  author: { type: Type.STRING },
                  genre: { type: Type.STRING },
                  reason: { type: Type.STRING },
                  estimatedPages: { type: Type.INTEGER },
                },
                required: ["title", "author", "genre", "reason", "estimatedPages"],
              },
            },
          },
          required: ["recommendations"],
        },
      },
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("Não foi possível obter uma resposta em texto do Gemini.");
    }

    const data = JSON.parse(resultText.trim());
    return res.json(data);
  } catch (error: any) {
    console.error("Erro na API de recomendação:", error);
    return res.status(500).json({
      error: "Ocorreu um erro ao processar as recomendações literárias por IA: " + error.message,
    });
  }
});

// Endpoint para saúde do servidor
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date() });
});

// Configuração do Vite middleware ou arquivos estáticos
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Servidor rodando na porta http://localhost:${PORT}`);
  });
}

startServer();
