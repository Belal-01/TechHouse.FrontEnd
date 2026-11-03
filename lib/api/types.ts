// `code` is a stable key (e.g. PRODUCT_SKU_EXISTS) to map to an Arabic message; `error` is for developers.
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  code?: string;
  error?: string;
  fieldErrors?: Record<string, string>;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export type Role = "OWNER" | "MANAGER" | "STAFF";

export interface UserResponse {
  id: string;
  email: string;
  displayName: string;
  role: Role;
}

export interface StoreResponse {
  id: string;
  name: string;
  countryCode: string;
  baseCurrency: string;
  localCurrency: string;
  timezone: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: UserResponse;
  stores: StoreResponse[];
}
