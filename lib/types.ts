export type PostType = "photo" | "route" | "spot";

export interface User {
  id: string;
  name: string;
  avatar: string;
  bike: string;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  premium: boolean;
}

export interface Post {
  id: string;
  type: PostType;
  author: User;
  title: string;
  content: string;
  images: string[];
  isIllustration?: boolean;
  tags: string[];
  likes: number;
  comments: number;
  createdAt: string;
  location?: string;
  routeData?: RouteData;
  spotData?: SpotData;
  liked?: boolean;
}

export interface RouteData {
  distance: number;
  duration: string;
  startPoint: string;
  endPoint: string;
  waypoints: [number, number][];
  difficulty: "easy" | "medium" | "hard";
  scenery: number;
  road: number;
}

export interface SpotData {
  lat: number;
  lng: number;
  category: "道の駅" | "峠" | "絶景" | "グルメ" | "温泉" | "その他";
  rating: number;
  reviewCount: number;
  address: string;
}
