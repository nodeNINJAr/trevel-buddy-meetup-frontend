export type UserRole = 'USER' | 'ADMIN';

export interface UserProfile {
  id: number;
  userId:number;
  fullName: string;
  avatarUrl?: string;
  bio?: string;
  travelInterests?: string[];
  visitedCountries?: string[];
  currentLocation?: string;
  rating?: number;
  reviewCount?: number;
  verified?: boolean;
  dateOfBirth?: string;
  gender:string;
  createdAt: string;
  updatedAt?: string;
}

export interface User {
  id: number;
  userName: string;
  emailVerified?: boolean;
  profile?: UserProfile;
  image?: string;
  role: UserRole;
  email: string;
  createdAt: string;
  updatedAt?: string;
}

export interface TravelPlan {
  id: number;
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
  status: 'ACTIVE' | 'INACTIVE'| "BLOCKED" | "COMPLETED" | "CANCELLED";
  createdAt: string;
  friendships: TravelFriendship[];
  reviews: Review[];
}


export interface Review {
  id: number;
  fromUserId: number;
  toUserId: number;
  fromUser?: User;
  toUser?:User;
  rating: number;
  comment: string;
  travelPlanId?: string;
  createdAt: string;
  updatedAt?: string;
  status: ReviewStatus
}
export enum ReviewStatus {
     PENDING = "PENDING",
     APPROVED = "APPROVED",
     REJECT= "REJECT"
}


export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, userName: string, image:string ) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

export interface TravelPlanResponse {
  success: boolean;
  message: string;
  data: TravelPlan;
}

export interface TravelUser {
  id: number;
  userName: string;
  email: string;
  emailVerified: boolean;
  passwordHash: string;
  createdAt: string;
  updatedAt: string;
}
export interface TravelFriendship {
  id: number;
  tripId: number;
  userId: number;
  friendId: number;
  message: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}
