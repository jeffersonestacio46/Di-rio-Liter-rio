import React, { useState, useEffect, useRef } from "react";
import { 
  BookOpen, 
  Plus, 
  Search, 
  Award, 
  TrendingUp, 
  Sparkles, 
  Bell, 
  Download, 
  FileText, 
  CheckCircle, 
  Clock, 
  Star, 
  Edit2, 
  Trash2, 
  X, 
  Check, 
  Maximize2, 
  BookMarked,
  Info,
  Heart,
  MessageSquare,
  UserPlus,
  Users,
  UserCheck,
  RefreshCw,
  Sun,
  Moon,
  Send,
  LogOut,
  MessageCircle,
  Camera,
  Image,
  Settings,
  Lock
} from "lucide-react";
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from "recharts";
import { motion, AnimatePresence } from "motion/react";

import { Book, BookNote, UserPreferences, Recommendation, Friend, Comment, Activity, UserAccount, FriendRequest, ChatMessage } from "./types";
import { fetchOpenLibraryCover, getGenreColor, exportBooksToCSV } from "./utils";

// Livros pré-populados inicias caso a lista no localStorage esteja vazia
const DEFAULT_BOOKS: Book[] = [
  {
    id: "1",
    title: "Dom Casmurro",
    author: "Machado de Assis",
    status: "read",
    rating: 5,
    review: "Uma obra-prima absoluta sobre a dúvida, ciúme e a sociedade carioca do século XIX. A narrativa sob a perspectiva ambígua de Bentinho é genial e nos cativa do começo ao fim. Capitu traiu ou não? A genialidade está justamente na impossibilidade de responder.",
    notes: [
      "Lido originalmente para o clube do livro.",
      "Atenção especial ao capítulo dos olhos de ressaca.",
      "Análise brilhante de ciúmes obsessivo e desconfiança na elite fluminense."
    ],
    coverUrl: "https://covers.openlibrary.org/b/id/12818556-L.jpg", // Capa real do Open Library para Dom Casmurro
    genre: "Literatura Brasileira",
    startDate: "2026-04-05",
    endDate: "2026-04-20",
    pagesRead: 256,
    totalPages: 256,
    lastUpdated: new Date().toISOString()
  },
  {
    id: "2",
    title: "O Alquimista",
    author: "Paulo Coelho",
    status: "read",
    rating: 4,
    review: "Uma fábula cativante e de leitura rápida sobre seguir os seus sonhos e ouvir o seu coração. Embora simples, traz profundas reflexões filosóficas sobre a jornada pessoal de cada indivíduo e a busca pela nossa 'Lenda Pessoal'.",
    notes: [
      "Minha frase preferida: 'Quando você quer alguma coisa, todo o universo conspira para que você realize seu sonho.'",
      "Perfeito para ler em viagens longas."
    ],
    coverUrl: "https://covers.openlibrary.org/b/id/11488056-L.jpg",
    genre: "Ficção/Filosofia",
    startDate: "2026-05-10",
    endDate: "2026-05-22",
    pagesRead: 172,
    totalPages: 172,
    lastUpdated: new Date().toISOString()
  },
  {
    id: "3",
    title: "Fundação",
    author: "Isaac Asimov",
    status: "reading",
    rating: 5,
    review: "História de ficção científica espetacular sobre a queda e reconstrução de um império galáctico usando a psico-história secreta desenvolvida por Hari Seldon.",
    notes: [
      "Quero ler os próximos volumes da trilogia assim que acabar este.",
      "Reflexões interessantes sobre determinismo sociológico histórico versus escolhas livres de indivíduos específicos."
    ],
    coverUrl: null, // Deixando um nulo para testar o fallback gerado por CSS
    genre: "Ficção Científica",
    startDate: "2026-06-02",
    endDate: null,
    pagesRead: 110,
    totalPages: 240,
    lastUpdated: new Date().toISOString()
  },
  {
    id: "4",
    title: "Hábitos Atômicos",
    author: "James Clear",
    status: "want_to_read",
    rating: 0,
    review: "",
    notes: [
      "Recomendado por amigos para otimizar minha rotina diária de leitura."
    ],
    coverUrl: "https://covers.openlibrary.org/b/id/12845423-L.jpg",
    genre: "Desenvolvimento Pessoal",
    startDate: "2026-06-15",
    endDate: null,
    pagesRead: 0,
    totalPages: 320,
    lastUpdated: new Date().toISOString()
  }
];

const DEFAULT_PREFERENCES: UserPreferences = {
  favoriteGenres: ["Ficção Científica", "Literatura Brasileira", "Desenvolvimento Pessoal", "Fantasia"],
  favoriteAuthors: ["Machado de Assis", "Isaac Asimov", "J.R.R. Tolkien"],
  readingGoalPerMonth: 2,
  readingGoalPerYear: 50,
  reminderTime: "20:00",
  reminderEnabled: true
};

const DEFAULT_FRIENDS: Friend[] = [
  { id: "f1", username: "ana", name: "Ana Carolina", avatarColor: "bg-rose-500", favoriteGenre: "Literatura Brasileira", bio: "Leitora voraz apaixonada por clássicos e café fresco." },
  { id: "f2", username: "lucas", name: "Lucas Silveira", avatarColor: "bg-blue-500", favoriteGenre: "Ficção Científica", bio: "Futurista amador, devorador de sagas espaciais e distopias." },
  { id: "f3", username: "beatriz", name: "Beatriz Melo", avatarColor: "bg-emerald-500", favoriteGenre: "Romance / Fantasia", bio: "Apenas mais uma pessoa viajando através de realidades fantásticas." }
];

const DEFAULT_ACTIVITIES: Activity[] = [
  {
    id: "act1",
    friendId: "f1",
    friendName: "Ana Carolina",
    avatarColor: "bg-rose-500",
    bookTitle: "Grande Sertão: Veredas",
    bookAuthor: "João Guimarães Rosa",
    type: "reading",
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(), // 2 horas atrás
    likes: 3,
    likedByMe: false,
    comments: [
      { id: "c1", authorName: "Lucas Silveira", text: "Esse é um dos mais difíceis da nossa literatura, mas vale muito a pena!", timestamp: new Date(Date.now() - 3600000 * 1.5).toISOString() }
    ]
  },
  {
    id: "act2",
    friendId: "f2",
    friendName: "Lucas Silveira",
    avatarColor: "bg-blue-500",
    bookTitle: "Duna",
    bookAuthor: "Frank Herbert",
    type: "read",
    rating: 5,
    timestamp: new Date(Date.now() - 3600000 * 24).toISOString(), // 24 horas atrás
    likes: 8,
    likedByMe: true,
    comments: [
      { id: "c2", authorName: "Beatriz Melo", text: "Assisti ao filme e fiquei curiosa para ler o livro! A escrita é muito densa?", timestamp: new Date(Date.now() - 3600000 * 18).toISOString() },
      { id: "c3", authorName: "Lucas Silveira", text: "É sim, Bia! Tem muita política e ecologia, mas é maravilhoso e imersivo demais.", timestamp: new Date(Date.now() - 3600000 * 16).toISOString() }
    ]
  },
  {
    id: "act3",
    friendId: "f3",
    friendName: "Beatriz Melo",
    avatarColor: "bg-emerald-500",
    bookTitle: "A Rainha Vermelha",
    bookAuthor: "Victoria Aveyard",
    type: "review",
    review: "Uma fantasia empolgante com reviravoltas intensas. Dividida entre a nobreza prateada e os rebeldes vermelhos, a protagonista é cativante. Não consegui parar de ler até o final!",
    rating: 4,
    timestamp: new Date(Date.now() - 3600000 * 48).toISOString(), // 2 dias atrás
    likes: 5,
    likedByMe: false,
    comments: []
  }
];

const RANDOM_BOOKS_POOL = [
  { title: "Cem Anos de Solidão", author: "Gabriel García Márquez", genre: "Ficção" },
  { title: "O Hobbit", author: "J.R.R. Tolkien", genre: "Fantasia" },
  { title: "Sidarta", author: "Hermann Hesse", genre: "Filosofia" },
  { title: "A Revolução dos Bichos", author: "George Orwell", genre: "Sátira Política" },
  { title: "Admirável Mundo Novo", author: "Aldous Huxley", genre: "Ficção Científica" },
  { title: "Sherlock Holmes", author: "Arthur Conan Doyle", genre: "Mistério" },
  { title: "Crime e Castigo", author: "Fiódor Dostoiévski", genre: "Clássico Russo" }
];

const RANDOM_REVIEWS = [
  "Uma leitura fantástica que me prendeu do início ao fim! Recomendo muitíssimo.",
  "Estilo de escrita único, personagens bem desenvolvidos. Fez jus à fama do autor.",
  "Narrativa emocionante e densa. Um verdadeiro clássico moderno para guardar no coração.",
  "Mais um livro devorado nesta meta de leitura. O final me surpreendeu de uma forma inacreditável!",
  "Reflexivo, desafiador e tocante de muitas formas diferentes. Vale a pena cada página."
];


export default function App() {
  // --- Estados de Cadastro & Troca de Usuários (Banco de Dados Local) ---
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [regName, setRegName] = useState("");
  const [regUsername, setRegUsername] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regAvatarColor, setRegAvatarColor] = useState("bg-amber-500");
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [authTab, setAuthTab] = useState<"login" | "register">("login");
  const [authError, setAuthError] = useState("");

  const [prefBio, setPrefBio] = useState("");
  const [prefAvatarUrl, setPrefAvatarUrl] = useState<string | null>(null);
  const [selectedFriendProfile, setSelectedFriendProfile] = useState<UserAccount | null>(null);

  // Abas e Mensagens de Comunidade
  const [socialTab, setSocialTab] = useState<'feed' | 'requests' | 'friends' | 'chat'>('feed');
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [activeChatFriend, setActiveChatFriend] = useState<Friend | null>(null);
  const [chatInput, setChatInput] = useState("");
  const [requestError, setRequestError] = useState("");
  const [requestSuccess, setRequestSuccess] = useState("");

  // --- Estados do Aplicativo ---
  const [books, setBooks] = useState<Book[]>([]);
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [recommendations, setRecommendations] = useState<Recommendation[] | null>(null);
  
  // Filtros e Pesquisa
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "reading" | "read" | "want_to_read">("all");
  const [genreFilter, setGenreFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Estado para adicionar / editar livros
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  
  // Campos do formulário de livro
  const [formTitle, setFormTitle] = useState("");
  const [formAuthor, setFormAuthor] = useState("");
  const [formGenre, setFormGenre] = useState("");
  const [formStatus, setFormStatus] = useState<"reading" | "read" | "want_to_read">("reading");
  const [formRating, setFormRating] = useState(0);
  const [formReview, setFormReview] = useState("");
  const [formNoteInput, setFormNoteInput] = useState("");
  const [formNotePhoto, setFormNotePhoto] = useState<string | null>(null);
  const [formNotes, setFormNotes] = useState<(string | BookNote)[]>([]);
  const [formTotalPages, setFormTotalPages] = useState<number>(0);
  const [formPagesRead, setFormPagesRead] = useState<number>(0);
  const [formStartDate, setFormStartDate] = useState("");
  const [formEndDate, setFormEndDate] = useState("");
  const [isCoverSearching, setIsCoverSearching] = useState(false);

  // Detalhes do Livro Selecionado para visualização expandida
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  // Configuração das Preferências (Modo Edição)
  const [isConfiguringPreferences, setIsConfiguringPreferences] = useState(false);
  const [prefGenresInput, setPrefGenresInput] = useState("");
  const [prefAuthorsInput, setPrefAuthorsInput] = useState("");
  const [prefGoal, setPrefGoal] = useState(2);
  const [prefGoalYear, setPrefGoalYear] = useState(50);
  const [prefReminderTime, setPrefReminderTime] = useState("20:00");
  const [prefReminderEnabled, setPrefReminderEnabled] = useState(true);

  // Estados dos Amigos e Feed de Atividades
  const [friends, setFriends] = useState<Friend[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [commentDrafts, setCommentDrafts] = useState<{[activityId: string]: string}>({});
  const [commentDraftPhotos, setCommentDraftPhotos] = useState<{[activityId: string]: string}>({});
  const [newFriendName, setNewFriendName] = useState("");
  const [newFriendGenre, setNewFriendGenre] = useState("Ficção");

  // Metadados de Recomendações
  const [recsLastUpdated, setRecsLastUpdated] = useState<string | null>(null);

  // Estados dos Lembretes e Relógio em tempo real
  const [currentTime, setCurrentTime] = useState<string>("");
  const [reminderAlert, setReminderAlert] = useState<boolean>(false);
  const [reminderDismissed, setReminderDismissed] = useState<boolean>(false);

  // Estados de recomendação com IA
  const [isGeneratingRecs, setIsGeneratingRecs] = useState(false);
  const [recsError, setRecsError] = useState<string | null>(null);

  const syncWithServer = async (payload: {
    accounts?: Record<string, UserAccount>;
    chatMessages?: ChatMessage[];
    friendRequests?: FriendRequest[];
    activities?: Activity[];
  }) => {
    try {
      await fetch("/api/community/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
    } catch (err) {
      console.error("Erro ao sincronizar com o servidor:", err);
    }
  };

  // Função para sincronizar dados do usuário ativo com o "banco de dados" local (localStorage) e o servidor
  const syncUserToStorage = (updatedUser: UserAccount) => {
    setCurrentUser(updatedUser);
    const storedAccounts = localStorage.getItem("diario_accounts");
    if (storedAccounts) {
      const accounts = JSON.parse(storedAccounts);
      accounts[updatedUser.username] = updatedUser;
      localStorage.setItem("diario_accounts", JSON.stringify(accounts));
      // Envia ao servidor para persistência em disco real
      syncWithServer({ accounts });
    }
  };

  const toggleTheme = () => {
    const nextMode = !isDarkMode;
    setIsDarkMode(nextMode);
    if (currentUser) {
      const updatedUser = { ...currentUser, isDarkMode: nextMode };
      syncUserToStorage(updatedUser);
    }
  };

  // Carregar dados iniciais do LocalStorage e do servidor
  useEffect(() => {
    // 1. Carregar localmente do localStorage primeiro para exibição instantânea
    const storedAccounts = localStorage.getItem("diario_accounts");
    let initialAccounts: Record<string, UserAccount> = storedAccounts ? JSON.parse(storedAccounts) : {};
    
    const storedChats = localStorage.getItem("diario_chat_messages");
    if (storedChats) setChatMessages(JSON.parse(storedChats));
    
    const storedRequests = localStorage.getItem("diario_friend_requests");
    if (storedRequests) setFriendRequests(JSON.parse(storedRequests));
    
    const storedActivities = localStorage.getItem("diario_atividades");
    if (storedActivities) setActivities(JSON.parse(storedActivities));

    const loggedUsername = localStorage.getItem("diario_logged_in_user");
    if (loggedUsername && initialAccounts[loggedUsername]) {
      const userObj = initialAccounts[loggedUsername];
      setCurrentUser(userObj);
      setBooks(userObj.books || []);
      setPreferences(userObj.preferences || DEFAULT_PREFERENCES);
      setFriends(userObj.friends || []);
      setIsDarkMode(userObj.isDarkMode !== undefined ? userObj.isDarkMode : true);
      
      const userPrefs = userObj.preferences || DEFAULT_PREFERENCES;
      setPrefGoal(userPrefs.readingGoalPerMonth);
      setPrefGoalYear(userPrefs.readingGoalPerYear || 50);
      setPrefReminderTime(userPrefs.reminderTime);
      setPrefReminderEnabled(userPrefs.reminderEnabled);
      setPrefGenresInput(userPrefs.favoriteGenres.join(", "));
      setPrefAuthorsInput(userPrefs.favoriteAuthors.join(", "));
      setPrefBio(userObj.bio || "");
      setPrefAvatarUrl(userObj.avatarUrl || null);
    }

    // 2. Buscar dados em tempo real do banco de dados no servidor
    const fetchServerData = async () => {
      try {
        const response = await fetch("/api/community/db");
        if (response.ok) {
          const dbData = await response.json();
          const serverAccounts = dbData.accounts || {};
          const serverChats = dbData.chatMessages || [];
          const serverRequests = dbData.friendRequests || [];
          const serverActivities = dbData.activities || [];
          
          // Guardar no localStorage
          localStorage.setItem("diario_accounts", JSON.stringify(serverAccounts));
          localStorage.setItem("diario_chat_messages", JSON.stringify(serverChats));
          localStorage.setItem("diario_friend_requests", JSON.stringify(serverRequests));
          localStorage.setItem("diario_atividades", JSON.stringify(serverActivities));
          
          // Atualizar estados locais do React
          setChatMessages(serverChats);
          setFriendRequests(serverRequests);
          setActivities(serverActivities);
          
          const currentLogged = localStorage.getItem("diario_logged_in_user");
          if (currentLogged && serverAccounts[currentLogged]) {
            const userObj = serverAccounts[currentLogged];
            setCurrentUser(userObj);
            setBooks(userObj.books || []);
            setPreferences(userObj.preferences || DEFAULT_PREFERENCES);
            setFriends(userObj.friends || []);
            setIsDarkMode(userObj.isDarkMode !== undefined ? userObj.isDarkMode : true);
            
            const userPrefs = userObj.preferences || DEFAULT_PREFERENCES;
            setPrefGoal(userPrefs.readingGoalPerMonth);
            setPrefGoalYear(userPrefs.readingGoalPerYear || 50);
            setPrefReminderTime(userPrefs.reminderTime);
            setPrefReminderEnabled(userPrefs.reminderEnabled);
            setPrefGenresInput(userPrefs.favoriteGenres.join(", "));
            setPrefAuthorsInput(userPrefs.favoriteAuthors.join(", "));
            setPrefBio(userObj.bio || "");
            setPrefAvatarUrl(userObj.avatarUrl || null);
          }
        }
      } catch (err) {
        console.error("Erro ao buscar dados do servidor:", err);
      }
    };

    fetchServerData();

    // Carregar recomendações salvas e timestamp
    const storedRecs = localStorage.getItem("diario_recomendações");
    const storedRecsTime = localStorage.getItem("diario_recomendações_timestamp");
    if (storedRecs) {
      setRecommendations(JSON.parse(storedRecs));
    }
    if (storedRecsTime) {
      setRecsLastUpdated(storedRecsTime);
    }
  }, []);

  // Salvar livros ao alterar sincronizando com a conta ativa
  const saveBooksToStorage = (updatedBooks: Book[]) => {
    setBooks(updatedBooks);
    if (currentUser) {
      const updatedUser = { ...currentUser, books: updatedBooks };
      syncUserToStorage(updatedUser);
    }
  };

  // Salvar preferências ao alterar sincronizando com a conta ativa
  const savePrefsToStorage = (updatedPrefs: UserPreferences, updatedBio?: string, updatedAvatarUrl?: string | null) => {
    setPreferences(updatedPrefs);
    if (currentUser) {
      const updatedUser: UserAccount = { 
        ...currentUser, 
        preferences: updatedPrefs,
        bio: updatedBio !== undefined ? updatedBio : currentUser.bio,
        avatarUrl: updatedAvatarUrl !== undefined ? (updatedAvatarUrl || undefined) : currentUser.avatarUrl
      };
      syncUserToStorage(updatedUser);
    }
  };

  // Relógio interno de simulação de lembrete diário
  useEffect(() => {
    const updateTimeSeconds = () => {
      const now = new Date();
      const localTimeString = now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
      setCurrentTime(localTimeString);

      // Dispara o alerta se habilitado, o horário coincidir e não tiver sido descartado hoje
      if (
        preferences.reminderEnabled && 
        localTimeString === preferences.reminderTime && 
        !reminderDismissed
      ) {
        setReminderAlert(true);
        // Exibe notificação no browser se tiver permissão
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification("Hora da Leitura! 📕", {
            body: `São ${preferences.reminderTime}. Que tal ler algumas páginas do seu livro agora?`,
            icon: "/favicon.ico"
          });
        }
      } else if (localTimeString !== preferences.reminderTime) {
        // Reseta o descarte do alerta para o dia seguinte quando mudar de minuto
        setReminderDismissed(false);
      }
    };

    updateTimeSeconds();
    const timer = setInterval(updateTimeSeconds, 10000); // checa a cada 10s

    // Solicita permissão de notificação nativa por capricho se habilitado
    if ("Notification" in window && Notification.permission === "default" && preferences.reminderEnabled) {
      Notification.requestPermission();
    }

    return () => clearInterval(timer);
  }, [preferences.reminderTime, preferences.reminderEnabled, reminderDismissed]);

  // Lista de gêneros únicos para preencher o filtro de busca lateral
  const allGenresList = ["all", ...new Set(books.map((b) => b.genre).filter(Boolean))];

  // Filtragem dinâmica de livros baseada em pesquisa, status e gênero
  const filteredBooks = books.filter((b) => {
    const matchesSearch = 
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.genre || "").toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || b.status === statusFilter;
    const matchesGenre = genreFilter === "all" || b.genre === genreFilter;

    return matchesSearch && matchesStatus && matchesGenre;
  });

  // --- Processamento dos dados para o Gráfico de Desempenho Mensal ---
  const monthsBR = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  
  const getChartData = () => {
    const data = [];
    const now = new Date();
    
    // Mostra os últimos 6 meses cronológicos dinamicamente
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthIndex = d.getMonth();
      const year = d.getFullYear();
      const monthPrefix = `${year}-${String(monthIndex + 1).padStart(2, '0')}`; // formato YYYY-MM

      // Livros lidos terminados nesse mês específico
      const finishedBooks = books.filter(
        (b) => b.status === "read" && b.endDate && b.endDate.startsWith(monthPrefix)
      );
      
      // Soma aproximada de páginas lidas naquele mês
      // Considera todas as páginas do livro concluído + páginas parciais lidas em livros na lista 'reading' iniciados nesse mês
      const pagesCompletedInFinished = finishedBooks.reduce((sum, b) => sum + b.totalPages, 0);
      const pagesInReadingStarted = books
        .filter((b) => b.status === "reading" && b.startDate && b.startDate.startsWith(monthPrefix))
        .reduce((sum, b) => sum + b.pagesRead, 0);

      data.push({
        label: `${monthsBR[monthIndex]}/${String(year).slice(-2)}`,
        "Livros Concluídos": finishedBooks.length,
        "Páginas Lidas": pagesCompletedInFinished + pagesInReadingStarted
      });
    }
    return data;
  };

  const chartData = getChartData();

  // Livros lidos no mês atual (para comparar com a meta de leitura)
  const currentMonthPrefix = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
  const booksReadThisMonth = books.filter(
    (b) => b.status === "read" && b.endDate && b.endDate.startsWith(currentMonthPrefix)
  ).length;

  // Livros lidos no ano atual (para a meta anual de leitura)
  const currentYearStr = new Date().getFullYear().toString();
  const booksReadThisYear = books.filter(
    (b) => {
      if (b.status !== "read") return false;
      if (!b.endDate) return true;
      return b.endDate.startsWith(currentYearStr);
    }
  ).length;

  // --- Handlers de Ações para Livros ---

  // Abrir modal para Adicionar ou Editar
  const hClickAddBook = () => {
    setEditingBook(null);
    setFormTitle("");
    setFormAuthor("");
    setFormGenre("Ficção");
    setFormStatus("reading");
    setFormRating(5);
    setFormReview("");
    setFormNotes([]);
    setFormNoteInput("");
    setFormNotePhoto(null);
    setFormTotalPages(200);
    setFormPagesRead(0);
    setFormStartDate(new Date().toISOString().slice(0, 10));
    setFormEndDate("");
    setIsBookModalOpen(true);
  };

  const hClickEditBook = (book: Book, e: React.MouseEvent) => {
    e.stopPropagation(); // Evita abrir o modal de detalhes
    setEditingBook(book);
    setFormTitle(book.title);
    setFormAuthor(book.author);
    setFormGenre(book.genre || "Ficção");
    setFormStatus(book.status);
    setFormRating(book.rating);
    setFormReview(book.review);
    setFormNotes(book.notes || []);
    setFormNoteInput("");
    setFormNotePhoto(null);
    setFormTotalPages(book.totalPages);
    setFormPagesRead(book.pagesRead);
    setFormStartDate(book.startDate || "");
    setFormEndDate(book.endDate || "");
    setIsBookModalOpen(true);
  };

  const hAddNote = () => {
    if (formNoteInput.trim() || formNotePhoto) {
      const newNote: BookNote = {
        id: `note_${Date.now()}`,
        text: formNoteInput.trim(),
        photoUrl: formNotePhoto || undefined,
        timestamp: new Date().toISOString()
      };
      setFormNotes([...formNotes, newNote]);
      setFormNoteInput("");
      setFormNotePhoto(null);
    }
  };

  const hRemoveNote = (index: number) => {
    setFormNotes(formNotes.filter((_, i) => i !== index));
  };

  // Salvar formulário (Novo ou Editado) + Busca de Capa Automatizada
  const hSubmitBookForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    setIsCoverSearching(true);

    let coverUrlToUse = editingBook ? editingBook.coverUrl : null;

    // Se o título mudou ou é um livro novo e não tem capa, tentamos buscar no OpenLibrary de forma transparente e real
    const titleChanged = !editingBook || editingBook.title !== formTitle;
    const authorChanged = !editingBook || editingBook.author !== formAuthor;
    
    if (titleChanged || authorChanged || !coverUrlToUse) {
      const foundCover = await fetchOpenLibraryCover(formTitle, formAuthor);
      if (foundCover) {
        coverUrlToUse = foundCover;
      }
    }

    setIsCoverSearching(false);

    // Garantias de integridade de páginas lidas dependendo do status de leitura
    let calculatedPagesRead = formPagesRead;
    let calculatedEndDate = formEndDate;

    if (formStatus === "read") {
      calculatedPagesRead = formTotalPages;
      if (!calculatedEndDate) {
        calculatedEndDate = new Date().toISOString().slice(0, 10);
      }
    } else if (formStatus === "want_to_read") {
      calculatedPagesRead = 0;
      calculatedEndDate = "";
    }

    if (editingBook) {
      // Atualizando livro existente
      const updatedList = books.map((b) => {
        if (b.id === editingBook.id) {
          return {
            ...b,
            title: formTitle.trim(),
            author: formAuthor.trim(),
            genre: formGenre.trim() || "Feral",
            status: formStatus,
            rating: formStatus === "read" ? formRating : 0,
            review: formStatus === "read" ? formReview : "",
            notes: formNotes,
            totalPages: Number(formTotalPages) || 100,
            pagesRead: Number(calculatedPagesRead),
            startDate: formStartDate,
            endDate: calculatedEndDate || null,
            coverUrl: coverUrlToUse,
            lastUpdated: new Date().toISOString()
          };
        }
        return b;
      });
      saveBooksToStorage(updatedList);
      
      // Se selecionado estivesse aberto, atualiza também
      if (selectedBook && selectedBook.id === editingBook.id) {
        setSelectedBook(updatedList.find(x => x.id === editingBook.id) || null);
      }
    } else {
      // Criando novo livro
      const newBookObj: Book = {
        id: String(Date.now()),
        title: formTitle.trim(),
        author: formAuthor.trim(),
        genre: formGenre.trim() || "Ficção",
        status: formStatus,
        rating: formStatus === "read" ? formRating : 0,
        review: formStatus === "read" ? formReview : "",
        notes: formNotes,
        totalPages: Number(formTotalPages) || 100,
        pagesRead: Number(calculatedPagesRead),
        startDate: formStartDate,
        endDate: calculatedEndDate || null,
        coverUrl: coverUrlToUse,
        lastUpdated: new Date().toISOString()
      };
      saveBooksToStorage([newBookObj, ...books]);
    }

    setIsBookModalOpen(false);
    setEditingBook(null);
  };

  // Excluir livro cadastrado
  const hDeleteBook = (bookId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (confirm("Tem certeza de que deseja excluir este livro e todos os seus registros associados?")) {
      const remaining = books.filter((b) => b.id !== bookId);
      saveBooksToStorage(remaining);
      if (selectedBook && selectedBook.id === bookId) {
        setSelectedBook(null);
      }
    }
  };

  // Atalho do Card: Log rápido de aumento de páginas de leitura do dia
  const hQuickIncrementPages = (book: Book, amount: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const targetPages = Math.min(book.totalPages, book.pagesRead + amount);
    const becameCompleted = targetPages >= book.totalPages;

    const updated = books.map((b) => {
      if (b.id === book.id) {
        return {
          ...b,
          pagesRead: targetPages,
          status: becameCompleted ? "read" as const : b.status,
          endDate: becameCompleted ? new Date().toISOString().slice(0, 10) : b.endDate,
          lastUpdated: new Date().toISOString()
        };
      }
      return b;
    });

    saveBooksToStorage(updated);
    if (selectedBook && selectedBook.id === book.id) {
      setSelectedBook(updated.find(x => x.id === book.id) || null);
    }
  };

  // --- Handlers de Ações para Preferências ---

  const hOpenPreferences = () => {
    setPrefGoal(preferences.readingGoalPerMonth);
    setPrefGoalYear(preferences.readingGoalPerYear || 50);
    setPrefReminderTime(preferences.reminderTime);
    setPrefReminderEnabled(preferences.reminderEnabled);
    setPrefGenresInput(preferences.favoriteGenres.join(", "));
    setPrefAuthorsInput(preferences.favoriteAuthors.join(", "));
    setIsConfiguringPreferences(true);
  };

  const hSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    const gList = prefGenresInput.split(",").map((s) => s.trim()).filter(Boolean);
    const aList = prefAuthorsInput.split(",").map((s) => s.trim()).filter(Boolean);

    const updated: UserPreferences = {
      favoriteGenres: gList.length > 0 ? gList : DEFAULT_PREFERENCES.favoriteGenres,
      favoriteAuthors: aList.length > 0 ? aList : DEFAULT_PREFERENCES.favoriteAuthors,
      readingGoalPerMonth: Number(prefGoal) || 1,
      readingGoalPerYear: Number(prefGoalYear) || 50,
      reminderTime: prefReminderTime || "20:00",
      reminderEnabled: prefReminderEnabled
    };

    savePrefsToStorage(updated, prefBio, prefAvatarUrl);
    setIsConfiguringPreferences(false);
    
    // Limpa recomendações antigas para que o usuário sinta que mudou de perfil e precisa recalcular
    setRecommendations(null);
    localStorage.removeItem("diario_recomendações");
    localStorage.removeItem("diario_recomendações_timestamp");
    setRecsLastUpdated(null);
  };

  // --- Integração com o Gemini API (Proxy no Servidor) ---

  const hGenerateGeminiRecs = async () => {
    setIsGeneratingRecs(true);
    setRecsError(null);

    try {
      // Analisar livros marcados como lidos e suas avaliações dadas/gêneros para sugerir novos títulos
      const readBooks = books.filter(b => b.status === "read");
      const historyTitles = readBooks.length > 0
        ? readBooks.slice(0, 10).map((b) => `Título: ${b.title}, Autor: ${b.author}, Comentário/Resenha: "${b.review || ""}", Avaliação: ${b.rating}/5 estrelas, Gênero: ${b.genre}`)
        : books.slice(0, 10).map((b) => `${b.title} (${b.author}) - Gênero: ${b.genre} - Status: ${b.status}`);
      
      const response = await fetch("/api/gemini/recommendations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          favoriteGenres: preferences.favoriteGenres,
          favoriteAuthors: preferences.favoriteAuthors,
          history: historyTitles,
        }),
      });

      if (!response.ok) {
        throw new Error("Falha ao comunicar com o servidor de recomendações.");
      }

      const data = await response.json();
      
      if (data.error) {
        // Erro amigável ou instrução de API Key
        setRecsError(data.error);
        if (data.recommendations) {
          setRecommendations(data.recommendations);
          localStorage.setItem("diario_recomendações", JSON.stringify(data.recommendations));
          const timeString = new Date().toLocaleDateString("pt-BR") + " às " + new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
          setRecsLastUpdated(timeString);
          localStorage.setItem("diario_recomendações_timestamp", timeString);
        }
      } else if (data.recommendations) {
        setRecommendations(data.recommendations);
        localStorage.setItem("diario_recomendações", JSON.stringify(data.recommendations));
        const timeString = new Date().toLocaleDateString("pt-BR") + " às " + new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
        setRecsLastUpdated(timeString);
        localStorage.setItem("diario_recomendações_timestamp", timeString);
      } else {
        throw new Error("Estrutura de dados inválida retornada via IA.");
      }
    } catch (err: any) {
      setRecsError("Ocorreu um erro ao obter suas recomendações. Certifique-se de que o servidor está rodando.");
      console.error(err);
    } finally {
      setIsGeneratingRecs(false);
    }
  };

  // Adicionar um livro recomendado de forma rápida ao Diário de Leitura
  const hAddRecommendedBook = async (rec: Recommendation) => {
    setIsCoverSearching(true);
    
    // Busca automática e transparente de capa na internet para a recomendação
    const coverUrl = await fetchOpenLibraryCover(rec.title, rec.author);
    
    const newBook: Book = {
      id: String(Date.now()),
      title: rec.title,
      author: rec.author,
      genre: rec.genre,
      status: "want_to_read",
      rating: 0,
      review: "",
      notes: [`Livro recomendado pela Inteligência Artificial baseado na preferência por ${rec.genre}.`],
      coverUrl: coverUrl,
      startDate: "",
      endDate: null,
      pagesRead: 0,
      totalPages: rec.estimatedPages || 300,
      lastUpdated: new Date().toISOString()
    };

    saveBooksToStorage([newBook, ...books]);
    setIsCoverSearching(false);
    alert(`"${rec.title}" foi adicionado com sucesso à sua lista de interesse ("Quero Ler")!`);
    
    // Remove o livro das recomendações atuais mostradas para evitar duplicados
    if (recommendations) {
      setRecommendations(recommendations.filter(r => r.title !== rec.title));
    }
  };

  // --- Handlers de Ações para Redes Sociais / Amigos ---

  const hToggleLikeActivity = (activityId: string) => {
    const updated = activities.map(act => {
      if (act.id === activityId) {
        return {
          ...act,
          likes: act.likedByMe ? act.likes - 1 : act.likes + 1,
          likedByMe: !act.likedByMe
        };
      }
      return act;
    });
    setActivities(updated);
    localStorage.setItem("diario_atividades", JSON.stringify(updated));
  };

  const hAddCommentToActivity = (activityId: string, e: React.FormEvent) => {
    e.preventDefault();
    const text = commentDrafts[activityId]?.trim();
    const photoUrl = commentDraftPhotos[activityId];
    if (!text && !photoUrl) return;

    const newComment: Comment = {
      id: `comm_${Date.now()}`,
      authorName: currentUser ? currentUser.name : "Você",
      text: text || "",
      photoUrl: photoUrl || undefined,
      timestamp: new Date().toISOString()
    };

    const updated = activities.map(act => {
      if (act.id === activityId) {
        return {
          ...act,
          comments: [...act.comments, newComment]
        };
      }
      return act;
    });

    setActivities(updated);
    localStorage.setItem("diario_atividades", JSON.stringify(updated));
    // Sincronizar com o servidor
    syncWithServer({ activities: updated });

    // Reset draft text & photo
    setCommentDrafts(prev => ({
      ...prev,
      [activityId]: ""
    }));
    setCommentDraftPhotos(prev => ({
      ...prev,
      [activityId]: ""
    }));
  };

  // --- Lógica de Cadastro, Troca de Contas e Amizade Sincronizada ---
  const hRegister = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUsername = regUsername.trim().toLowerCase().replace(/\s+/g, "");
    const cleanName = regName.trim();
    const cleanPassword = regPassword.trim();
    
    if (!cleanUsername || !cleanName || !cleanPassword) {
      setAuthError("Preencha todos os campos corretamente (incluindo a senha).");
      return;
    }

    if (cleanPassword.length < 3) {
      setAuthError("A senha precisa ter pelo menos 3 caracteres.");
      return;
    }

    const storedAccounts = localStorage.getItem("diario_accounts");
    const accounts = storedAccounts ? JSON.parse(storedAccounts) : {};

    if (accounts[cleanUsername]) {
      setAuthError("Este nome de usuário já está sendo utilizado por outro leitor.");
      return;
    }

    // Criar nova conta
    const newAccount: UserAccount = {
      username: cleanUsername,
      password: cleanPassword,
      name: cleanName,
      avatarColor: regAvatarColor,
      books: [], // Começa sem livros de demonstração do sistema
      preferences: {
        favoriteGenres: [],
        favoriteAuthors: [],
        readingGoalPerMonth: 1,
        readingGoalPerYear: 12,
        reminderTime: "20:00",
        reminderEnabled: true
      },
      friends: [], // Começa sem amigos
      pendingRequests: [],
      isDarkMode: true
    };

    // Salvar e fazer login
    accounts[cleanUsername] = newAccount;
    localStorage.setItem("diario_accounts", JSON.stringify(accounts));
    localStorage.setItem("diario_logged_in_user", cleanUsername);

    // Sincronizar criação de conta com o servidor
    syncWithServer({ accounts });

    setCurrentUser(newAccount);
    setBooks([]);
    setPreferences(newAccount.preferences);
    setFriends([]);
    setIsDarkMode(true);
    setRegName("");
    setRegUsername("");
    setRegPassword("");
    setAuthError("");
  };

  const hLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUser = loginUsername.trim().toLowerCase();
    const cleanPass = loginPassword.trim();

    if (!cleanUser || !cleanPass) {
      setAuthError("Digite o nome de usuário (@id) e a senha correspondente.");
      return;
    }

    const storedAccounts = localStorage.getItem("diario_accounts");
    const accounts = storedAccounts ? JSON.parse(storedAccounts) : {};

    if (accounts[cleanUser]) {
      const userObj = accounts[cleanUser];
      const correctPass = userObj.password || "123"; // fallback para as contas originais

      if (cleanPass !== correctPass) {
        setAuthError("Senha incorreta. Tente novamente!");
        return;
      }

      localStorage.setItem("diario_logged_in_user", cleanUser);
      setCurrentUser(userObj);
      setBooks(userObj.books || []);
      setPreferences(userObj.preferences || DEFAULT_PREFERENCES);
      setFriends(userObj.friends || []);
      setIsDarkMode(userObj.isDarkMode !== undefined ? userObj.isDarkMode : true);
      
      const userPrefs = userObj.preferences || DEFAULT_PREFERENCES;
      setPrefGoal(userPrefs.readingGoalPerMonth);
      setPrefGoalYear(userPrefs.readingGoalPerYear || 50);
      setPrefReminderTime(userPrefs.reminderTime);
      setPrefReminderEnabled(userPrefs.reminderEnabled);
      setPrefGenresInput(userPrefs.favoriteGenres.join(", "));
      setPrefAuthorsInput(userPrefs.favoriteAuthors.join(", "));
      setPrefBio(userObj.bio || "");
      setPrefAvatarUrl(userObj.avatarUrl || null);

      setLoginUsername("");
      setLoginPassword("");
      setAuthError("");
    } else {
      setAuthError("Usuário não encontrado.");
    }
  };

  const hQuickLoginSelect = (username: string) => {
    setLoginUsername(username);
    setAuthTab("login");
    setAuthError(`Opção rápida selecionada: @${username}. Digite a senha correspondente para entrar (tente "123").`);
  };

  const hSwitchAccountDirect = (username: string) => {
    const storedAccounts = localStorage.getItem("diario_accounts");
    const accounts = storedAccounts ? JSON.parse(storedAccounts) : {};
    
    if (accounts[username]) {
      const userObj = accounts[username];
      localStorage.setItem("diario_logged_in_user", username);
      setCurrentUser(userObj);
      setBooks(userObj.books || []);
      setPreferences(userObj.preferences || DEFAULT_PREFERENCES);
      setFriends(userObj.friends || []);
      setIsDarkMode(userObj.isDarkMode !== undefined ? userObj.isDarkMode : true);
      
      const userPrefs = userObj.preferences || DEFAULT_PREFERENCES;
      setPrefGoal(userPrefs.readingGoalPerMonth);
      setPrefGoalYear(userPrefs.readingGoalPerYear || 50);
      setPrefReminderTime(userPrefs.reminderTime);
      setPrefReminderEnabled(userPrefs.reminderEnabled);
      setPrefGenresInput(userPrefs.favoriteGenres.join(", "));
      setPrefAuthorsInput(userPrefs.favoriteAuthors.join(", "));
      setPrefBio(userObj.bio || "");
      setPrefAvatarUrl(userObj.avatarUrl || null);
      
      setRecommendations(null);
      setActiveChatFriend(null);
    } else {
      alert("Usuário não encontrado.");
    }
  };

  const hLogout = () => {
    localStorage.removeItem("diario_logged_in_user");
    setCurrentUser(null);
    setBooks([]);
    setFriends([]);
    setActiveChatFriend(null);
    setSocialTab("feed");
  };

  const hOpenFriendProfile = (username: string) => {
    const storedAccounts = localStorage.getItem("diario_accounts");
    const accounts = storedAccounts ? JSON.parse(storedAccounts) : {};
    if (accounts[username]) {
      setSelectedFriendProfile(accounts[username]);
    } else {
      alert("Este usuário não foi encontrado ou está offline.");
    }
  };

  const hOpenFriendProfileFromActivity = (act: Activity) => {
    let targetUsername = "";
    if (act.friendId === "f1" || act.friendName.includes("Ana")) targetUsername = "ana";
    else if (act.friendId === "f2" || act.friendName.includes("Lucas")) targetUsername = "lucas";
    else if (act.friendId === "f3" || act.friendName.includes("Beatriz")) targetUsername = "beatriz";
    else {
      const storedAccounts = localStorage.getItem("diario_accounts");
      const accounts = storedAccounts ? JSON.parse(storedAccounts) : {};
      const found = Object.keys(accounts).find(key => accounts[key].name === act.friendName);
      if (found) {
        targetUsername = found;
      } else {
        targetUsername = act.friendName.toLowerCase().replace(/\s+/g, "");
      }
    }
    hOpenFriendProfile(targetUsername);
  };

  const hSendFriendRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    const targetUsername = newFriendName.trim().toLowerCase();
    
    if (!targetUsername) return;
    if (targetUsername === currentUser.username) {
      setRequestError("Você não pode adicionar seu próprio perfil!");
      setRequestSuccess("");
      return;
    }

    const storedAccounts = localStorage.getItem("diario_accounts");
    const accounts = storedAccounts ? JSON.parse(storedAccounts) : {};

    if (!accounts[targetUsername]) {
      setRequestError("Usuário não encontrado. Experimente adicionar ana, lucas ou beatriz!");
      setRequestSuccess("");
      return;
    }

    const isAlreadyFriends = friends.some(f => f.username === targetUsername);
    if (isAlreadyFriends) {
      setRequestError("Vocês já são amigos!");
      setRequestSuccess("");
      return;
    }

    const storedRequests = localStorage.getItem("diario_friend_requests");
    const activeReqs: FriendRequest[] = storedRequests ? JSON.parse(storedRequests) : [];
    
    const isAlreadyPending = activeReqs.some(
      req => req.status === "pending" && 
      ((req.fromUsername === currentUser.username && req.toUsername === targetUsername) || 
       (req.fromUsername === targetUsername && req.toUsername === currentUser.username))
    );

    if (isAlreadyPending) {
      setRequestError("Já existe uma solicitação pendente entre vocês.");
      setRequestSuccess("");
      return;
    }

    const newReq: FriendRequest = {
      id: `req_${Date.now()}`,
      fromUsername: currentUser.username,
      fromName: currentUser.name,
      fromAvatarColor: currentUser.avatarColor,
      toUsername: targetUsername,
      timestamp: new Date().toISOString(),
      status: 'pending'
    };

    activeReqs.push(newReq);
    localStorage.setItem("diario_friend_requests", JSON.stringify(activeReqs));
    setFriendRequests(activeReqs);

    // Se adicionar um dos perfis pré-existentes (ana, lucas, beatriz), aceitar instantaneamente para simulação interativa
    if (["ana", "lucas", "beatriz"].includes(targetUsername)) {
      setTimeout(() => {
        const latestReqs = JSON.parse(localStorage.getItem("diario_friend_requests") || "[]") as FriendRequest[];
        const reqIdx = latestReqs.findIndex(r => r.fromUsername === currentUser.username && r.toUsername === targetUsername);
        if (reqIdx !== -1) {
          latestReqs[reqIdx].status = "accepted";
          localStorage.setItem("diario_friend_requests", JSON.stringify(latestReqs));
          setFriendRequests(latestReqs);

          const latestAccounts = JSON.parse(localStorage.getItem("diario_accounts") || "{}");
          const targetUserObj = latestAccounts[targetUsername] as UserAccount;
          const currentUserObj = latestAccounts[currentUser.username] as UserAccount;

          const currentUserAsFriend: Friend = {
            id: `f_${currentUser.username}`,
            username: currentUser.username,
            name: currentUser.name,
            avatarColor: currentUser.avatarColor,
            favoriteGenre: "Gerais"
          };

          const targetUserAsFriend: Friend = {
            id: `f_${targetUsername}`,
            username: targetUsername,
            name: targetUserObj.name,
            avatarColor: targetUserObj.avatarColor,
            favoriteGenre: targetUserObj.preferences?.favoriteGenres?.[0] || "Todos"
          };

          currentUserObj.friends = [...(currentUserObj.friends || []), targetUserAsFriend];
          targetUserObj.friends = [...(targetUserObj.friends || []), currentUserAsFriend];

          latestAccounts[currentUser.username] = currentUserObj;
          latestAccounts[targetUsername] = targetUserObj;

          localStorage.setItem("diario_accounts", JSON.stringify(latestAccounts));
          
          // Gerar atividade bonita no feed
          const storedActivities = localStorage.getItem("diario_atividades");
          const activeActs: Activity[] = storedActivities ? JSON.parse(storedActivities) : [];
          const systemActivity: Activity = {
            id: `act_sys_${Date.now()}`,
            friendId: `f_${targetUsername}`,
            friendName: targetUserObj.name,
            avatarColor: targetUserObj.avatarColor,
            bookTitle: "Tornaram-se amigos",
            bookAuthor: `Agora @${currentUser.username} e @${targetUsername} podem conversar por chat!`,
            type: "reading",
            likes: 0,
            likedByMe: false,
            comments: [],
            timestamp: new Date().toISOString()
          };
          activeActs.unshift(systemActivity);
          localStorage.setItem("diario_atividades", JSON.stringify(activeActs));
          setActivities(activeActs);

          setCurrentUser(currentUserObj);
          setFriends(currentUserObj.friends);
        }
      }, 1500);
    }

    setRequestError("");
    setRequestSuccess(`Solicitação enviada com sucesso para @${targetUsername}!`);
    setNewFriendName("");
    
    setTimeout(() => setRequestSuccess(""), 4000);
  };

  const hAcceptFriendRequest = (req: FriendRequest) => {
    if (!currentUser) return;

    const storedRequests = localStorage.getItem("diario_friend_requests");
    const activeReqs: FriendRequest[] = storedRequests ? JSON.parse(storedRequests) : [];
    const idx = activeReqs.findIndex(r => r.id === req.id);
    if (idx !== -1) {
      activeReqs[idx].status = "accepted";
      localStorage.setItem("diario_friend_requests", JSON.stringify(activeReqs));
      setFriendRequests(activeReqs);
    }

    const storedAccounts = localStorage.getItem("diario_accounts");
    if (storedAccounts) {
      const accounts = JSON.parse(storedAccounts);
      const currentUserObj = accounts[currentUser.username] as UserAccount;
      const otherUserObj = accounts[req.fromUsername] as UserAccount;

      if (currentUserObj && otherUserObj) {
        const currentUserAsFriend: Friend = {
          id: `f_${currentUser.username}`,
          username: currentUser.username,
          name: currentUser.name,
          avatarColor: currentUser.avatarColor,
          favoriteGenre: "Todos"
        };

        const otherUserAsFriend: Friend = {
          id: `f_${req.fromUsername}`,
          username: req.fromUsername,
          name: otherUserObj.name,
          avatarColor: otherUserObj.avatarColor,
          favoriteGenre: otherUserObj.preferences?.favoriteGenres?.[0] || "Todos"
        };

        currentUserObj.friends = [...(currentUserObj.friends || []), otherUserAsFriend];
        otherUserObj.friends = [...(otherUserObj.friends || []), currentUserAsFriend];

        accounts[currentUser.username] = currentUserObj;
        accounts[req.fromUsername] = otherUserObj;

        localStorage.setItem("diario_accounts", JSON.stringify(accounts));
        
        const storedActivities = localStorage.getItem("diario_atividades");
        const activeActs: Activity[] = storedActivities ? JSON.parse(storedActivities) : [];
        const systemActivity: Activity = {
          id: `act_sys_${Date.now()}`,
          friendId: `f_${req.fromUsername}`,
          friendName: otherUserObj.name,
          avatarColor: otherUserObj.avatarColor,
          bookTitle: "Tornaram-se amigos",
          bookAuthor: `Agora @${currentUser.username} e @${req.fromUsername} podem conversar por chat!`,
          type: "reading",
          likes: 0,
          likedByMe: false,
          comments: [],
          timestamp: new Date().toISOString()
        };
        activeActs.unshift(systemActivity);
        localStorage.setItem("diario_atividades", JSON.stringify(activeActs));
        setActivities(activeActs);

        setCurrentUser(currentUserObj);
        setFriends(currentUserObj.friends);
      }
    }
  };

  const hDeclineFriendRequest = (req: FriendRequest) => {
    const storedRequests = localStorage.getItem("diario_friend_requests");
    const activeReqs: FriendRequest[] = storedRequests ? JSON.parse(storedRequests) : [];
    const updated = activeReqs.filter(r => r.id !== req.id);
    localStorage.setItem("diario_friend_requests", JSON.stringify(updated));
    setFriendRequests(updated);
  };

  const hSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !activeChatFriend || !chatInput.trim()) return;

    const msgText = chatInput.trim();
    const newMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      senderUsername: currentUser.username,
      receiverUsername: activeChatFriend.username,
      text: msgText,
      timestamp: new Date().toISOString()
    };

    const storedChats = localStorage.getItem("diario_chat_messages") || "[]";
    const messagesList: ChatMessage[] = JSON.parse(storedChats);
    messagesList.push(newMessage);
    localStorage.setItem("diario_chat_messages", JSON.stringify(messagesList));
    setChatMessages(messagesList);
    setChatInput("");

    // Resposta inteligente automática simulada para os usuários padrão
    const recipient = activeChatFriend.username;
    if (["ana", "lucas", "beatriz"].includes(recipient)) {
      setTimeout(() => {
        let replyText = "Excelente sua mensagem! Adoro compartilhar ideias literárias por aqui.";
        
        if (recipient === "lucas") {
          const lucasQuotes = [
            "Cara, de verdade, Duna é sensacional! A ficção científica tem esse poder de prever cenários e mundos incríveis.",
            "Muito bom conversar com você! Você já ajustou suas metas de leitura para este ano?",
            "Escrever resenhas no Diário Literário me ajuda muito a fixar o que li. Você tem o costume de anotar citações?",
            "Acabei de favoritar alguns gêneros aqui. A inteligência artificial me recomendou ótimos títulos!"
          ];
          replyText = lucasQuotes[Math.floor(Math.random() * lucasQuotes.length)];
        } else if (recipient === "ana") {
          const anaQuotes = [
            "Que bom falar com você! Estou lendo no momento vários clássicos nacionais, a escrita do Machado de Assis é insuperável.",
            "Um café quentinho acompanhado de uma boa leitura silenciosa é a melhor coisa do mundo. Concorda?",
            "Se você quer uma recomendação, tente ler Dom Casmurro se ainda não leu. Vale cada página!",
            "Adorei sua mensagem! Vamos juntos bater nossas metas mensais de livro!"
          ];
          replyText = anaQuotes[Math.floor(Math.random() * anaQuotes.length)];
        } else if (recipient === "beatriz") {
          const beatrizQuotes = [
            "Oi! Que ótimo interagir por aqui. Gosto muito de livros de romance, mistério e fantasias épicas.",
            "Nossa, ler é como viajar para vários mundos sem sair do lugar. Qual foi o último livro que te fez perder o sono?",
            "Interessante! O feed de atividades é incrível para pegar dicas de leitura. Vou olhar seus livros!",
            "Amei a ferramenta! O Diário Literário é perfeito para mantermos nossas leituras bem organizadas."
          ];
          replyText = beatrizQuotes[Math.floor(Math.random() * beatrizQuotes.length)];
        }

        const replyMessage: ChatMessage = {
          id: `msg_reply_${Date.now()}`,
          senderUsername: recipient,
          receiverUsername: currentUser.username,
          text: replyText,
          timestamp: new Date().toISOString()
        };

        const reStoredChats = localStorage.getItem("diario_chat_messages") || "[]";
        const reMessagesList: ChatMessage[] = JSON.parse(reStoredChats);
        reMessagesList.push(replyMessage);
        localStorage.setItem("diario_chat_messages", JSON.stringify(reMessagesList));
        setChatMessages(reMessagesList);
      }, 1200);
    }
  };

  // --- Função de Exportação para PDF (Chama janela de impressão customizada pelo print-only do index.css) ---
  const hTriggerPDFExport = () => {
    window.print();
  };

  if (!currentUser) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'dark-mode bg-sophdark text-sophtext' : 'light-mode bg-[#F4F5F7] text-zinc-900'} font-sans tracking-normal flex flex-col items-center justify-center p-4 selection:bg-sophaccent/25 relative`}>
        {/* Toggle do Tema Claro/Escuro na Tela de Cadastro */}
        <button 
          onClick={toggleTheme}
          id="theme-toggle-btn"
          className="absolute top-6 right-6 p-3 rounded-full bg-sophcard border border-zinc-800 text-sophaccent hover:scale-105 active:scale-95 transition cursor-pointer"
          title={isDarkMode ? "Mudar para Modo Comum (Claro)" : "Mudar para Modo Noturno (Escuro)"}
        >
          {isDarkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-zinc-700" />}
        </button>

        <div className="max-w-md w-full bg-sophcard border border-zinc-850 rounded-3xl p-8 shadow-xl space-y-6 relative overflow-hidden" id="auth-box">
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-sophaccent flex items-center justify-center text-black shadow-lg mx-auto mb-4">
              <BookMarked className="w-9 h-9" />
            </div>
            <h1 className="font-serif text-3xl font-bold tracking-tight text-white mb-2">
              Diário Literário
            </h1>
            <p className="text-xs text-zinc-400">
              Gerencie suas leituras, defina metas e interaja com amigos leitores de forma persistente.
            </p>
          </div>

          {authError && (
            <div className="p-3.5 bg-red-950/20 border border-red-900/60 rounded-xl text-xs text-rose-400 text-center animate-pulse">
              {authError}
            </div>
          )}

          <div className="space-y-6">
            {/* Seletor de Abas de Autenticação */}
            <div className="flex bg-zinc-950/60 p-1 rounded-2xl border border-zinc-850">
              <button
                type="button"
                onClick={() => {
                  setAuthTab("login");
                  setAuthError("");
                }}
                className={`flex-1 py-2.5 text-xs font-semibold rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  authTab === "login" 
                    ? "bg-sophaccent text-black font-bold shadow-sm" 
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <span>Entrar (Login)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthTab("register");
                  setAuthError("");
                }}
                className={`flex-1 py-2.5 text-xs font-semibold rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  authTab === "register" 
                    ? "bg-sophaccent text-black font-bold shadow-sm" 
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <span>Cadastrar (Novo Perfil)</span>
              </button>
            </div>

            {authTab === "login" ? (
              /* Formulário de Login */
              <form onSubmit={hLogin} className="space-y-4">
                <div className="border-b border-zinc-850 pb-2">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-sophaccent font-display">Acessar sua Conta</h2>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Nome de de Usuário (@ID)</label>
                  <input 
                    type="text" 
                    placeholder="Ex: jefferson"
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    required
                    className="w-full bg-zinc-900 border border-zinc-850 text-xs py-3 px-4 rounded-xl outline-none text-white focus:border-sophaccent transition font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider flex items-center gap-1">
                    <Lock className="w-3 h-3 text-sophaccent" />
                    <span>Sua Senha de Acesso</span>
                  </label>
                  <input 
                    type="password" 
                    placeholder="Digite sua senha cadastrada"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                    className="w-full bg-zinc-900 border border-zinc-850 text-xs py-3 px-4 rounded-xl outline-none text-white focus:border-sophaccent transition tracking-widest"
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full bg-sophaccent hover:bg-sophaccent-hover text-black font-bold text-xs py-3.5 rounded-full transition shadow-lg shadow-sophaccent/10 flex items-center justify-center gap-1.5 cursor-pointer mt-4"
                >
                  <UserCheck className="w-4 h-4 text-black" />
                  <span>ENTRAR NA CONTA</span>
                </button>
              </form>
            ) : (
              /* Formulário de Cadastro */
              <form onSubmit={hRegister} className="space-y-4">
                <div className="border-b border-zinc-850 pb-2">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-sophaccent font-display">Cadastre seu Perfil</h2>
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Seu Nome</label>
                  <input 
                    type="text" 
                    placeholder="Ex: Jefferson Oliveira"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    required
                    className="w-full bg-zinc-900 border border-zinc-850 text-xs py-3 px-4 rounded-xl outline-none text-white focus:border-sophaccent transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Nome de de Usuário (@ID único para adicionar amigos)</label>
                  <input 
                    type="text" 
                    placeholder="Ex: jefferson (tudo minúsculo, sem espaços)"
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    required
                    className="w-full bg-zinc-900 border border-zinc-850 text-xs py-3 px-4 rounded-xl outline-none text-white focus:border-sophaccent transition font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider flex items-center gap-1">
                    <Lock className="w-3 h-3 text-sophaccent" />
                    <span>Crie uma Senha</span>
                  </label>
                  <input 
                    type="password" 
                    placeholder="Ex: Mínimo 3 caracteres"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    required
                    className="w-full bg-zinc-900 border border-zinc-850 text-xs py-3 px-4 rounded-xl outline-none text-white focus:border-sophaccent transition tracking-widest"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Cor do seu Avatar</label>
                  <div className="flex gap-2.5">
                    {[
                      { class: "bg-rose-500", label: "Rosa" },
                      { class: "bg-blue-500", label: "Azul" },
                      { class: "bg-emerald-500", label: "Verde" },
                      { class: "bg-purple-500", label: "Roxo" },
                      { class: "bg-amber-500", label: "Dourado" },
                      { class: "bg-teal-500", label: "Ciano" },
                    ].map((col) => (
                      <button
                        key={col.class}
                        type="button"
                        onClick={() => setRegAvatarColor(col.class)}
                        className={`w-7 h-7 rounded-full ${col.class} cursor-pointer transition transform ${regAvatarColor === col.class ? 'scale-125 ring-2 ring-white border-2 border-black' : 'hover:scale-110 opacity-70'}`}
                        title={col.label}
                      />
                    ))}
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-sophaccent hover:bg-sophaccent-hover text-black font-bold text-xs py-3.5 rounded-full transition shadow-lg shadow-sophaccent/10 flex items-center justify-center gap-1.5 cursor-pointer mt-4"
                >
                  <UserCheck className="w-4 h-4 text-black" />
                  <span>CRIAR CONTA & ACESSAR PAINEL</span>
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Informações adicionais do sistema */}
        <p className="mt-8 text-center text-zinc-550 text-[11px] max-w-sm leading-relaxed">
          O <strong>Diário Literário</strong> protege e armazena os seus dados de forma persistente. Cadastre um novo perfil ou utilize suas credenciais cadastradas para entrar. Uma vez logado, você poderá cooperar no feed social, trocar mensagens e explorar a comunidade literária simulada!
        </p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark-mode bg-sophdark text-sophtext' : 'light-mode bg-[#F4F5F7] text-zinc-950'} font-sans tracking-normal selection:bg-sophaccent/25 relative`}>
      
      {/* Banner de Lembrete Diário (Tempo real) */}
      <AnimatePresence>
        {reminderAlert && (
          <motion.div 
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="no-print bg-sophaccent text-black p-4 font-display font-medium text-center flex items-center justify-center gap-3 relative z-50 shadow-md border-b border-sophaccent-hover"
            id="daily-reminder-banner"
          >
            <Bell className="w-5 h-5 animate-bounce text-black" />
            <span>
              <strong>Lembrete da Hora da Leitura! 📖</strong> Chegou o momento programado ({preferences.reminderTime}) para desfrutar de um bom livro. Que tal ler umas páginas hoje?
            </span>
            <div className="flex gap-4 ml-6">
              <button 
                onClick={() => {
                  setReminderAlert(false);
                  setReminderDismissed(true);
                }} 
                className="bg-black text-white hover:bg-zinc-900 transition py-1.5 px-4 rounded-full text-xs font-semibold"
                id="dismiss-reminder-btn"
              >
                Vou ler agora!
              </button>
              <button 
                onClick={() => {
                  setReminderAlert(false);
                  setReminderDismissed(true);
                }}
                className="text-black/80 hover:text-black hover:underline text-xs font-semibold"
                id="later-reminder-btn"
              >
                Mais tarde
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- MODO ESPELHO PRINT: Visão oculta para formatação exata de PDF na Impressão --- */}
      <div className="print-only p-12 max-w-4xl mx-auto print-container">
        <div className="border-b-2 border-stone-800 pb-4 mb-8 text-center">
          <h1 className="font-serif text-3xl font-bold text-stone-950">Relatório da Biblioteca Pessoal</h1>
          <p className="text-sm text-stone-600 mt-2">Exportado em: {new Date().toLocaleDateString("pt-BR")}</p>
        </div>
        <div className="mb-8 grid grid-cols-3 gap-4 text-center border-b border-stone-200 pb-4">
          <div>
            <span className="text-xs uppercase tracking-wider text-stone-500 font-medium">Total de Livros</span>
            <p className="text-2xl font-bold font-display text-stone-900">{books.length}</p>
          </div>
          <div>
            <span className="text-xs uppercase tracking-wider text-stone-500 font-medium font-display">Lidos Completamente</span>
            <p className="text-2xl font-bold text-stone-900">{books.filter(b => b.status === "read").length}</p>
          </div>
          <div>
            <span className="text-xs uppercase tracking-wider text-stone-500 font-medium font-display">Páginas Lidas Totais</span>
            <p className="text-2xl font-bold text-stone-900">{books.reduce((sum, b) => sum + b.pagesRead, 0)}</p>
          </div>
        </div>
        
        <h2 className="font-serif text-xl font-semibold mb-4 text-stone-950">Catálogo de Livros e Notas</h2>
        <div className="space-y-6">
          {books.map((b) => (
            <div key={b.id} className="book-print-row pb-6 mb-4 border-b border-stone-200">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg text-stone-900">{b.title}</h3>
                  <p className="text-sm text-stone-600 italic">por {b.author || "Autor Desconhecido"} — {b.genre}</p>
                </div>
                <div className="text-right text-sm">
                  <span className="font-semibold uppercase text-xs px-2 py-1 bg-stone-100 rounded text-stone-700">
                    {b.status === "read" ? "Lido" : b.status === "reading" ? "Lendo" : "Quero Ler"}
                  </span>
                  {b.rating > 0 && <p className="font-bold text-amber-600 mt-1">★ {b.rating}/5</p>}
                </div>
              </div>
              <p className="text-xs text-stone-500 mt-1">Páginas: {b.pagesRead} de {b.totalPages} lidas</p>
              {b.review && (
                <div className="mt-3 text-sm text-stone-700 bg-stone-50 p-3 rounded border border-stone-100">
                  <strong>Resenha:</strong> {b.review}
                </div>
              )}
              {b.notes && b.notes.length > 0 && (
                <div className="mt-2 text-sm text-stone-700">
                  <strong>Anotações:</strong>
                  <ul className="list-disc pl-5 mt-1 space-y-1 text-xs">
                    {b.notes.map((note, i) => {
                      const isObject = typeof note === "object" && note !== null;
                      const text = isObject ? (note as any).text : (note as string);
                      const photoUrl = isObject ? (note as any).photoUrl : undefined;
                      return (
                        <li key={i} className="space-y-1">
                          <span>{text}</span>
                          {photoUrl && (
                            <img src={photoUrl} alt="Nota anexa" className="max-w-[150px] rounded border border-stone-200 mt-1 block" referrerPolicy="no-referrer" />
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* --- HEADER PRINCIPAL (no-print) --- */}
      <header className="no-print bg-sophdark text-sophtext py-8 px-4 md:px-8 border-b border-zinc-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-sophaccent flex items-center justify-center text-black shadow-md">
              <BookMarked className="w-6 h-6 font-bold" />
            </div>
            <div>
              <h1 className="font-serif text-2xl md:text-3xl font-bold italic text-sophaccent tracking-tight flex items-center gap-2">
                Diário Literário
              </h1>
              <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                Diário de Leitura & Biblioteca Pessoal
              </p>
            </div>
          </div>
          
          {/* Botões do Acervo, Configurações e Usuário */}
          <div className="flex items-center flex-wrap gap-2 md:gap-3">
            <button 
              onClick={hClickAddBook}
              className="bg-sophaccent hover:bg-sophaccent-hover active:scale-95 text-black transition duration-150 py-2.5 px-6 rounded-full text-sm font-semibold flex items-center gap-2 shadow-lg shadow-sophaccent/10 cursor-pointer"
              id="add-book-btn"
            >
              <Plus className="w-4 h-4 font-bold" />
              <span>Registrar Livro</span>
            </button>
            <button 
              onClick={hOpenPreferences}
              className="bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white transition py-2.5 px-5 rounded-full text-sm font-medium border border-zinc-800 flex items-center gap-2 cursor-pointer"
              id="open-preferences-btn"
            >
              <Bell className="w-4 h-4 text-sophaccent" />
              <span>Lembrete & Perfil</span>
            </button>

            {/* Alternador de Modo Comum ou Noturno */}
            <button 
              onClick={toggleTheme}
              id="theme-toggle-btn"
              className="bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white transition p-2.5 rounded-full border border-zinc-800 flex items-center justify-center cursor-pointer"
              title={isDarkMode ? "Modo Comum (Claro)" : "Modo Noturno (Escuro)"}
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-zinc-500" />}
            </button>

            {/* Quadro de Perfil Ativo com Opção de Logout/Switch */}
            {currentUser && (
              <div className="flex items-center gap-2 bg-zinc-950/70 p-1.5 pl-2.5 pr-2.5 rounded-full border border-zinc-800">
                <div className={`w-7 h-7 rounded-full ${currentUser.avatarColor || 'bg-sophaccent'} flex items-center justify-center text-black font-bold text-[11px]`}>
                  {currentUser.name ? currentUser.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() : "U"}
                </div>
                <div className="hidden lg:block text-left">
                  <span className="text-[11px] font-bold text-white block leading-none">{currentUser.name}</span>
                  <span className="text-[9px] font-mono text-zinc-500 block leading-none mt-0.5">@{currentUser.username}</span>
                </div>
                <button 
                  onClick={hLogout}
                  className="p-1 rounded-full hover:bg-zinc-800 text-zinc-500 hover:text-rose-450 transition cursor-pointer"
                  title="Trocar de Conta / Logout"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            <div className="h-6 w-px bg-zinc-800 hidden sm:block" />
            <button 
              onClick={() => exportBooksToCSV(books)}
              className="bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition py-2.5 px-4 rounded-full text-xs font-medium border border-zinc-800 flex items-center gap-1.5 cursor-pointer"
              id="export-csv-btn"
              title="Exportar dados do acervo para arquivo CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">CSV</span>
            </button>
            <button 
              onClick={hTriggerPDFExport}
              className="bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition py-2.5 px-4 rounded-full text-xs font-medium border border-zinc-800 flex items-center gap-1.5 cursor-pointer"
              id="export-pdf-btn"
              title="Exportar sua biblioteca para relatório PDF de impressão"
            >
              <FileText className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">PDF</span>
            </button>
          </div>
        </div>
      </header>

      {/* --- CORPO PRINCIPAL PRINCIPAL --- */}
      <main className="no-print max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8">
        
        {/* Banner de Perfil Ativo e Recado (Status) */}
        {currentUser && (
          <div className="bg-sophcard border border-zinc-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row items-center md:items-start justify-between gap-6 relative overflow-hidden" id="user-profile-status-banner">
            <div className="absolute top-0 right-0 w-64 h-64 bg-sophaccent/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20 lg:-mr-10 lg:-mt-10" />
            <div className="flex flex-col md:flex-row items-center gap-5 text-center md:text-left w-full">
              {/* Foto de Perfil */}
              <div className={`w-20 h-20 rounded-full overflow-hidden flex items-center justify-center text-black font-bold text-3xl shrink-0 border-2 border-zinc-700 ${currentUser.avatarUrl ? 'bg-zinc-950 shadow-inner' : currentUser.avatarColor || 'bg-sophaccent'}`}>
                {currentUser.avatarUrl ? (
                  <img src={currentUser.avatarUrl} alt="Sua Foto de Perfil" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  currentUser.name ? currentUser.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() : "U"
                )}
              </div>
              <div className="space-y-1 relative flex-1">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-sophaccent font-display block">Leitor Ativo</span>
                <h2 className="font-serif text-2xl font-bold text-white tracking-tight leading-none flex items-center gap-2 justify-center md:justify-start">
                  {currentUser.name}
                </h2>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-1 text-xs text-zinc-400">
                  <span className="font-mono text-zinc-500">@{currentUser.username}</span>
                  <span className="text-zinc-700">•</span>
                  <span>Gêneros: <strong className="text-zinc-300">{preferences.favoriteGenres.join(", ") || "Todos"}</strong></span>
                </div>
                {/* Recado / Status do Perfil */}
                <div className="mt-3.5 bg-zinc-950/45 border border-zinc-850/60 py-2.5 px-4 rounded-2xl w-full max-w-lg text-xs leading-relaxed text-zinc-300 italic flex items-start gap-2.5">
                  <span className="text-sophaccent text-base leading-none">“</span>
                  <p className="flex-1 not-italic text-zinc-300">
                    {currentUser.bio ? currentUser.bio : "Escreva um recado de status personalizado nas configurações do seu perfil! 📖✨"}
                  </p>
                  <span className="text-sophaccent text-base leading-none self-end">”</span>
                </div>
              </div>
            </div>

            {/* Ações Rápidas do Perfil */}
            <button 
              onClick={hOpenPreferences}
              className="mt-2 md:mt-0 bg-zinc-900 border border-zinc-800 hover:bg-zinc-850 text-zinc-300 hover:text-white transition py-2.5 px-5 rounded-full text-xs font-semibold flex items-center gap-2 cursor-pointer shrink-0 shadow"
            >
              <Settings className="w-4 h-4 text-sophaccent" />
              <span>Configurar Perfil & Status</span>
            </button>
          </div>
        )}

        {/* Simulador de Contas (Modo Comunidade) / Apenas visível após login */}
        {currentUser && (
          <div className="bg-zinc-950/40 border border-zinc-850/80 p-5 rounded-2xl flex flex-col lg:flex-row items-center justify-between gap-4" id="simulation-accounts-bar">
            <div className="text-center lg:text-left space-y-0.5">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-sophaccent font-display block">Simulador de Contas da Comunidade</span>
              <p className="text-[11px] text-zinc-400">Alterne instantaneamente para aceitar solicitações de amizade pendentes, simular feed coletivo e testar o chat interativo!</p>
            </div>
            
            <div className="flex flex-wrap gap-2 justify-center lg:justify-end">
              {[
                { username: "ana", name: "Ana Carolina", color: "bg-rose-500" },
                { username: "lucas", name: "Lucas", color: "bg-blue-500" },
                { username: "beatriz", name: "Beatriz M.", color: "bg-emerald-500" },
              ].map((account) => {
                const isActive = currentUser.username === account.username;
                return (
                  <button
                    key={account.username}
                    onClick={() => {
                      if (!isActive) {
                        hSwitchAccountDirect(account.username);
                      }
                    }}
                    disabled={isActive}
                    className={`flex items-center gap-2 py-1.5 px-3.5 rounded-full text-xs font-semibold transition border ${
                      isActive 
                        ? "bg-zinc-900 border-sophaccent/40 text-sophaccent cursor-default opacity-85" 
                        : "bg-zinc-950 hover:bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white cursor-pointer active:scale-95"
                    }`}
                    title={isActive ? `Você já está logado como @${account.username}` : `Alternar para @${account.username}`}
                  >
                    <div className={`w-3.5 h-3.5 rounded-full ${account.color} flex items-center justify-center text-[7.5px] text-black font-extrabold shrink-0`}>
                      {account.username[0].toUpperCase()}
                    </div>
                    <span>@{account.username} {isActive && "(Você)"}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
        
        {/* --- GRID DE META & PROGRESSO MENSAL (BENTO BOX) --- */}
        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6" id="bento-stats-grid">
          
          {/* Bento Card 1: Progresso e Meta atual de Leitura */}
          <div className="bg-sophcard p-6 rounded-2xl border border-zinc-800 flex flex-col justify-between shadow-lg shadow-black/30" id="reading-goal-card">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 font-display">Meta de Leitura Mensal</span>
                <Award className="w-5 h-5 text-sophaccent" />
              </div>
              <h3 className="font-serif text-lg font-medium text-white">
                Progresso de {monthsBR[new Date().getMonth()]}
              </h3>
            </div>
            
            <div className="my-5 flex items-baseline gap-2">
              <span className="text-5xl font-bold font-display text-sophaccent">{booksReadThisMonth}</span>
              <span className="text-lg text-zinc-500">/ de {preferences.readingGoalPerMonth} livros</span>
            </div>

            <div>
              {/* Barra de progresso */}
              <div className="w-full bg-zinc-900 border border-zinc-800 rounded-full h-1.5 mb-2 overflow-hidden">
                <div 
                  className="bg-sophaccent h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (booksReadThisMonth / (preferences.readingGoalPerMonth || 1)) * 100)}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-[11px] text-zinc-500">
                <span>{percentCalc(booksReadThisMonth, preferences.readingGoalPerMonth)}% concluído</span>
                {booksReadThisMonth >= preferences.readingGoalPerMonth ? (
                  <span className="text-[#C5A059] font-semibold flex items-center gap-1">Meta Batida! 🎉</span>
                ) : (
                  <span>Faltam {Math.max(0, preferences.readingGoalPerMonth - booksReadThisMonth)} livros</span>
                )}
              </div>
            </div>
          </div>

          {/* Bento Card 2: Progresso e Meta Anual de Leitura */}
          <div className="bg-sophcard p-6 rounded-2xl border border-zinc-800 flex flex-col justify-between shadow-lg shadow-black/30" id="reading-goal-year-card">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 font-display">Meta de Leitura Anual</span>
                <Award className="w-5 h-5 text-sophaccent" />
              </div>
              <h3 className="font-serif text-lg font-medium text-white">
                Jornada de {new Date().getFullYear()}
              </h3>
            </div>
            
            <div className="my-5 flex items-baseline gap-2">
              <span className="text-5xl font-bold font-display text-sophaccent">{booksReadThisYear}</span>
              <span className="text-lg text-zinc-500">/ de {preferences.readingGoalPerYear || 50} livros</span>
            </div>

            <div>
              {/* Barra de progresso */}
              <div className="w-full bg-zinc-900 border border-zinc-800 rounded-full h-1.5 mb-2 overflow-hidden">
                <div 
                  className="bg-sophaccent h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (booksReadThisYear / (preferences.readingGoalPerYear || 50)) * 100)}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-[11px] text-zinc-500">
                <span>{percentCalc(booksReadThisYear, preferences.readingGoalPerYear || 50)}% concluído</span>
                {booksReadThisYear >= (preferences.readingGoalPerYear || 50) ? (
                  <span className="text-[#C5A059] font-semibold flex items-center gap-1">Meta Batida! 🏆</span>
                ) : (
                  <span>Faltam {Math.max(0, (preferences.readingGoalPerYear || 50) - booksReadThisYear)} livros</span>
                )}
              </div>
            </div>
          </div>

          {/* Bento Card 3: Resumo Geral */}
          <div className="bg-sophcard p-6 rounded-2xl border border-zinc-800 flex flex-col justify-between shadow-lg shadow-black/30" id="general-summary-card">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 font-display">Resumo Geral do Acervo</span>
              <BookOpen className="w-5 h-5 text-sophaccent" />
            </div>
            
            <div className="grid grid-cols-3 gap-2 text-center py-2">
              <div className="bg-zinc-950/40 p-3 rounded-xl border border-zinc-800">
                <p className="text-2xl font-bold font-display text-white">{books.length}</p>
                <p className="text-[9px] uppercase font-bold text-zinc-500 tracking-[0.1em]">Total</p>
              </div>
              <div className="bg-zinc-950/40 p-3 rounded-xl border border-zinc-800">
                <p className="text-2xl font-bold font-display text-sophaccent">
                  {books.filter((b) => b.status === "reading").length}
                </p>
                <p className="text-[9px] uppercase font-bold text-zinc-500 tracking-[0.1em]">Lendo</p>
              </div>
              <div className="bg-zinc-950/40 p-3 rounded-xl border border-zinc-800">
                <p className="text-2xl font-bold font-display text-emerald-500">
                  {books.filter((b) => b.status === "read").length}
                </p>
                <p className="text-[9px] uppercase font-bold text-zinc-500 tracking-[0.1em]">Lidos</p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-zinc-800 flex justify-between items-center text-xs text-zinc-400">
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-zinc-500" /> Total Lido:</span>
              <strong className="text-white font-medium font-mono text-sm">
                {books.reduce((sum, b) => sum + b.pagesRead, 0)} págs
              </strong>
            </div>
          </div>

          {/* Bento Card 4: Gráfico de Desempenho Mensal */}
          <div className="bg-sophcard p-6 rounded-2xl border border-zinc-800 flex flex-col justify-between shadow-lg shadow-black/30" id="monthly-chart-card">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 font-display">Desempenho Mensal (Últimos 6 meses)</span>
              <TrendingUp className="w-5 h-5 text-sophaccent" />
            </div>

            <div className="h-40 w-full" id="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1D2027" />
                  <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#808080' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#808080' }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: '1px solid #2B2E36', backgroundColor: '#161920', color: '#E0E0E0', fontFamily: 'Inter', fontSize: '12px' }}
                    cursor={{ fill: '#0F1115' }}
                  />
                  <Bar dataKey="Páginas Lidas" fill="#C5A059" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Livros Concluídos" fill="#4A4D54" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </section>

        {/* --- SESSÃO DO PERFIL E RECOMENDAÇÕES POR INTELIGÊNCIA ARTIFICIAL --- */}
        <section className="bg-zinc-950 border border-zinc-800 text-white rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden" id="ai-recs-section">
          {/* Adornos estéticos de fundo */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-sophaccent/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-zinc-700/5 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col xl:flex-row gap-8 items-start justify-between">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 bg-sophaccent/10 border border-sophaccent/20 text-sophaccent px-3 py-1 rounded-full text-xs font-semibold w-fit mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Recomendações Literárias Personalizadas baseadas em IA</span>
              </div>
              <h2 className="font-serif text-2xl md:text-3xl font-bold tracking-tight mb-2 text-white">
                O que você gostaria de ler a seguir?
              </h2>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Nossa IA analisa suas preferências de gêneros, autores e os livros cadastrados em seu diário para sugerir leituras únicas, com notas personalizadas explicando a escolha.
              </p>

              {/* Informações de Preferências na IA */}
              <div className="mt-5 flex flex-wrap gap-4 text-xs text-zinc-350 bg-zinc-900/40 p-4 rounded-xl border border-zinc-800">
                <div>
                  <span className="text-zinc-500 block mb-1">Gêneros Favoritos:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {preferences.favoriteGenres.map((g, i) => (
                      <span key={i} className="bg-zinc-950 px-2.5 py-1 rounded text-[11px] font-medium text-zinc-300 border border-zinc-850">
                        {g}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-zinc-500 block mb-1">Autores Favoritos:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {preferences.favoriteAuthors.map((a, i) => (
                      <span key={i} className="bg-zinc-950 px-2.5 py-1 rounded text-[11px] font-medium text-zinc-300 border border-zinc-850">
                        {a}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3 items-center">
                <button 
                  onClick={hGenerateGeminiRecs}
                  disabled={isGeneratingRecs}
                  className="bg-sophaccent hover:bg-sophaccent-hover active:scale-95 disabled:opacity-50 text-black font-semibold py-2.5 px-6 rounded-full text-sm transition flex items-center gap-2 shadow-lg shadow-sophaccent/10 cursor-pointer"
                  id="generate-recs-btn"
                >
                  {isGeneratingRecs ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      <span>Analisando suas preferências...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-black" />
                      <span>Gerar Recomendações (Gemini)</span>
                    </>
                  )}
                </button>
                <button 
                  onClick={hOpenPreferences}
                  className="bg-zinc-900 hover:bg-zinc-800 font-medium py-2.5 px-5 rounded-full text-sm transition flex items-center gap-2 border border-zinc-800 text-zinc-300 cursor-pointer"
                  id="edit-profile-btn"
                >
                  <Edit2 className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Ajustar Gêneros/Autores</span>
                </button>
                {recsLastUpdated && (
                  <span className="text-zinc-500 text-[11px] font-mono flex items-center gap-1.5 ml-2">
                    <RefreshCw className="w-3 h-3 text-zinc-600 animate-pulse" /> Sincronizado: {recsLastUpdated}
                  </span>
                )}
              </div>
            </div>

            {/* Listagem de Recomendações da IA */}
            <div className="w-full xl:w-1/2 min-h-[150px]">
              {isGeneratingRecs ? (
                <div className="flex flex-col items-center justify-center h-48 space-y-3 bg-zinc-900/20 rounded-2xl border border-zinc-800 p-6">
                  <div className="relative w-12 h-12">
                    <div className="absolute inset-0 border-4 border-sophaccent/20 rounded-full" />
                    <div className="absolute inset-0 border-4 border-sophaccent border-t-transparent rounded-full animate-spin" />
                  </div>
                  <p className="text-sm font-medium text-zinc-300 animate-pulse">A Inteligência Artificial do Gemini está selecionando as melhores obras para você...</p>
                  <p className="text-[11px] text-zinc-500 leading-relaxed text-center">Isso leva apenas alguns instantes.</p>
                </div>
              ) : recsError && !recommendations ? (
                <div className="bg-sophaccent/10 border border-sophaccent/20 rounded-2xl p-6 text-zinc-200">
                  <div className="flex gap-2 items-start">
                    <Info className="w-5 h-5 text-sophaccent shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-white mb-2">Acesso à IA do Gemini</p>
                      <p className="text-xs leading-relaxed text-zinc-300">
                        {recsError}
                      </p>
                    </div>
                  </div>
                </div>
              ) : recommendations ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-display">Sugestões Selecionadas pelo Gemini</h3>
                    <button 
                      onClick={() => setRecommendations(null)}
                      className="text-zinc-400 hover:text-white text-xs flex items-center gap-1 cursor-pointer"
                      id="clear-recs-btn"
                    >
                      Ocultar recomendações
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {recommendations.map((rec, idx) => (
                      <div key={idx} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex flex-col justify-between hover:border-sophaccent/50 transition-all duration-300 relative group overflow-hidden shadow-md">
                        <div className="absolute top-0 left-0 w-1 bg-sophaccent h-full" />
                        <div>
                          <div className="flex justify-between items-start gap-1">
                            <span className="bg-zinc-950 text-sophaccent text-[10px] px-2.5 py-0.5 rounded-full font-medium mb-2 border border-zinc-855">
                              {rec.genre}
                            </span>
                            <span className="text-zinc-500 text-[10px] font-mono">
                              ~{rec.estimatedPages} págs
                            </span>
                          </div>
                          <h4 className="font-serif font-bold text-base text-white group-hover:text-sophaccent transition">
                             {rec.title}
                          </h4>
                          <p className="text-xs text-zinc-400 italic mb-2 font-serif">por {rec.author}</p>
                          <p className="text-[11px] text-zinc-400 leading-relaxed mb-4">
                            {rec.reason}
                          </p>
                        </div>
                        <button 
                          onClick={() => hAddRecommendedBook(rec)}
                          className="bg-zinc-800 hover:bg-zinc-750 active:scale-95 text-xs text-sophaccent hover:text-white transition font-medium py-2 px-4 rounded-full flex items-center justify-center gap-1 w-full border border-zinc-700 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Adicionar à Lista de Interesse</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-zinc-900/25 border border-zinc-800 rounded-2xl p-8 flex flex-col items-center justify-center text-center h-full min-h-[180px]">
                  <Sparkles className="w-8 h-8 text-sophaccent mb-2 animate-pulse" />
                  <p className="text-sm text-zinc-300 font-medium font-display mb-1">Personalização Inteligente</p>
                  <p className="text-xs text-zinc-500 max-w-sm">
                    Clique em "Gerar Recomendações" para obter 4 sugestões exclusivas baseadas em seu gosto atual.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* --- BARRA DE BUSCA, FILTRAGEM E VISÃO DO ACERVO --- */}
        <section className="bg-sophcard rounded-2xl border border-zinc-800 p-5 shadow-sm space-y-4" id="filters-section">
          <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
            
            {/* Campo de Busca Texto */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-650" />
              <input 
                type="text"
                placeholder="Pesquisar livros por título, autor ou gênero..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-900/60 border border-zinc-800 hover:border-zinc-750 focus:border-sophaccent focus:ring-1 focus:ring-sophaccent focus:bg-zinc-900/90 transition py-2.5 pl-11 pr-4 rounded-full text-sm text-white placeholder:text-zinc-500 outline-none"
                id="search-input"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white bg-zinc-800 hover:bg-zinc-700 p-1 rounded-full cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Seletores de Filtros */}
            <div className="flex flex-wrap items-center gap-3">
              
              <div>
                <select 
                  value={statusFilter}
                  onChange={(e: any) => setStatusFilter(e.target.value)}
                  className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 focus:border-sophaccent text-xs py-2.5 px-3.5 rounded-full text-zinc-300 font-medium outline-none cursor-pointer"
                  id="status-filter-select"
                >
                  <option value="all">📚 Todos Status</option>
                  <option value="reading">📖 Lendo Atualmente</option>
                  <option value="read">✅ Concluídos (Lidos)</option>
                  <option value="want_to_read">📌 Quero Ler</option>
                </select>
              </div>

              <div>
                <select 
                  value={genreFilter}
                  onChange={(e) => setGenreFilter(e.target.value)}
                  className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 focus:border-sophaccent text-xs py-2.5 px-3.5 rounded-full text-zinc-300 font-medium outline-none cursor-pointer capitalize"
                  id="genre-filter-select"
                >
                  <option value="all">🎨 Todos Gêneros</option>
                  {allGenresList.filter(g => g !== "all").map((g, i) => (
                    <option key={i} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              {/* Botão União Mudança de Grid/List */}
              <div className="bg-zinc-900 border border-zinc-800 p-1 rounded-full flex items-center">
                <button 
                  onClick={() => setViewMode("grid")}
                  className={`py-1.5 px-4 rounded-full text-xs font-semibold tracking-wide transition cursor-pointer ${viewMode === "grid" ? "bg-sophaccent text-black shadow-sm" : "text-zinc-500 hover:text-zinc-300"}`}
                  id="grid-mode-btn"
                >
                  Grid
                </button>
                <button 
                  onClick={() => setViewMode("list")}
                  className={`py-1.5 px-4 rounded-full text-xs font-semibold tracking-wide transition cursor-pointer ${viewMode === "list" ? "bg-sophaccent text-black shadow-sm" : "text-zinc-500 hover:text-zinc-300"}`}
                  id="list-mode-btn"
                >
                  Lista
                </button>
              </div>

            </div>

          </div>

          {/* Tag de Resultados Ativos se houver busca */}
          {(searchQuery || statusFilter !== "all" || genreFilter !== "all") && (
            <div className="flex items-center justify-between text-xs text-zinc-500 bg-zinc-900/20 py-2 px-4 rounded-full border border-zinc-800">
              <span className="flex items-center gap-1.5">
                Filtrados <strong>{filteredBooks.length}</strong> de <strong>{books.length}</strong> livros no total no acervo.
              </span>
              <button 
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("all");
                  setGenreFilter("all");
                }}
                className="text-sophaccent hover:text-sophaccent-hover transition cursor-pointer font-semibold underline"
              >
                Limpar Filtros
              </button>
            </div>
          )}
        </section>

          {/* --- LISTAGEM DE LIVROS (GRID OU LISTA) --- */}
        {filteredBooks.length === 0 ? (
          <div className="bg-sophcard rounded-2xl border border-zinc-800 p-12 text-center shadow-lg" id="empty-state-container">
            <BookOpen className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
            <p className="text-base text-zinc-350 font-semibold font-display">Nenhum livro encontrado</p>
            <p className="text-xs text-zinc-500 max-w-md mx-auto mt-1 leading-relaxed">
              Tente redefinir seus filtros acima ou cadastre um novo livro clicando no botão "Registrar Livro" acima no menu principal.
            </p>
            <button 
              onClick={hClickAddBook}
              className="mt-4 bg-sophaccent hover:bg-sophaccent-hover text-black font-semibold py-2 px-5 rounded-full text-xs transition active:scale-95 cursor-pointer"
            >
              Registrar primeiro livro
            </button>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6" id="books-grid-layout">
            <AnimatePresence mode="popLayout">
              {filteredBooks.map((book) => {
                const colorTheme = getGenreColor(book.genre);
                const percentRead = Math.round((book.pagesRead / (book.totalPages || 1)) * 100);

                return (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    key={book.id}
                    onClick={() => setSelectedBook(book)}
                    className="bg-sophcard rounded-3xl border border-zinc-800/85 shadow-lg shadow-black/25 overflow-hidden hover:shadow-xl hover:border-zinc-700 transition-all duration-300 group cursor-pointer flex flex-col justify-between animate-fadeIn"
                  >
                    {/* Capa e Banner estético do topo do card */}
                    <div className="relative aspect-[3/4] bg-zinc-950 overflow-hidden">
                      {book.coverUrl ? (
                        <img 
                          src={book.coverUrl} 
                          alt={`Capa de ${book.title}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          referrerPolicy="no-referrer"
                          loading="lazy"
                        />
                      ) : (
                        /* Fallback premium de capa com CSS geométrico */
                        <div className={`w-full h-full ${colorTheme.bg} p-5 flex flex-col justify-between relative`}>
                          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-200 via-stone-900 to-amber-950 pointer-events-none" />
                          <div className={`border-b border-white/20 pb-2`}>
                            <p className="text-[10px] font-mono tracking-wider opacity-60 text-zinc-300 uppercase truncate">
                              {book.genre || "Biblioteca"}
                            </p>
                          </div>
                          <div className="my-auto py-1.5">
                            <h3 className="font-serif font-bold text-lg text-white leading-tight break-words tracking-tight">
                              {book.title}
                            </h3>
                            <p className="text-xs text-zinc-300 font-sans italic mt-1.5 opacity-80">
                              {book.author}
                            </p>
                          </div>
                          <div className="border-t border-white/10 pt-2 flex items-center justify-between">
                            <span className="text-[9px] font-mono font-medium tracking-widest opacity-40 uppercase text-zinc-400">Classics</span>
                            <div className="w-2.5 h-2.5 rounded-full bg-sophaccent" />
                          </div>
                        </div>
                      )}

                      {/* Pill Badge do Status */}
                      <span className={`absolute top-3 right-3 text-[10px] tracking-wide font-semibold px-2 px-2.5 py-1 rounded-full shadow-md text-white border ${
                        book.status === "read" 
                          ? "bg-emerald-600 border-emerald-500" 
                          : book.status === "reading" 
                            ? "bg-sophaccent text-black border-sophaccent" 
                            : "bg-zinc-805 border-zinc-750 text-zinc-300"
                      }`}>
                        {book.status === "read" ? "Lido" : book.status === "reading" ? "Lendo" : "Quero Ler"}
                      </span>

                      {/* Overlay com ação de edição rápida */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button 
                          onClick={(e) => hClickEditBook(book, e)}
                          className="bg-white text-black p-2.5 rounded-full shadow-lg hover:bg-zinc-200 active:scale-95 transition cursor-pointer"
                          title="Editar registros deste livro"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={(e) => hDeleteBook(book.id, e)}
                          className="bg-red-650 text-white p-2.5 rounded-full shadow-lg hover:bg-red-500 active:scale-95 transition cursor-pointer"
                          title="Excluir livro do acervo"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Informações texto do livro abaixo da capa */}
                    <div className="p-4 space-y-3">
                      <div>
                        {book.rating > 0 && book.status === "read" && (
                          <div className="flex gap-0.5 mb-1.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star 
                                key={i} 
                                className={`w-3.5 h-3.5 ${i < book.rating ? "text-sophaccent fill-sophaccent" : "text-zinc-800"}`} 
                              />
                            ))}
                          </div>
                        )}
                        <h3 className="font-serif font-bold text-white truncate text-base mb-0.5 group-hover:text-sophaccent transition" title={book.title}>
                          {book.title}
                        </h3>
                        <p className="text-xs text-zinc-400 truncate">{book.author || "Autor não especificado"}</p>
                      </div>

                      {/* Barra de Progresso Interno do livro */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] text-zinc-500 font-medium">
                          <span>{book.pagesRead} de {book.totalPages} págs</span>
                          <span>{percentRead}%</span>
                        </div>
                        <div className="w-full bg-zinc-950 border border-zinc-900 rounded-full h-1 overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-300 ${
                              book.status === "read" ? "bg-emerald-500" : "bg-sophaccent"
                            }`}
                            style={{ width: `${percentRead}%` }}
                          />
                        </div>
                      </div>

                      {/* Atalhos Rápidos para leitura (Apenas para livros lendo) */}
                      {book.status === "reading" && (
                        <div className="pt-2 border-t border-zinc-850 flex items-center justify-between gap-1.5">
                          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Leitura rápida:</span>
                          <div className="flex gap-1">
                            <button 
                              onClick={(e) => hQuickIncrementPages(book, 10, e)}
                              className="bg-zinc-900 hover:bg-zinc-850 active:bg-zinc-800 border border-zinc-805 text-zinc-300 py-1 px-2 rounded text-[10px] font-bold transition cursor-pointer"
                              title="Marcar +10 páginas lidas hoje"
                            >
                              +10p
                            </button>
                            <button 
                              onClick={(e) => hQuickIncrementPages(book, 30, e)}
                              className="bg-zinc-900 hover:bg-zinc-850 active:bg-zinc-800 border border-zinc-805 text-zinc-300 py-1 px-2 rounded text-[10px] font-bold transition cursor-pointer"
                              title="Marcar +30 páginas lidas hoje"
                            >
                              +30p
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        ) : (
          /* MODO DE VISÃO EM TABELA / LISTA */
          <div className="bg-sophcard rounded-3xl border border-zinc-800/80 shadow-xl overflow-hidden" id="books-list-layout">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-zinc-400">
                <thead className="bg-zinc-950/60 text-xs font-semibold uppercase text-zinc-400 border-b border-zinc-800">
                  <tr>
                    <th className="py-4 px-6 font-display">Obra / Autor</th>
                    <th className="py-4 px-4 font-display">Gênero</th>
                    <th className="py-4 px-4 font-display">Status</th>
                    <th className="py-4 px-4 font-display">Avaliação</th>
                    <th className="py-4 px-4 font-display">Progresso Páginas</th>
                    <th className="py-4 px-6 text-right font-display">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-850">
                  {filteredBooks.map((book) => {
                    const percentRead = Math.round((book.pagesRead / (book.totalPages || 1)) * 100);
                    return (
                      <tr 
                        key={book.id} 
                        onClick={() => setSelectedBook(book)}
                        className="hover:bg-zinc-900/40 transition-colors cursor-pointer group"
                      >
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-10 bg-zinc-950 rounded overflow-hidden flex-shrink-0 border border-zinc-800">
                              {book.coverUrl ? (
                                <img src={book.coverUrl} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                              ) : (
                                <div className="w-full h-full bg-zinc-805 flex items-center justify-center text-[8px] text-zinc-400 font-bold p-1 overflow-hidden truncate">
                                  {book.title[0]}
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="font-serif font-bold text-white group-hover:text-sophaccent transition">
                                {book.title}
                              </p>
                              <p className="text-xs text-zinc-500 italic font-serif">por {book.author}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-xs font-medium text-zinc-300 bg-zinc-900 px-2.5 py-1 rounded-full border border-zinc-855">
                            {book.genre}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                            book.status === "read" ? "bg-emerald-950/40 text-emerald-400 border border-emerald-900/60" :
                            book.status === "reading" ? "bg-amber-950/40 text-sophaccent border border-amber-900/60" :
                            "bg-zinc-900 text-zinc-400 border border-zinc-800"
                          }`}>
                            {book.status === "read" ? "Lido" : book.status === "reading" ? "Lendo" : "Quero Ler"}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          {book.status === "read" && book.rating > 0 ? (
                            <div className="flex items-center gap-0.5">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star key={i} className={`w-3 h-3 ${i < book.rating ? "text-sophaccent fill-sophaccent" : "text-zinc-800"}`} />
                              ))}
                            </div>
                          ) : (
                            <span className="text-xs text-zinc-650 font-mono">-</span>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <div className="w-36">
                            <div className="flex justify-between text-[10px] text-zinc-500 mb-1 font-medium">
                              <span>{book.pagesRead}/{book.totalPages} p</span>
                              <span>{percentRead}%</span>
                            </div>
                            <div className="w-full bg-zinc-950 border border-zinc-900 rounded-full h-1 overflow-hidden">
                              <div className="bg-sophaccent h-full rounded-full" style={{ width: `${percentRead}%` }} />
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-1.5 opacity-80 group-hover:opacity-100">
                            <button 
                              onClick={(e) => hClickEditBook(book, e)}
                              className="text-zinc-400 hover:text-white p-1 bg-zinc-900 rounded hover:bg-zinc-800 border border-zinc-800 transition cursor-pointer"
                              title="Editar registros"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              onClick={(e) => hDeleteBook(book.id, e)}
                              className="text-red-400 hover:text-red-350 p-1 bg-zinc-900 rounded hover:bg-red-950/40 border border-zinc-800 transition cursor-pointer"
                              title="Excluir livro"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- FEED DE ATIVIDADES DE AMIGOS E SISTEMA DE CONEXÃO --- */}
        <section className="bg-sophcard border border-zinc-855 rounded-3xl p-6 md:p-8 shadow-xl space-y-6" id="friends-feed-section">
          {/* Header da Aba de Comunidade */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-850 pb-5">
            <div>
              <div className="flex items-center gap-2 bg-sophaccent/10 border border-sophaccent/20 text-sophaccent px-3 py-1 rounded-full text-xs font-semibold w-fit mb-2">
                <Users className="w-3.5 h-3.5" />
                <span>Interação Social & Comunidade</span>
              </div>
              <h2 className="font-serif text-2xl md:text-3xl font-bold tracking-tight text-white mb-1">
                Espaço do Leitor Coletivo
              </h2>
              <p className="text-zinc-350 text-xs">
                Conecte-se com amigos leitores, debata sobre suas resenhas de livros lidos e interaja em tempo real pelo chat privado.
              </p>
            </div>

            {/* Abas Superiores Customizadas e Polidas */}
            <div className="flex bg-zinc-950/65 p-1 rounded-full border border-zinc-850 self-start md:self-center">
              {[
                { id: 'feed', label: 'Feed', count: activities.length },
                { id: 'requests', label: 'Solicitações', count: friendRequests.filter(r => r.toUsername === currentUser.username && r.status === 'pending').length },
                { id: 'friends', label: 'Amigos', count: friends.length },
                { id: 'chat', label: 'Chat' }
              ].map((tab) => {
                const isActive = socialTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setSocialTab(tab.id as any);
                      if (tab.id === 'chat' && friends.length > 0 && !activeChatFriend) {
                        setActiveChatFriend(friends[0]);
                      }
                    }}
                    className={`px-4 py-2 rounded-full text-xs font-medium transition flex items-center gap-1.5 cursor-pointer ${isActive ? 'bg-sophaccent text-black font-semibold' : 'text-zinc-400 hover:text-white'}`}
                  >
                    <span>{tab.label}</span>
                    {tab.count !== undefined && tab.count > 0 && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${isActive ? 'bg-black text-sophaccent' : 'bg-sophaccent text-black font-bold'}`}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* CONTEÚDO DAS ABAS */}
          
          {/* TAB 1: FEED DE ATIVIDADES */}
          {socialTab === 'feed' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Lado Esquerdo: Lista de Atividades */}
              <div className="lg:col-span-2 space-y-5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 font-display">Atividades Recentes na Comunidade</h3>

                {activities.length === 0 ? (
                  <div className="text-center py-12 bg-zinc-950/40 rounded-2xl border border-zinc-810 border-dashed text-zinc-500 text-xs">
                    <span className="block mb-2 text-xl">📭</span>
                    Nenhuma atividade no feed ainda. Conecte amigos para ver o que eles andam lendo!
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activities.map((act) => (
                      <motion.div 
                        key={act.id} 
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-zinc-950/40 p-5 rounded-2xl border border-zinc-850 hover:border-zinc-800 transition space-y-4 relative"
                      >
                        {/* Autor da atividade */}
                        <div className="flex items-center justify-between">
                          <button
                            onClick={() => hOpenFriendProfileFromActivity(act)}
                            className="flex items-center gap-3 text-left focus:outline-none group active:scale-95 transition cursor-pointer"
                            title={`Clique para visitar o perfil de leitura de ${act.friendName}`}
                          >
                            {/* Avatar */}
                            {(() => {
                              let fUser = "";
                              if (act.friendId === "f1" || act.friendName.includes("Ana")) fUser = "ana";
                              else if (act.friendId === "f2" || act.friendName.includes("Lucas")) fUser = "lucas";
                              else if (act.friendId === "f3" || act.friendName.includes("Beatriz")) fUser = "beatriz";
                              
                              let customAvatarUrl = undefined;
                              try {
                                const mapStr = localStorage.getItem("diario_accounts") || "{}";
                                const mapObj = JSON.parse(mapStr);
                                if (fUser && mapObj[fUser]) {
                                  customAvatarUrl = mapObj[fUser].avatarUrl;
                                }
                              } catch(e) {}

                              return (
                                <div className={`w-9 h-9 rounded-full overflow-hidden flex items-center justify-center text-black font-bold font-display text-sm shrink-0 border border-zinc-800 ${customAvatarUrl ? 'bg-zinc-950 shadow-inner' : act.avatarColor || 'bg-zinc-800'}`}>
                                  {customAvatarUrl ? (
                                    <img src={customAvatarUrl} alt={act.friendName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                  ) : (
                                    act.friendName ? act.friendName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() : "U"
                                  )}
                                </div>
                              );
                            })()}
                            
                            <div>
                              <div className="text-xs font-semibold text-white group-hover:text-sophaccent transition flex items-center gap-1.5 flex-wrap">
                                <span className="font-bold underline text-white">@{act.friendName.toLowerCase().replace(/\s+/g, "")} ({act.friendName})</span>
                                <span className="text-zinc-500 font-normal">
                                  {act.type === "reading" ? "está lendo" : act.type === "read" ? "concluiu" : "resenhou"}
                                </span>
                              </div>
                              <span className="text-[10px] text-zinc-500 font-mono flex items-center gap-1 mt-0.5">
                                <Clock className="w-3 h-3 text-zinc-650" />
                                {new Date(act.timestamp).toLocaleDateString("pt-BR")} às {new Date(act.timestamp).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                              </span>
                            </div>
                          </button>
                        </div>

                        {/* Corpo do Livro */}
                        <div className="bg-zinc-900/60 p-4 rounded-xl border border-zinc-850/60 flex items-start justify-between gap-4">
                          <div className="space-y-1">
                            <h4 className="font-serif text-sm font-semibold text-sophaccent tracking-wide">{act.bookTitle}</h4>
                            <p className="text-xs text-zinc-400 italic">por {act.bookAuthor}</p>
                            
                            {/* Estrelas */}
                            {act.rating && act.rating > 0 && (
                              <div className="flex items-center gap-0.5 pt-1">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star key={i} className={`w-3.5 h-3.5 ${i < (act.rating || 0) ? "text-sophaccent fill-sophaccent" : "text-zinc-800"}`} />
                                ))}
                              </div>
                            )}

                            {/* Resenha escrita */}
                            {act.review && (
                              <p className="text-xs text-zinc-300 italic pt-2 leading-relaxed bg-zinc-950/30 p-2.5 rounded-lg border border-zinc-900/40">
                                "{act.review}"
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Botão Curtir & Likes */}
                        <div className="flex items-center justify-between border-t border-zinc-90 w-full pt-3 text-zinc-500">
                          <button 
                            onClick={() => hToggleLikeActivity(act.id)}
                            className={`flex items-center gap-1.5 text-xs font-medium transition cursor-pointer ${act.likedByMe ? "text-rose-500" : "hover:text-rose-400"}`}
                          >
                            <Heart className={`w-4 h-4 ${act.likedByMe ? "fill-rose-500 text-rose-500" : ""}`} />
                            <span>{act.likes} {act.likes === 1 ? "Curtida" : "Curtidas"}</span>
                          </button>
                          
                          <span className="text-[10px] font-mono text-zinc-500 font-display font-display">
                            {act.comments.length} {act.comments.length === 1 ? "Comentário" : "Comentários"}
                          </span>
                        </div>

                        {/* Lista de Comentários Acoplados */}
                        {act.comments.length > 0 && (
                          <div className="space-y-2 bg-zinc-950 p-3.5 rounded-xl border border-zinc-900">
                            {act.comments.map((comm) => (
                              <div key={comm.id} className="text-xs leading-relaxed border-b border-zinc-900/60 pb-2 last:border-b-0 last:pb-0 font-sans">
                                <div className="flex justify-between items-center mb-0.5">
                                  <strong className="text-sophaccent font-medium">@{comm.authorName}</strong>
                                  <span className="text-[9px] text-zinc-600 font-mono">
                                    {new Date(comm.timestamp).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                                  </span>
                                </div>
                                <p className="text-zinc-350 pl-1">{comm.text}</p>
                                {comm.photoUrl && (
                                  <img 
                                    src={comm.photoUrl} 
                                    alt="Foto do comentário" 
                                    className="max-h-48 rounded-lg object-contain border border-zinc-850 my-1 ml-1 block"
                                    referrerPolicy="no-referrer"
                                  />
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Escrever novo Comentário */}
                        <div className="space-y-2 font-sans">
                          {commentDraftPhotos[act.id] && (
                            <div className="relative w-fit border border-zinc-850 p-1 rounded-lg bg-zinc-900/60 flex items-center gap-2">
                              <img src={commentDraftPhotos[act.id]} alt="Comentário anexo preview" className="h-10 w-10 object-cover rounded" />
                              <button 
                                type="button"
                                onClick={() => {
                                  setCommentDraftPhotos(prev => ({ ...prev, [act.id]: "" }));
                                }}
                                className="text-zinc-500 hover:text-red-400 text-[10px] font-semibold"
                              >
                                Remover
                              </button>
                            </div>
                          )}

                          <form 
                            onSubmit={(e) => hAddCommentToActivity(act.id, e)}
                            className="flex gap-2 items-center"
                          >
                            <input 
                              type="text" 
                              placeholder="Deixe um comentário nesta atividade..."
                              value={commentDrafts[act.id] || ""}
                              onChange={(e) => setCommentDrafts({
                                ...commentDrafts,
                                [act.id]: e.target.value
                              })}
                              className="bg-zinc-900 border border-zinc-850 px-3 py-2 text-xs rounded-xl outline-none text-white focus:border-sophaccent flex-1 transition"
                            />
                            
                            {/* Input da Imagem */}
                            <label className="bg-zinc-900 hover:bg-zinc-850 text-zinc-400 hover:text-white border border-zinc-800 p-2 rounded-xl transition cursor-pointer shrink-0" title="Anexar foto ao comentário">
                              <Camera className="w-4 h-4 text-sophaccent" />
                              <input 
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const reader = new FileReader();
                                    reader.onload = (evt) => {
                                      if (evt.target?.result) {
                                        setCommentDraftPhotos(prev => ({
                                          ...prev,
                                          [act.id]: evt.target.result as string
                                        }));
                                      }
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }}
                              />
                            </label>

                            <button 
                              type="submit"
                              className="bg-zinc-900 hover:bg-sophaccent hover:text-black border border-zinc-800 text-zinc-400 text-xs px-3.5 py-2 rounded-xl transition cursor-pointer font-bold animate-fadeIn"
                            >
                              Enviar
                            </button>
                          </form>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Lado Direito: Instruções Sociais Rápidas */}
              <div className="space-y-6">
                <div className="bg-zinc-950/50 p-6 rounded-2xl border border-zinc-850 space-y-4">
                  <h4 className="font-serif text-sm font-semibold text-white">Como Interagir?</h4>
                  <ul className="text-xs text-zinc-400 space-y-2.5 list-disc pl-4 leading-relaxed">
                    <li>Copie o seu <strong className="text-sophaccent">ID de Usuário (@{currentUser.username})</strong> e dê a seus amigos.</li>
                    <li>Utilize a aba de <strong>Solicitações</strong> para adicionar outras contas.</li>
                    <li>Como teste, você pode mudar de conta na tela de login para simular outros leitores e responder aos seus próprios comentários!</li>
                  </ul>
                  <div className="pt-2">
                    <span className="text-[10px] text-zinc-500 font-mono font-display">Seu ID para amizades:</span>
                    <div className="bg-zinc-900 p-2 text-center rounded-lg border border-zinc-850 font-mono text-sophaccent text-xs font-bold mt-1">
                      @{currentUser.username}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SOLICITAÇÕES DE AMIZADE */}
          {socialTab === 'requests' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Solicitações Recebidas Pendentes */}
              <div className="bg-zinc-950/40 p-6 rounded-3xl border border-zinc-850 space-y-5">
                <div className="border-b border-zinc-900 pb-3">
                  <h3 className="text-sm font-semibold text-white">Solicitações Recebidas</h3>
                  <p className="text-zinc-500 text-xs">Outros leitores que desejam se conectar com você</p>
                </div>

                {friendRequests.filter(r => r.toUsername === currentUser.username && r.status === 'pending').length === 0 ? (
                  <div className="text-center py-10 text-zinc-550 text-xs italic">
                    Nenhuma solicitação de amizade pendente no momento.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {friendRequests.filter(r => r.toUsername === currentUser.username && r.status === 'pending').map((req) => (
                      <div key={req.id} className="bg-zinc-900 p-4 rounded-xl border border-zinc-850 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-full ${req.fromAvatarColor || 'bg-sophaccent'} flex items-center justify-center text-black font-bold text-xs`}>
                            {req.fromName.slice(0,2).toUpperCase()}
                          </div>
                          <div>
                            <strong className="text-xs text-white block font-semibold">{req.fromName}</strong>
                            <span className="text-[10px] text-zinc-500 font-mono block">@{req.fromUsername}</span>
                          </div>
                        </div>

                        <div className="flex gap-1.5">
                          <button
                            onClick={() => hAcceptFriendRequest(req)}
                            className="bg-sophaccent hover:bg-sophaccent-hover text-black py-1.5 px-3 rounded-lg text-xs font-bold transition cursor-pointer"
                          >
                            Aceitar
                          </button>
                          <button
                            onClick={() => hDeclineFriendRequest(req)}
                            className="bg-zinc-800 hover:bg-zinc-700 text-zinc-305 py-1.5 px-3 rounded-lg text-xs font-semibold transition cursor-pointer"
                          >
                            Recusar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Form de busca e conexões */}
              <div className="bg-zinc-950/40 p-6 rounded-3xl border border-zinc-850 space-y-5">
                <div className="border-b border-zinc-900 pb-3">
                  <h3 className="text-sm font-semibold text-white">Adicionar Novo Amigo por ID</h3>
                  <p className="text-zinc-500 text-xs">Digite o nome de usuário exclusivo (@username) do seu amigo</p>
                </div>

                <form onSubmit={hSendFriendRequest} className="space-y-4">
                  {requestError && (
                    <div className="p-3 bg-red-950/20 border border-red-900/50 rounded-xl text-rose-400 text-xs text-center">
                      {requestError}
                    </div>
                  )}
                  {requestSuccess && (
                    <div className="p-3 bg-emerald-950/20 border border-emerald-900/50 rounded-xl text-emerald-400 text-xs text-center">
                      {requestSuccess}
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-zinc-505 tracking-wider">Username do Amigo</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-650 text-xs font-mono">@</span>
                      <input 
                        type="text" 
                        placeholder="Ex: lucas ou ana"
                        value={newFriendName}
                        onChange={(e) => setNewFriendName(e.target.value)}
                        required
                        className="w-full bg-zinc-900 border border-zinc-850 text-xs py-3.5 pl-7 pr-4 rounded-xl outline-none text-white focus:border-sophaccent font-mono"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-sophaccent hover:bg-sophaccent-hover text-black py-3 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>ENVIAR SOLICITAÇÃO</span>
                  </button>
                </form>

                <div className="p-4 bg-zinc-900/40 border border-zinc-850 rounded-xl text-zinc-500 text-[11px] leading-relaxed">
                  💡 <strong>Usuários de Teste Disponíveis:</strong> Experimente digitar <strong className="text-sophaccent font-bold">ana</strong>, <strong className="text-sophaccent font-bold">lucas</strong> ou <strong className="text-sophaccent font-bold">beatriz</strong> para simular envios sociais automáticos com aceitação instantânea!
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SEUS AMIGOS */}
          {socialTab === 'friends' && (
            <div className="bg-zinc-950/40 p-6 rounded-3xl border border-zinc-850">
              <h3 className="text-sm font-semibold text-white mb-4 border-b border-zinc-90 w-full pb-2">Suas Conexões Ativas</h3>

              {friends.length === 0 ? (
                <div className="text-center py-12 text-zinc-500 text-xs min-h-[140px] flex flex-col items-center justify-center leading-relaxed">
                  <span className="block text-2xl mb-2">👥</span>
                  Você ainda não possui amigos adicionados.<br />
                  Utilize o painel de <strong>Solicitações</strong> e tente adicionar <strong className="text-sophaccent">lucas</strong> ou <strong className="text-sophaccent">ana</strong>!
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {friends.map((fr) => {
                    let frAccount = null;
                    try {
                      const mapStr = localStorage.getItem("diario_accounts") || "{}";
                      frAccount = JSON.parse(mapStr)[fr.username] || null;
                    } catch (e) {}

                    const hasCustomAvatar = frAccount?.avatarUrl;
                    const displayBio = frAccount?.bio || "Olá, estou usando o Diário Literário!";

                    return (
                      <div key={fr.id} className="bg-zinc-900 p-5 rounded-2xl border border-zinc-850 flex flex-col justify-between gap-4 h-full hover:border-zinc-800 transition">
                        <div className="flex gap-3 items-start">
                          {/* Avatar */}
                          <div className={`w-11 h-11 rounded-full overflow-hidden flex items-center justify-center text-black font-bold font-display text-sm shrink-0 border border-zinc-800 ${hasCustomAvatar ? 'bg-zinc-950' : fr.avatarColor || 'bg-zinc-805'}`}>
                            {hasCustomAvatar ? (
                              <img src={hasCustomAvatar} alt={fr.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            ) : (
                              fr.name ? fr.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() : "U"
                            )}
                          </div>
                          <div className="space-y-0.5 min-w-0">
                            <strong className="text-xs font-semibold text-white block truncate">{fr.name}</strong>
                            <span className="text-[10px] text-zinc-500 block font-mono">@{fr.username}</span>
                            <span className="text-[10px] text-zinc-400 block pt-1 truncate">Gênero: <strong className="text-sophaccent">{fr.favoriteGenre || "Múltiplos"}</strong></span>
                          </div>
                        </div>

                        {/* Recado do Amigo */}
                        {displayBio && (
                          <div className="text-[11px] text-zinc-400 italic bg-zinc-950/45 p-2.5 rounded-xl border border-zinc-900/40 line-clamp-2">
                            "{displayBio}"
                          </div>
                        )}

                        {/* Ações */}
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => hOpenFriendProfile(fr.username)}
                            className="bg-zinc-800 hover:bg-zinc-750 text-white text-[10px] uppercase tracking-wider py-2 px-2 rounded-xl font-bold transition cursor-pointer text-center"
                          >
                            Ver Perfil
                          </button>
                          <button
                            onClick={() => {
                              setActiveChatFriend(fr);
                              setSocialTab('chat');
                            }}
                            className="bg-sophaccent/10 border border-sophaccent/25 text-sophaccent text-[10px] uppercase tracking-wider py-2 px-2 rounded-xl hover:bg-sophaccent hover:text-black font-bold transition cursor-pointer text-center"
                          >
                            Conversar
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: CHAT ROOM */}
          {socialTab === 'chat' && (
            <div className="bg-zinc-950/40 rounded-3xl border border-zinc-850 overflow-hidden flex flex-col lg:flex-row h-[420px]" id="chat-tab">
              {/* Sidebar de Amigos no Chat */}
              <div className="w-full lg:w-1/3 bg-zinc-950 border-b lg:border-b-0 lg:border-r border-zinc-900 overflow-y-auto p-4 space-y-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 font-display block">Escolha uma conversa</span>
                
                {friends.length === 0 ? (
                  <p className="text-zinc-500 text-xs italic py-6 text-center">Adicione amigos para conversar por chat.</p>
                ) : (
                  <div className="space-y-2">
                    {friends.map((fr) => {
                      const isSelected = activeChatFriend?.username === fr.username;
                      const hasRep = chatMessages.filter(
                        m => (m.senderUsername === fr.username && m.receiverUsername === currentUser.username) ||
                             (m.senderUsername === currentUser.username && m.receiverUsername === fr.username)
                      );
                      const lastMsg = hasRep.length > 0 ? hasRep[hasRep.length - 1].text : "Comece a conversar agora!";

                      return (
                        <button
                          key={fr.id}
                          onClick={() => setActiveChatFriend(fr)}
                          className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition cursor-pointer ${isSelected ? 'bg-sophaccent/10 border border-sophaccent/35' : 'hover:bg-zinc-900'}`}
                        >
                          <div className={`w-8 h-8 rounded-full ${fr.avatarColor || 'bg-zinc-800'} flex items-center justify-center text-black font-bold text-xs shrink-0`}>
                            {fr.name ? fr.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() : "U"}
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className="text-xs font-bold text-white block truncate">{fr.name}</span>
                            <span className="text-[10px] text-zinc-400 block truncate leading-tight font-serif italic">{lastMsg}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Corpo da Conversa do Chat */}
              <div className="flex-1 flex flex-col h-full bg-zinc-900/40 relative">
                {activeChatFriend ? (
                  <>
                    {/* Header do Chat */}
                    <div className="p-4 bg-zinc-950 border-b border-zinc-900 flex items-center gap-2.5 shrink-0 justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-7 h-7 rounded-full ${activeChatFriend.avatarColor || 'bg-sophaccent'} flex items-center justify-center text-black font-bold text-xs`}>
                          {activeChatFriend.name ? activeChatFriend.name.slice(0,2).toUpperCase() : "U"}
                        </div>
                        <div>
                          <strong className="text-xs text-white block font-semibold leading-normal">{activeChatFriend.name}</strong>
                          <span className="text-[9px] text-zinc-500 font-mono tracking-tight block">Leitor Ativo • @{activeChatFriend.username}</span>
                        </div>
                      </div>
                    </div>

                    {/* Mensagens do Feed de Bate-Papo */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3.5 flex flex-col">
                      {chatMessages.filter(
                        msg => (msg.senderUsername === currentUser.username && msg.receiverUsername === activeChatFriend.username) ||
                               (msg.senderUsername === activeChatFriend.username && msg.receiverUsername === currentUser.username)
                      ).length === 0 ? (
                        <div className="text-center py-10 text-zinc-550 text-xs italic flex-1 flex flex-col items-center justify-center">
                          💬 Diga olá para seu amigo! Escreva uma mensagem abaixo para iniciar o bate-papo.
                        </div>
                      ) : (
                        chatMessages.filter(
                          msg => (msg.senderUsername === currentUser.username && msg.receiverUsername === activeChatFriend.username) ||
                                 (msg.senderUsername === activeChatFriend.username && msg.receiverUsername === currentUser.username)
                        ).map((msg) => {
                          const isMe = msg.senderUsername === currentUser.username;
                          return (
                            <div 
                              key={msg.id}
                              className={`max-w-[80%] rounded-2xl p-3 text-xs leading-normal ${isMe ? 'self-end bg-sophaccent text-black font-medium rounded-tr-none' : 'self-start bg-zinc-950 text-zinc-200 rounded-tl-none border border-zinc-850'}`}
                            >
                              <p className="whitespace-pre-line">{msg.text}</p>
                              <span className={`text-[8px] font-mono block text-right mt-1.5 ${isMe ? 'text-black/60' : 'text-zinc-650'}`}>
                                {new Date(msg.timestamp).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                              </span>
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* Caixa de Entrada de Texto do Chat */}
                    <form onSubmit={hSendChatMessage} className="p-3 bg-zinc-950 border-t border-zinc-900 flex gap-2 shrink-0">
                      <input 
                        type="text" 
                        placeholder={`Escreva uma mensagem interativa para ${activeChatFriend.name.split(" ")[0]}...`}
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        required
                        className="bg-zinc-900 border border-zinc-850 rounded-xl px-4 py-2.5 text-xs outline-none text-white focus:border-sophaccent flex-1 transition font-sans"
                      />
                      <button 
                        type="submit"
                        className="bg-sophaccent hover:bg-sophaccent-hover text-black p-2.5 rounded-xl transition cursor-pointer flex items-center justify-center font-bold"
                      >
                        <Send className="w-4 h-4 text-black" />
                      </button>
                    </form>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-zinc-550 text-xs">
                    <span className="text-3xl mb-1.5">💬</span>
                    Selecione um amigo na coluna ao lado para iniciar a conversa!
                  </div>
                )}
              </div>
            </div>
          )}
        </section>

      </main>

      {/* --- INCLUIR NOTAS DE CRÉDITO E LOG DA SEÇÃO DE MARGINS DE LEITURA --- */}
      <footer className="no-print border-t border-zinc-900 bg-sophcard py-10 px-4 text-center text-xs text-zinc-500 font-display">
        <p>© {new Date().getFullYear()} Diário Literário — Organizando suas jornadas literárias.</p>
        <p className="mt-1.5 text-[11px] text-zinc-650">Desenvolvido em harmonia com a Inteligência Artificial do Google Gemini</p>
      </footer>

      {/* =========================================================================
          ================== DIÁLOGOS / MODAIS (AnimatePresence) ====================
          ========================================================================= */}

      {/* Modal 1: Adicionar ou Editar Livro */}
      <AnimatePresence>
        {isBookModalOpen && (
          <div className="no-print fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsBookModalOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md"
            />
            
            {/* Modal Content */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-sophcard rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl border border-zinc-800 relative z-10 flex flex-col max-h-[90vh]"
            >
              <div className="bg-zinc-950 text-white px-6 py-4 flex items-center justify-between border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-sophaccent" />
                  <h2 className="font-serif font-bold text-lg text-white">
                    {editingBook ? `Editar: ${editingBook.title}` : "Registrar Novo Livro"}
                  </h2>
                </div>
                <button 
                  onClick={() => setIsBookModalOpen(false)}
                  className="text-zinc-500 hover:text-white p-1 rounded-full transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={hSubmitBookForm} className="p-6 overflow-y-auto space-y-4 flex-1 text-zinc-300">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Título do Livro */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Título do Livro *</label>
                    <input 
                      type="text"
                      required
                      placeholder="Ex: Dom Casmurro, Grande Sertão..."
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800/80 focus:border-sophaccent py-2 px-3 rounded-xl text-sm outline-none font-medium text-white placeholder-zinc-650"
                    />
                  </div>

                  {/* Autor do Livro */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Autor *</label>
                    <input 
                      type="text"
                      required
                      placeholder="Ex: Machado de Assis"
                      value={formAuthor}
                      onChange={(e) => setFormAuthor(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800/80 focus:border-sophaccent py-2 px-3 rounded-xl text-sm outline-none font-medium text-white placeholder-zinc-650"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Gênero */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Gênero</label>
                    <input 
                      type="text"
                      placeholder="Ex: Ficção, Fantasia, Romance"
                      value={formGenre}
                      onChange={(e) => setFormGenre(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800/80 focus:border-sophaccent py-2 px-3 rounded-xl text-sm outline-none text-white placeholder-zinc-650"
                    />
                  </div>

                  {/* Status de Leitura */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Status de Leitura</label>
                    <select 
                      value={formStatus}
                      onChange={(e: any) => setFormStatus(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800/80 focus:border-sophaccent py-2 px-2.5 rounded-xl text-sm outline-none cursor-pointer text-white"
                    >
                      <option value="reading">📖 Lendo Atualmente</option>
                      <option value="read">✅ Concluído (Lido)</option>
                      <option value="want_to_read">📌 Quero Ler</option>
                    </select>
                  </div>

                  {/* Páginas do Livro */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Páginas Totais</label>
                    <input 
                      type="number"
                      min={1}
                      value={formTotalPages || ""}
                      onChange={(e) => setFormTotalPages(Number(e.target.value))}
                      className="w-full bg-zinc-900 border border-zinc-800/80 focus:border-sophaccent py-2 px-3 rounded-xl text-sm outline-none text-white placeholder-zinc-650"
                    />
                  </div>
                </div>

                {/* Bloco condicional dependendo do status de leitura */}
                {formStatus === "reading" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-zinc-950/60 border border-amber-900/15 rounded-2xl">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-sophaccent uppercase tracking-widest">Páginas Lidas até Agora</label>
                      <input 
                        type="number"
                        min={0}
                        max={formTotalPages}
                        value={formPagesRead}
                        onChange={(e) => setFormPagesRead(Math.min(formTotalPages, Number(e.target.value)))}
                        className="w-full bg-zinc-900 border border-zinc-800 focus:border-sophaccent py-2 px-3 rounded-xl text-sm outline-none font-bold text-sophaccent-hover"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Data de Início da Leitura</label>
                      <input 
                        type="date"
                        value={formStartDate}
                        onChange={(e) => setFormStartDate(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 focus:border-sophaccent py-2 px-3 rounded-xl text-sm outline-none text-white"
                      />
                    </div>
                  </div>
                )}

                {formStatus === "read" && (
                  <div className="space-y-4 p-4 bg-zinc-950/60 border border-zinc-800 rounded-2xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      {/* Avaliação em estrelas */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest block mb-1">Sua Avaliação</label>
                        <div className="flex gap-1 items-center">
                          {Array.from({ length: 5 }).map((_, idx) => (
                            <button 
                              key={idx}
                              type="button"
                              onClick={() => setFormRating(idx + 1)}
                              className="text-zinc-700 hover:scale-115 active:scale-95 transition cursor-pointer"
                            >
                              <Star className={`w-6 h-6 ${idx < formRating ? "text-sophaccent fill-sophaccent" : "text-zinc-800"}`} />
                            </button>
                          ))}
                          <span className="text-xs font-semibold text-zinc-400 ml-2">({formRating} de 5)</span>
                        </div>
                      </div>

                      {/* Data de Conclusão */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Data de Conclusão</label>
                        <input 
                          type="date"
                          value={formEndDate}
                          onChange={(e) => setFormEndDate(e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-800 focus:border-sophaccent py-2 px-3 rounded-xl text-sm outline-none text-white"
                        />
                      </div>

                    </div>

                    {/* Resenha Crítica */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Resenha Literária (Opinião sobre a obra)</label>
                      <textarea 
                        rows={3}
                        placeholder="Quais foram suas impressões mais marcantes gerais sobre o teor do livro, escrita e narrativa?"
                        value={formReview}
                        onChange={(e) => setFormReview(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 focus:border-sophaccent py-2.5 px-3.5 rounded-xl text-sm outline-none text-white placeholder-zinc-650 font-serif"
                      />
                    </div>
                  </div>
                )}

                {/* CADASTRO DE NOTAS ADICIONAIS / CITAÇÕES */}
                <div className="space-y-2 p-4 bg-zinc-950/40 border border-zinc-800 rounded-2xl animate-fadeIn font-sans">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest block font-display">Anotações Adicionais (Notas / Citações Favoritas)</label>
                  
                  {formNotes.length > 0 && (
                    <div className="space-y-1.5 mb-2 max-h-36 overflow-y-auto">
                      {formNotes.map((note, index) => {
                        const isObject = typeof note === "object" && note !== null;
                        const text = isObject ? (note as any).text : (note as string);
                        const photoUrl = isObject ? (note as any).photoUrl : undefined;
                        return (
                          <div key={index} className="flex flex-col gap-1.5 bg-zinc-900/60 p-2.5 rounded-lg border border-zinc-800 text-xs text-zinc-300">
                            <div className="flex justify-between items-start w-full">
                              <span className="flex-1 pr-4 italic font-serif">"{text || "Nota de Imagem"}"</span>
                              <button 
                                type="button" 
                                onClick={() => hRemoveNote(index)}
                                className="text-zinc-500 hover:text-red-400 shrink-0 cursor-pointer"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            {photoUrl && (
                              <img src={photoUrl} alt="Anexo" className="max-h-12 rounded object-cover border border-zinc-800/85 w-auto self-start" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {formNotePhoto && (
                    <div className="relative w-fit border border-zinc-850 p-1.5 rounded-xl bg-zinc-900/40 flex items-center gap-2 mb-2">
                      <img src={formNotePhoto} alt="Preview anexo" className="h-10 w-10 object-cover rounded-lg border border-zinc-850" />
                      <button 
                        type="button"
                        onClick={() => setFormNotePhoto(null)}
                        className="text-zinc-500 hover:text-red-400 text-xs font-semibold"
                      >
                        Remover Foto
                      </button>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-2">
                    <input 
                      type="text"
                      placeholder="Anote uma citação tocante, pensamento ou número de capítulo..."
                      value={formNoteInput}
                      onChange={(e) => setFormNoteInput(e.target.value)}
                      className="flex-1 bg-zinc-900 border border-zinc-800 focus:border-sophaccent py-2 px-3 rounded-xl text-xs outline-none text-white placeholder-zinc-650"
                    />
                    <div className="flex gap-2 shrink-0">
                      <label className="flex items-center justify-center bg-zinc-900 hover:bg-zinc-850 text-zinc-300 hover:text-white border border-zinc-800 px-3 py-2 rounded-xl text-xs font-medium cursor-pointer transition gap-1.5">
                        <Camera className="w-4 h-4 text-sophaccent" />
                        <span>{formNotePhoto ? "Foto Anexada" : "Anexar Foto"}</span>
                        <input 
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (evt) => {
                                if (evt.target?.result) {
                                  setFormNotePhoto(evt.target.result as string);
                                }
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                      <button 
                        type="button"
                        onClick={hAddNote}
                        className="bg-zinc-850 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer"
                      >
                        Inserir Nota
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-zinc-800/80 flex items-center justify-between">
                  <p className="text-[11px] text-zinc-500 flex items-center gap-1">
                    <Info className="w-3.5 h-3.5 text-zinc-500" /> Buscaremos na internet capas reais equivalentes para esta obra.
                  </p>
                  
                  <div className="flex gap-3">
                    <button 
                      type="button"
                      onClick={() => setIsBookModalOpen(false)}
                      className="py-2.5 px-4 rounded-xl text-xs font-semibold border border-zinc-800 text-zinc-400 hover:bg-zinc-900 hover:text-white transition cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button 
                      type="submit"
                      disabled={isCoverSearching}
                      className="bg-sophaccent hover:bg-sophaccent-hover disabled:opacity-75 text-black font-bold py-2.5 px-6 rounded-full text-xs transition cursor-pointer"
                    >
                      {isCoverSearching ? "Buscando Capas..." : editingBook ? "Salvar Livro" : "Cadastrar Obra"}
                    </button>
                  </div>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal 2: Visualizar Detalhes Expandidos do Livro */}
      <AnimatePresence>
        {selectedBook && (
          <div className="no-print fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedBook(null)}
              className="fixed inset-0 bg-black/85 backdrop-blur-md"
            />

            {/* Modal de Detalhes */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-sophcard rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl border border-zinc-800 relative z-10 flex flex-col md:flex-row max-h-[85vh] text-zinc-350"
            >
              <button 
                onClick={() => setSelectedBook(null)}
                className="absolute right-4 top-4 z-20 text-zinc-400 hover:text-white p-1.5 rounded-full bg-zinc-950/80 backdrop-blur cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Lado Esquerdo: Capa */}
              <div className="w-full md:w-2/5 aspect-[3/4] md:aspect-auto bg-zinc-950 relative flex-shrink-0">
                {selectedBook.coverUrl ? (
                  <img src={selectedBook.coverUrl} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <div className={`w-full h-full ${getGenreColor(selectedBook.genre).bg} p-6 flex flex-col justify-between`}>
                    <div>
                      <p className="text-xs uppercase tracking-widest text-amber-400 font-mono font-medium">{selectedBook.genre}</p>
                    </div>
                    <div className="my-auto">
                      <h4 className="font-serif font-bold text-xl text-white leading-tight">{selectedBook.title}</h4>
                      <p className="text-sm text-zinc-300 italic mt-2">por {selectedBook.author}</p>
                    </div>
                    <div className="text-[10px] text-zinc-400 font-mono">Premium Editorial</div>
                  </div>
                )}
                
                {/* Pill de Status */}
                <div className="absolute top-4 left-4">
                  <span className={`text-[10px] font-bold px-3 py-1 rounded-full text-white ${
                    selectedBook.status === "read" ? "bg-emerald-600" :
                    selectedBook.status === "reading" ? "bg-sophaccent text-black" :
                    "bg-zinc-800 text-zinc-300 border border-zinc-700"
                  }`}>
                    {selectedBook.status === "read" ? "Lido" : selectedBook.status === "reading" ? "Lendo" : "Quero Ler"}
                  </span>
                </div>
              </div>

              {/* Lado Direito: Conteúdos, Resenhas e Notas */}
              <div className="p-6 overflow-y-auto flex-1 flex flex-col justify-between max-h-[85vh] md:max-h-full">
                <div className="space-y-5">
                  
                  {/* Título e Autor */}
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-sophaccent font-display">Gênero: {selectedBook.genre}</span>
                    <h2 className="font-serif text-2xl font-extrabold text-white mt-1 leading-tight">{selectedBook.title}</h2>
                    <p className="text-sm text-zinc-400 italic mt-0.5">Escrito por {selectedBook.author}</p>
                  </div>

                  {/* Informações de Percurso */}
                  <div className="grid grid-cols-2 gap-3 bg-zinc-950/60 p-3.5 rounded-2xl border border-zinc-850/80 text-xs">
                    <div>
                      <span className="text-zinc-500 block mb-0.5 uppercase tracking-wide text-[9px] font-bold">Início da Leitura</span>
                      <strong className="text-zinc-300">{selectedBook.startDate ? new Date(selectedBook.startDate + "T00:00:00").toLocaleDateString("pt-BR") : "Não marcado"}</strong>
                    </div>
                    <div>
                      <span className="text-zinc-500 block mb-0.5 uppercase tracking-wide text-[9px] font-bold">Conclusão</span>
                      <strong className="text-zinc-300">
                        {selectedBook.status === "read" && selectedBook.endDate 
                          ? new Date(selectedBook.endDate + "T00:00:00").toLocaleDateString("pt-BR") 
                          : selectedBook.status === "reading" ? "Em progresso" : "A iniciar"}
                      </strong>
                    </div>
                    <div className="col-span-2 pt-2 border-t border-zinc-850/80 flex justify-between items-center text-zinc-400">
                      <span>Marcador de páginas:</span>
                      <strong className="text-sophaccent bg-zinc-900/60 border border-zinc-800 px-2.5 py-0.5 rounded font-display font-medium text-xs">
                        {selectedBook.pagesRead} / {selectedBook.totalPages} páginas ({Math.round((selectedBook.pagesRead / (selectedBook.totalPages || 1)) * 100)}%)
                      </strong>
                    </div>
                  </div>

                  {/* Avaliação por estrelas */}
                  {selectedBook.status === "read" && selectedBook.rating > 0 && (
                    <div className="p-3 bg-zinc-950/40 rounded-2xl border border-zinc-800/80">
                      <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest block mb-1">Avaliação do Leitor</span>
                      <div className="flex gap-1 items-center">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`w-5 h-5 ${i < selectedBook.rating ? "text-sophaccent fill-sophaccent" : "text-zinc-800"}`} />
                        ))}
                        <span className="text-xs font-bold text-zinc-300 ml-2">({selectedBook.rating}/5 estrelas)</span>
                      </div>
                    </div>
                  )}

                  {/* Resenha Crítica */}
                  {selectedBook.status === "read" && (
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest block mb-1">Minha Resenha Crítica</span>
                      {selectedBook.review ? (
                        <p className="text-sm text-zinc-300 leading-relaxed font-serif italic bg-zinc-950/40 p-4 rounded-2xl border border-zinc-850/80">
                          "{selectedBook.review}"
                        </p>
                      ) : (
                        <p className="text-xs text-zinc-500 italic">Nenhuma resenha literária foi cadastrada para este livro ainda.</p>
                      )}
                    </div>
                  )}

                  {/* Notas e Citações */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest block font-display">Notas, Pensamentos & Citações</span>
                    {selectedBook.notes && selectedBook.notes.length > 0 ? (
                      <div className="space-y-2">
                        {selectedBook.notes.map((note, idx) => {
                          const isObject = typeof note === "object" && note !== null;
                          const text = isObject ? (note as any).text : (note as string);
                          const photoUrl = isObject ? (note as any).photoUrl : undefined;
                          const timestamp = isObject ? (note as any).timestamp : undefined;
                          return (
                            <div key={idx} className="bg-zinc-950/40 p-3 rounded-xl border border-zinc-850/50 text-xs text-zinc-300 flex flex-col gap-2 italic font-serif">
                              <div className="flex items-start gap-2">
                                <span className="text-sophaccent font-serif font-bold text-base mt-[-2px]">“</span>
                                <div className="flex-1">
                                  <span>{text}</span>
                                  {timestamp && (
                                    <span className="block text-[9px] text-zinc-500 mt-1 not-italic font-sans">
                                      {new Date(timestamp).toLocaleString("pt-BR")}
                                    </span>
                                  )}
                                </div>
                              </div>
                              {photoUrl && (
                                <img 
                                  src={photoUrl} 
                                  alt="Foto anexa" 
                                  className="max-h-56 rounded-lg object-cover border border-zinc-800 self-start" 
                                  referrerPolicy="no-referrer"
                                />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-xs text-zinc-500 italic font-serif">Nenhuma nota interna cadastrada.</p>
                    )}
                  </div>

                </div>

                <div className="pt-6 mt-6 border-t border-zinc-850 flex items-center justify-between">
                  <button 
                    onClick={(e) => hClickEditBook(selectedBook, e)}
                    className="flex items-center gap-1.5 text-xs font-bold text-sophaccent hover:text-sophaccent-hover cursor-pointer"
                    id="edit-book-from-preview-btn"
                  >
                    <Edit2 className="w-4 h-4" />
                    <span>Editar Registro</span>
                  </button>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setSelectedBook(null)}
                      className="bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-350 font-semibold py-2 px-5 rounded-full text-xs transition cursor-pointer"
                    >
                      Fechar
                    </button>
                  </div>
                </div>

              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal 3: Configurar Preferências Literárias e Lembretes Diários */}
      <AnimatePresence>
        {isConfiguringPreferences && (
          <div className="no-print fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsConfiguringPreferences(false)}
              className="fixed inset-0 bg-black/85 backdrop-blur-md"
            />

            {/* Conteúdo */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-sophcard rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-zinc-800 relative z-10 text-zinc-300"
            >
              <div className="bg-zinc-950 text-white px-6 py-4 flex items-center justify-between border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-sophaccent" />
                  <h2 className="font-serif font-bold text-lg text-white">Configurações de Lembrete e IA</h2>
                </div>
                <button onClick={() => setIsConfiguringPreferences(false)} className="text-zinc-500 hover:text-white cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={hSavePreferences} className="p-6 space-y-5">
                
                {/* 1. Lembrete Diário */}
                <div className="space-y-3 bg-zinc-950/60 p-4 rounded-2xl border border-zinc-850">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-sophaccent font-display">Lembrete Diário de Leitura</h3>
                      <p className="text-[10px] text-zinc-500">Notificação in-app nos ajudando a manter hábitos firmes</p>
                    </div>
                    {/* Switch habilitar lembrete */}
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={prefReminderEnabled} 
                        onChange={(e) => setPrefReminderEnabled(e.target.checked)}
                        className="sr-only peer" 
                        id="reminder-enabled-toggle"
                      />
                      <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-zinc-900 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-400 after:border-zinc-900 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sophaccent"></div>
                    </label>
                  </div>

                  {prefReminderEnabled && (
                    <div className="pt-2 flex items-center justify-between gap-4 animate-fadeIn">
                      <span className="text-xs font-medium text-zinc-400">Qual o melhor horário para você?</span>
                      <input 
                        type="time" 
                        required
                        value={prefReminderTime}
                        onChange={(e) => setPrefReminderTime(e.target.value)}
                        className="bg-zinc-900 border border-zinc-800 focus:border-sophaccent text-sm py-1.5 px-3 rounded-lg outline-none font-bold text-sophaccent"
                      />
                    </div>
                  )}
                </div>

                {/* 2. Preferências Literárias para a IA Gemini */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-display">Seu Perfil Literário (Ajustar Recomendador)</h3>
                  
                  {/* Gêneros Preferidos */}
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-zinc-400 block">Seus Gêneros Preferidos (Separados por vírgula)</label>
                    <input 
                      type="text"
                      value={prefGenresInput}
                      onChange={(e) => setPrefGenresInput(e.target.value)}
                      placeholder="Ex: Fantasia, Biografias, Ficção Científica, Clássicos"
                      className="w-full bg-zinc-900 border border-zinc-800 focus:border-sophaccent py-2.5 px-3.5 rounded-xl text-xs outline-none text-white placeholder-zinc-650"
                    />
                  </div>

                  {/* Autores Preferidos */}
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-zinc-400 block">Autores de Preferência (Separados por vírgula)</label>
                    <input 
                      type="text"
                      value={prefAuthorsInput}
                      onChange={(e) => setPrefAuthorsInput(e.target.value)}
                      placeholder="Ex: Isaac Asimov, Stephen King, J.R.R. Tolkien"
                      className="w-full bg-zinc-900 border border-zinc-800 focus:border-sophaccent py-2.5 px-3.5 rounded-xl text-xs outline-none text-white placeholder-zinc-650"
                    />
                  </div>

                  {/* 3. Personalização do Perfil (Novo!) */}
                  <div className="space-y-4 border-t border-zinc-850 pt-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-sophaccent font-display">Aparência do seu Perfil (Comunidade)</h3>
                    
                    {/* Foto de Perfil */}
                    <div className="space-y-1.5 font-sans">
                      <label className="text-xs font-medium text-zinc-400 block">Sua Foto de Perfil (Personalizada)</label>
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-full overflow-hidden border-2 border-zinc-700 flex items-center justify-center bg-zinc-950 font-bold shrink-0 text-xl`}>
                          {prefAvatarUrl ? (
                            <img src={prefAvatarUrl} alt="Foto de Perfil" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            <span className="text-[10px] text-zinc-500 font-mono">Iniciais</span>
                          )}
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="bg-zinc-900 hover:bg-zinc-850 text-zinc-300 hover:text-white border border-zinc-800 px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition flex items-center gap-2">
                            <Camera className="w-4 h-4 text-sophaccent" />
                            <span>Upload de Imagem</span>
                            <input 
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onload = (evt) => {
                                    if (evt.target?.result) {
                                      setPrefAvatarUrl(evt.target.result as string);
                                    }
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />
                          </label>
                          {prefAvatarUrl && (
                            <button 
                              type="button" 
                              onClick={() => setPrefAvatarUrl(null)}
                              className="text-[10px] text-zinc-500 hover:text-red-400 font-medium self-start"
                            >
                              Remover foto (Usar iniciais padrão)
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Recado / Status do Perfil (Bio) */}
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-zinc-400 block">Recado do Perfil (Frase ou Bio de Status)</label>
                      <input 
                        type="text"
                        value={prefBio}
                        onChange={(e) => setPrefBio(e.target.value)}
                        placeholder="Escreva uma frase de status para seus amigos..."
                        maxLength={120}
                        className="w-full bg-zinc-900 border border-zinc-800 focus:border-sophaccent py-2.5 px-3.5 rounded-xl text-xs outline-none text-white placeholder-zinc-650"
                      />
                    </div>
                  </div>

                  {/* Metas de Leitura */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-zinc-400 block pb-0.5">Meta Mensal (Livros)</label>
                      <input 
                        type="number"
                        min={1}
                        max={30}
                        value={prefGoal}
                        onChange={(e) => setPrefGoal(Number(e.target.value))}
                        className="w-full bg-zinc-900 border border-zinc-800 focus:border-sophaccent py-2.5 px-3.5 rounded-xl text-xs outline-none font-bold text-sophaccent-hover"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-zinc-400 block pb-0.5">Meta Anual (Livros)</label>
                      <input 
                        type="number"
                        min={1}
                        max={365}
                        value={prefGoalYear}
                        onChange={(e) => setPrefGoalYear(Number(e.target.value))}
                        className="w-full bg-zinc-900 border border-zinc-800 focus:border-sophaccent py-2.5 px-3.5 rounded-xl text-xs outline-none font-bold text-sophaccent-hover"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-zinc-850 flex justify-end gap-3">
                  <button 
                    type="button"
                    onClick={() => setIsConfiguringPreferences(false)}
                    className="py-2.5 px-4 rounded-xl text-xs font-semibold border border-zinc-800 text-zinc-400 hover:bg-zinc-900 hover:text-white transition cursor-pointer"
                  >
                    Voltar
                  </button>
                   <button 
                    type="submit"
                    className="bg-sophaccent hover:bg-sophaccent-hover active:scale-95 text-black font-bold py-2.5 px-5 rounded-full text-xs transition cursor-pointer"
                  >
                    Salvar Configurações
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal 4: Visualizar Perfil Literário do Amigo (Leitura Sem Edições!) */}
      <AnimatePresence>
        {selectedFriendProfile && (
          <div className="no-print fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedFriendProfile(null)}
              className="fixed inset-0 bg-black/90 backdrop-blur-md"
            />

            {/* Conteúdo do Perfil Literário do Amigo */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-sophcard rounded-3xl w-full max-w-2xl max-h-[85vh] overflow-hidden shadow-2xl border border-zinc-800 relative z-10 text-zinc-300 flex flex-col"
            >
              {/* Header do Amigo */}
              <div className="bg-zinc-950 text-white px-6 py-5 flex items-center justify-between border-b border-zinc-850 shrink-0">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full overflow-hidden flex items-center justify-center text-black font-bold text-xl border-2 border-zinc-700 shrink-0 ${selectedFriendProfile.avatarUrl ? 'bg-zinc-950 shadow-inner' : selectedFriendProfile.avatarColor || 'bg-sophaccent'}`}>
                    {selectedFriendProfile.avatarUrl ? (
                      <img src={selectedFriendProfile.avatarUrl} alt={selectedFriendProfile.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      selectedFriendProfile.name ? selectedFriendProfile.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() : "U"
                    )}
                  </div>
                  <div>
                    <h2 className="font-serif font-bold text-lg text-white leading-tight">{selectedFriendProfile.name}</h2>
                    <span className="text-xs text-zinc-500 font-mono text-left block">@{selectedFriendProfile.username}</span>
                  </div>
                </div>
                <button onClick={() => setSelectedFriendProfile(null)} className="text-zinc-500 hover:text-white cursor-pointer p-1 rounded-full hover:bg-zinc-90 w-7 h-7 flex items-center justify-center transition">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Corpo do Cartão de Perfil */}
              <div className="p-6 overflow-y-auto space-y-6 text-left">

                {/* Recado do Amigo */}
                <div className="bg-zinc-950/50 border border-zinc-850 p-4 rounded-2xl relative overflow-hidden">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-sophaccent font-display block mb-1">Recado do Perfil</span>
                  <p className="text-sm italic text-zinc-200">
                    "{selectedFriendProfile.bio || "Este leitor prefere o silêncio de um bom livro. Sem recados por aqui!"}"
                  </p>
                </div>

                {/* Detalhes Literários e Metas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-zinc-950/30 p-4 rounded-2xl border border-zinc-850 space-y-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 font-display block">Apreço Literário</span>
                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="text-zinc-500 block text-[10px]">Gêneros Favoritos</span>
                        <strong className="text-zinc-300 font-sans">{selectedFriendProfile.preferences?.favoriteGenres?.join(", ") || "Todos"}</strong>
                      </div>
                      <div>
                        <span className="text-zinc-500 block text-[10px]">Autores favoritos</span>
                        <strong className="text-zinc-300 font-sans">{selectedFriendProfile.preferences?.favoriteAuthors?.join(", ") || "Nenhum cadastrado"}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="bg-zinc-950/30 p-4 rounded-2xl border border-zinc-850 space-y-3 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 font-display block mb-1">Metas de Leitura do Ano</span>
                      <p className="text-xs text-zinc-400">
                        Pretende ler <strong className="text-sophaccent text-sm">{selectedFriendProfile.preferences?.readingGoalPerYear || 50}</strong> livros este ano.
                      </p>
                    </div>
                    {/* Indicador Visual Simples */}
                    <div className="pt-2">
                      <div className="flex justify-between text-[10px] text-zinc-500 mb-1">
                        <span>Meta Mensal</span>
                        <span>{selectedFriendProfile.preferences?.readingGoalPerMonth || 1} {selectedFriendProfile.preferences?.readingGoalPerMonth === 1 ? 'livro' : 'livros'}</span>
                      </div>
                      <div className="w-full bg-zinc-900 rounded-full h-1 overflow-hidden">
                        <div className="bg-sophaccent h-full w-1/2" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Acervo de Livros do Amigo */}
                <div className="space-y-4">
                  <div className="border-b border-zinc-850 pb-2 flex items-center justify-between">
                    <h3 className="font-serif text-base font-bold text-white flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-sophaccent" />
                      <span>Biblioteca de {selectedFriendProfile.name.split(" ")[0]}</span>
                    </h3>
                    <span className="text-[10.5px] font-mono text-zinc-500">{(selectedFriendProfile.books || []).length} livros catalogados</span>
                  </div>

                  {(selectedFriendProfile.books || []).length === 0 ? (
                    <div className="text-center py-10 bg-zinc-950/30 border border-dashed border-zinc-850 rounded-2xl text-xs text-zinc-500 italic">
                      Este leitor ainda não adicionou livros para leitura pública do perfil.
                    </div>
                  ) : (
                    <div className="space-y-3.5">
                      {(selectedFriendProfile.books || []).map((b: any) => (
                        <div key={b.id || b.title} className="bg-zinc-950/40 p-4 rounded-2xl border border-zinc-850 flex flex-col gap-3">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-900 pb-2">
                            <div>
                              <h4 className="font-serif text-sm font-semibold text-white tracking-wide text-left">{b.title}</h4>
                              <p className="text-xs text-zinc-550 italic text-left">por {b.author}</p>
                            </div>
                            
                            {/* Badger de Status do Livro */}
                            <span className={`text-[9.5px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider self-start sm:self-auto ${
                              b.status === 'reading' ? 'bg-sophaccent/10 border border-sophaccent/35 text-sophaccent' :
                              b.status === 'read' ? 'bg-emerald-950/10 border border-emerald-900/35 text-emerald-400' :
                              'bg-zinc-900 border border-zinc-800 text-zinc-400'
                            }`}>
                              {b.status === 'reading' ? 'Lendo atualmente' : b.status === 'read' ? 'Lido' : 'Quero ler'}
                            </span>
                          </div>

                          {/* Se for leitura corrente, mostrar progresso do Amigo */}
                          {b.status === 'reading' && (
                            <div className="bg-zinc-950/50 p-2.5 rounded-xl border border-zinc-900 space-y-1.5">
                              <div className="flex justify-between text-[10px] text-zinc-500">
                                <span>Progresso da Leitura:</span>
                                <strong>{b.pagesRead || 0} de {b.totalPages || 0} págs ({percentCalc(b.pagesRead || 0, b.totalPages || 1)}%)</strong>
                              </div>
                              <div className="w-full bg-zinc-900 h-1 rounded-full overflow-hidden">
                                <div className="bg-sophaccent h-full" style={{ width: `${percentCalc(b.pagesRead || 0, b.totalPages || 1)}%` }} />
                              </div>
                            </div>
                          )}

                          {/* Se tiver estrelas/resenhas */}
                          {(b.rating || b.review) && (
                            <div className="space-y-1.5 text-left">
                              {b.rating && b.rating > 0 && (
                                <div className="flex items-center gap-0.5">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <Star key={i} className={`w-3.5 h-3.5 ${i < (b.rating || 0) ? "text-sophaccent fill-sophaccent" : "text-zinc-900"}`} />
                                  ))}
                                </div>
                              )}
                              {b.review && (
                                <p className="text-xs text-zinc-350 italic bg-zinc-950/30 p-2.5 rounded-xl border border-zinc-900 leading-normal">
                                  "{b.review}"
                                </p>
                              )}
                            </div>
                          )}

                          {/* Anotações do Amigo com Possíveis Fotos anexadas (Conforme requisito!) */}
                          {b.notes && b.notes.length > 0 && (
                            <div className="pt-2 border-t border-zinc-900 space-y-2 text-left">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 font-display block">Anotações do Leitor</span>
                              <div className="space-y-2">
                                {b.notes.map((note: any, idx: number) => (
                                  <div key={idx} className="bg-zinc-900/60 p-3 rounded-xl border border-zinc-850 space-y-2">
                                    <div className="flex justify-between items-center text-[10px] text-zinc-500">
                                      <span>Anotação #{idx + 1}</span>
                                      <span>{note.date ? new Date(note.date).toLocaleDateString("pt-BR") : ""}</span>
                                    </div>
                                    <p className="text-xs text-zinc-300 leading-relaxed font-sans whitespace-pre-wrap">{note.text}</p>
                                    
                                    {/* Imagem anexada no comentário/anotação */}
                                    {note.photoUrl && (
                                      <div className="relative rounded-lg overflow-hidden border border-zinc-800 max-w-sm mt-1.5">
                                        <img 
                                          src={note.photoUrl} 
                                          alt={`Foto anexa na Anotação #${idx + 1}`} 
                                          className="w-full h-auto max-h-48 object-cover rounded"
                                          referrerPolicy="no-referrer"
                                        />
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Ações / Fechamento sem Edições */}
              <div className="bg-zinc-950 border-t border-zinc-850 p-4 flex justify-end shrink-0">
                <button 
                  onClick={() => setSelectedFriendProfile(null)}
                  className="bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-white font-bold py-2.5 px-6 rounded-full text-xs transition cursor-pointer"
                >
                  Fechar Biblioteca do Amigo
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

// --- Funções Auxiliares Internas de Cálculo do Layout ---

function percentCalc(completed: number, goal: number): number {
  if (!goal) return 0;
  return Math.round((completed / goal) * 100);
}
