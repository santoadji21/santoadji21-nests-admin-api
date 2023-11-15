export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T> {
  pagination: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    limit: number;
    next?: string | null;
    prev?: string | null;
  };
}
