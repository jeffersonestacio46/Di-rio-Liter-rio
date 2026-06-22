export interface BookNote {
  id: string;
  text: string;
  photoUrl?: string;
  timestamp: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  status: 'reading' | 'read' | 'want_to_read'; // 'lendo', 'lido', 'quero_ler'
  rating: number; // 0 a 5 estrelas
  review: string; // resenha
  notes: (string | BookNote)[]; // notas/anotações adicionais (pode ser texto simples ou objeto nota com foto)
  coverUrl: string | null;
  genre: string;
  startDate: string; // YYYY-MM-DD
  endDate: string | null; // YYYY-MM-DD
  pagesRead: number;
  totalPages: number;
  lastUpdated: string;
}

export interface UserPreferences {
  favoriteGenres: string[];
  favoriteAuthors: string[];
  readingGoalPerMonth: number; // meta de livros por mês
  readingGoalPerYear: number; // meta de livros por ano
  reminderTime: string; // "HH:MM"
  reminderEnabled: boolean;
}

export interface Recommendation {
  title: string;
  author: string;
  genre: string;
  reason: string; // por que recomendamos
  estimatedPages: number;
}

export interface Friend {
  id: string;
  username: string; // Adicionando o username do amigo para vinculação de chat e solicitações
  name: string;
  avatarColor: string;
  favoriteGenre: string;
  bio?: string;
  avatarUrl?: string; // foto de perfil do amigo
}

export interface FriendRequest {
  id: string;
  fromUsername: string;
  fromName: string;
  fromAvatarColor: string;
  toUsername: string;
  timestamp: string;
  status: 'pending' | 'accepted' | 'declined';
}

export interface ChatMessage {
  id: string;
  senderUsername: string;
  receiverUsername: string;
  text: string;
  timestamp: string;
}

export interface UserAccount {
  username: string;
  password?: string; // senha para o login seguro
  name: string;
  avatarColor: string;
  avatarUrl?: string; // foto de perfil (Base64)
  bio?: string; // recado de perfil do usuário
  books: Book[];
  preferences: UserPreferences;
  friends: Friend[];
  pendingRequests: FriendRequest[];
  isDarkMode: boolean;
}


export interface Comment {
  id: string;
  authorName: string;
  text: string;
  photoUrl?: string; // foto anexada pelo leitor
  timestamp: string;
}

export interface Activity {
  id: string;
  friendId: string;
  friendName: string;
  avatarColor: string;
  bookTitle: string;
  bookAuthor: string;
  type: 'reading' | 'read' | 'review';
  review?: string;
  rating?: number;
  likes: number;
  likedByMe: boolean;
  comments: Comment[];
  timestamp: string;
}

