export type UserRole = 'user' | 'admin';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  profileImage?: string;
  bio?: string;
  travelInterests?: string[];
  visitedCountries?: string[];
  currentLocation?: string;
  rating?: number;
  reviewCount?: number;
  verified?: boolean;
}

export interface TravelPlan {
  id: string;
  userId: string;
  user?: User;
  destination: string;
  country: string;
  startDate: string;
  endDate: string;
  budgetMin: number;
  budgetMax: number;
  travelType: 'Solo' | 'Family' | 'Friends' | 'Couple';
  description: string;
  interests: string[];
  status: 'active' | 'completed' | 'cancelled';
  participants?: string[];
  createdAt: string;
}

export interface Review {
  id: string;
  fromUserId: string;
  toUserId: string;
  fromUser?: User;
  rating: number;
  comment: string;
  travelPlanId?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}
