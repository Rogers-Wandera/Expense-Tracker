"use client";
import { AxiosError, AxiosRequestConfig } from "axios";
import { QueryKey, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { IServerErrorResponse } from "@/types/interfaces";
import api from "@/lib/axios.interceptors";
import { useAuth } from "./use-auth";
import { normalizeError } from "@/lib/utils";

export type MutateProps<TData = any, TVariables = any> = {
  configs?: AxiosRequestConfig;
  withAuth?: boolean;
  onSuccess?: (data: TData, variables?: TVariables) => void;
  onError?: (
    error: AxiosError<IServerErrorResponse>,
    variables?: TVariables
  ) => void;
  onSettled?: (
    data: TData | undefined,
    error: AxiosError<IServerErrorResponse> | null,
    variables?: TVariables
  ) => void;
  invalidateQueries?: QueryKey | QueryKey[];
  optimisticUpdate?: {
    queryKey: QueryKey;
    updateFn: (variables?: TVariables) => (oldData: any) => any;
  };
};

export type MutateCallbackProps<TVariables = any> = {
  variables?: TVariables;
  url?: string;
  endPoint?: string;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
};

const nomarlizeEndPoint = (endPoint: string | undefined) => {
  if (endPoint) {
    return endPoint.startsWith("/") ? endPoint.slice(1) : endPoint;
  }
  return "";
};

export function useMutate<TData = any, TVariables = any>({
  configs = {},
  withAuth = true,
  onSuccess,
  onError,
  onSettled,
  invalidateQueries,
  optimisticUpdate,
}: MutateProps<TData, TVariables>) {
  const queryClient = useQueryClient();

  const { user } = useAuth();

  const mutationFn = useCallback(
    async ({
      variables,
      endPoint = "",
      url,
      method = "POST",
    }: MutateCallbackProps<TVariables>): Promise<TData> => {
      try {
        const baseUri =
          url || `${api.defaults.baseURL}/${nomarlizeEndPoint(endPoint)}`;
        const headers: Record<string, any> = { ...(configs?.headers || {}) };

        if (withAuth && !user?.id) {
          throw new Error("No user found");
        }

        const response = await api.request<TData>({
          ...configs,
          headers,
          withCredentials: true,
          method,
          url: baseUri,
          data: variables,
        });

        return response.data;
      } catch (error) {
        throw normalizeError(error);
      }
    },
    [configs, withAuth, user?.id]
  );

  return useMutation<
    TData,
    AxiosError<IServerErrorResponse>,
    MutateCallbackProps<TVariables>
  >({
    mutationFn,
    onSuccess: (data, variables) => {
      if (invalidateQueries) {
        const queries = Array.isArray(invalidateQueries)
          ? invalidateQueries
          : [invalidateQueries];
        Promise.all(
          queries.map((queryKey) => queryClient.invalidateQueries({ queryKey }))
        );
      }
      onSuccess?.(data, variables.variables);
    },
    onError: (error, variables) => {
      onError?.(error, variables.variables);
    },
    onSettled: (data, error, variables) => {
      onSettled?.(data, error, variables.variables);
    },
    onMutate: optimisticUpdate
      ? async (variables) => {
          await queryClient.cancelQueries({
            queryKey: optimisticUpdate.queryKey,
          });
          const previousData = queryClient.getQueryData(
            optimisticUpdate.queryKey
          );

          queryClient.setQueryData(
            optimisticUpdate.queryKey,
            optimisticUpdate.updateFn(variables.variables)
          );

          return { previousData };
        }
      : undefined,
  });
}
