import { FindManyOptions } from 'typeorm';

export interface PaginationParams {
  page: number;
  limit: number;
  orderBy?: string;
  baseUrl: string;
}
export interface AbstractPaginationParams<T> {
  page: number;
  limit: number;
  orderBy?: string;
  baseUrl: string;
  additionalOptions?: FindManyOptions<T>;
}
