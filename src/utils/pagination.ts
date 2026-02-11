import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '@/lib/constants';

export type PaginationParams = {
  page: number;
  pageSize: number;
};

export type PaginatedResult<T> = {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
};

export function parsePaginationParams(
  searchParams: URLSearchParams,
): PaginationParams {
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
  const rawSize = parseInt(searchParams.get('pageSize') ?? String(DEFAULT_PAGE_SIZE), 10);
  const pageSize = Math.min(Math.max(1, rawSize), MAX_PAGE_SIZE);

  return { page, pageSize };
}

export function buildPaginatedResult<T>(
  data: T[],
  totalCount: number,
  params: PaginationParams,
): PaginatedResult<T> {
  const totalPages = Math.ceil(totalCount / params.pageSize);

  return {
    data,
    pagination: {
      page: params.page,
      pageSize: params.pageSize,
      totalCount,
      totalPages,
      hasNextPage: params.page < totalPages,
      hasPrevPage: params.page > 1,
    },
  };
}

export function getSkipTake(params: PaginationParams) {
  return {
    skip: (params.page - 1) * params.pageSize,
    take: params.pageSize,
  };
}
