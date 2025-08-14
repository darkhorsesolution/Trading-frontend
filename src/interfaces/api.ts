interface ApiPaginatedResponseContainer<T> {
    result: boolean;
    data: T;
    current_page?: number;
    page_size?: number;
    total_count?: number;
}

export interface ApiResponseContainer<T> {
    result: boolean;
    data: T;
    message: string;
}

export interface ListResponse<T> {
    page: number,
    per_page: number,
    total: number,
    total_pages: number,
    data: T[]
}

export interface PaginationRequest {
    page: number,
    tags: string[] | undefined,
    search: string | undefined
}

export default ApiPaginatedResponseContainer;