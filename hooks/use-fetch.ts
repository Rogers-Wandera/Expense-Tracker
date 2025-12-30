"use client";

import {
  keepPreviousData,
  QueryKey,
  RefetchOptions,
  useMutation,
  useQuery,
  UseQueryOptions,
} from "@tanstack/react-query";
import { AxiosRequestConfig } from "axios";
import { useCallback, useMemo, useRef } from "react";
import { useAuth } from "./use-auth";
import api from "@/lib/axios.interceptors";
import { IServerErrorResponse } from "@/types/interfaces";
import { normalizeError } from "@/lib/utils";

export interface FetchProps<T = unknown> {
  queryKey: string | any[];
  url?: string;
  endPoint?: string;
  configs?: AxiosRequestConfig;
  getUrlParams?: () => Record<string, string | number | boolean>;
  manual?: boolean;
  afterFetch?: (data: T) => void | Promise<void>;
  beforeFetch?: () => void | Promise<void>;
  onError?: (error: IServerErrorResponse) => void;
  withAuth?: boolean;
  staleTime?: number;
  gcTime?: number;
  retry?: number | boolean;
  retryDelay?: number;
  refetchOnWindowFocus?: boolean;
  refetchOnMount?: boolean;
  refetchOnReconnect?: boolean;
  throttleRefetch?: number;
}

const normalizeQueryKey = (key: string | any[]): QueryKey => {
  if (!Array.isArray(key)) return [key];
  return key.filter((item) => item !== undefined && item !== null);
};

const nomarlizeEndPoint = (endPoint: string | undefined) => {
  if (endPoint) {
    return endPoint.startsWith("/") ? endPoint.slice(1) : endPoint;
  }
  return "";
};

export function useFetch<T = unknown>({
  queryKey,
  getUrlParams,
  manual = true,
  url,
  endPoint = "",
  configs = {},
  beforeFetch,
  afterFetch,
  withAuth = true,
  staleTime = 5 * 60 * 1000,
  gcTime = 10 * 60 * 1000,
  retry = 2,
  retryDelay = 1000,
  refetchOnWindowFocus = false,
  refetchOnMount = false,
  refetchOnReconnect = false,
  throttleRefetch = 1000,
  onError,
}: FetchProps<T>) {
  const { user } = useAuth();

  const canFetch = useMemo(() => {
    if (withAuth && !user?.id) return false;
    return true;
  }, [withAuth, user?.id]);

  const getAxiosConfigs = useCallback((): AxiosRequestConfig => {
    const headers: Record<string, any> = { ...(configs?.headers || {}) };
    const params = getUrlParams ? getUrlParams() : {};
    console.log("params", params);

    return { headers, params };
  }, [configs, withAuth, getUrlParams]);

  const stableQueryKey = useMemo(() => {
    const baseKey = normalizeQueryKey(queryKey);
    return [...baseKey];
  }, [queryKey]);

  const queryFn = useCallback(async (): Promise<T> => {
    try {
      const baseUrl = url || `${nomarlizeEndPoint(endPoint)}`;

      await beforeFetch?.();
      const axiosConfigs = getAxiosConfigs();

      const response = await api.get<T>(baseUrl, {
        withCredentials: true,
        ...axiosConfigs,
      });

      await afterFetch?.(response.data);
      return response.data;
    } catch (error) {
      const normalizedError = normalizeError(error);
      onError?.(normalizedError);
      throw normalizedError;
    }
  }, [
    getUrlParams,
    url,
    endPoint,
    getAxiosConfigs,
    beforeFetch,
    afterFetch,
    onError,
    stableQueryKey,
  ]);

  const queryOptions = useMemo(
    (): UseQueryOptions<T, IServerErrorResponse> => ({
      queryKey: stableQueryKey,
      queryFn,
      placeholderData: keepPreviousData,
      enabled: manual && canFetch,
      staleTime,
      gcTime,
      retry,
      retryDelay,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
    }),
    [
      stableQueryKey,
      queryFn,
      canFetch,
      manual,
      staleTime,
      gcTime,
      retry,
      retryDelay,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
    ]
  );

  const queryResult = useQuery<T, IServerErrorResponse>(queryOptions);

  // Throttled refetch
  const lastRefetchRef = useRef<number>(0);

  const throttledRefetch = useCallback(
    async (options?: RefetchOptions) => {
      if (!canFetch) {
        console.warn(
          "Cannot refetch: Authentication required but no token available"
        );
        return Promise.reject(new Error("Authentication required"));
      }
      const now = Date.now();
      if (now - lastRefetchRef.current < throttleRefetch) {
        return Promise.resolve(queryResult.data);
      }
      lastRefetchRef.current = now;
      return queryResult.refetch(options);
    },
    [queryResult.refetch, queryResult.data, throttleRefetch]
  );

  return useMemo(
    () => ({
      data: queryResult.data,
      error: queryResult.error,
      isLoading: queryResult.isLoading,
      isRefetching: queryResult.isFetching && !queryResult.isLoading,
      isFetching: queryResult.isFetching,
      isSuccess: queryResult.isSuccess,
      isError: queryResult.isError,
      refetch: throttledRefetch,
    }),
    [
      queryResult.data,
      queryResult.error,
      queryResult.isLoading,
      queryResult.isFetching,
      queryResult.isSuccess,
      queryResult.isError,
      throttledRefetch,
    ]
  );
}

type LazyFetchProps<T = unknown> = Omit<
  FetchProps<T>,
  | "manual"
  | "staleTime"
  | "gcTime"
  | "retry"
  | "retryDelay"
  | "refetchOnWindowFocus"
  | "refetchOnMount"
  | "refetchOnReconnect"
  | "throttleRefetch"
  | "queryKey"
>;

type ApiResponse<T> = T & {
  error?: IServerErrorResponse;
};

export function useLazyFetch<T = unknown>({
  url,
  endPoint = "",
  getUrlParams,
  configs = {},
  beforeFetch,
  afterFetch,
  withAuth = true,
  onError,
}: LazyFetchProps<T>) {
  const { user } = useAuth();

  const canFetch = useMemo(() => {
    if (withAuth && !user?.id) return false;
    return true;
  }, [withAuth, user?.id]);

  const getAxiosConfigs = useCallback((): AxiosRequestConfig => {
    const headers: Record<string, any> = { ...(configs?.headers || {}) };
    return { ...configs, headers };
  }, [configs, withAuth]);

  const mutation = useMutation<
    ApiResponse<T>,
    IServerErrorResponse,
    {
      endPoint?: string;
      url?: string;
      params?: Record<string, string>;
    }
  >({
    mutationFn: async (variables = {}) => {
      try {
        if (!canFetch) throw new Error("Authentication required");
        let baseUrl =
          url || `${api.defaults.baseURL}/${nomarlizeEndPoint(endPoint)}`;
        if (variables?.url) baseUrl = variables.url;
        if (variables?.endPoint) {
          baseUrl = `${api.defaults.baseURL}/${nomarlizeEndPoint(
            variables.endPoint
          )}`;
        }

        await beforeFetch?.();
        const axiosConfigs = getAxiosConfigs();

        // Merge provided params with getUrlParams
        const allParams = {
          ...(getUrlParams ? getUrlParams() : {}),
          ...(variables?.params || {}),
        };

        const response = await api.get<ApiResponse<T>>(baseUrl, {
          withCredentials: true,
          ...axiosConfigs,
          params: allParams,
        });

        await afterFetch?.(response.data);
        return response.data;
      } catch (error) {
        const normalizedError = normalizeError(error);
        onError?.(normalizedError);
        throw normalizedError;
      }
    },
  });

  return {
    data: mutation.data,
    error: mutation.error,
    isLoading: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    getDataAsync: mutation.mutateAsync,
    getData: mutation.mutate,
  };
}
