export type UserRole = 'user' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  avatarUrl?: string;
  bio?: string;
  travelInterests?: string[];
  visitedCountries?: string[];
  currentLocation?: string;
  rating?: number;
  reviewCount?: number;
  verified?: boolean;
}

export interface User {
  id: number;
  userName: string;
  emailVerified?: boolean;
  profile?: UserProfile;
  image?: string;
}

export interface TravelPlan {
  id: string;
  userId: number;
  user?: User;
  destination: string;
  country: string;
  startDate: string;
  endDate: string;
  budgetMin: number;
  budgetMax: number;
  travelType: string;
  interests: string[];
  description: string;
  participants?: User[];
  status: 'active' | 'inactive';
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
  register: (email: string, password: string, userName: string, image:string ) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}
// 
// ---------- Types ----------
// export interface UserProfile {
//   id: string;
//   name: string;
//   email: string;
//   image?: string;
//   bio?: string;
//   currentLocation?: string;
//   travelInterests?: string[];
//   visitedCountries?: string[];
//   verified?: boolean;
// }
