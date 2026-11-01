export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error: string | null;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface UserDto {
  id: string;
  email: string;
  displayName: string;
  role: string;
}

export interface StoreDto {
  id: string;
  name: string;
  countryCode: string;
  localCurrency: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: UserDto;
  stores: StoreDto[];
}
