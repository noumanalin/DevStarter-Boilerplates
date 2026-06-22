import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  subscribeToNewsletterApi,
  unsubscribeFromNewsletterApi,
  getAllSubscribersApi,
  deleteSubscriberApi,
} from "./newsletterApi.js";

/* ─────────────────────────────────────────────
   QUERY KEYS
───────────────────────────────────────────── */
export const NEWSLETTER_KEYS = {
  subscribers: ["newsletter", "subscribers"],
};

/* ─────────────────────────────────────────────
   Helper to get token from Redux store
───────────────────────────────────────────── */
const getTokenFromStore = () => {
  try {
    const state = JSON.parse(localStorage.getItem("persist:root") || "{}");
    const auth = JSON.parse(state.auth || "{}");
    return auth.token || null;
  } catch {
    return null;
  }
};

/* ─────────────────────────────────────────────
   PUBLIC - SUBSCRIBE TO NEWSLETTER
───────────────────────────────────────────── */
export const useSubscribeToNewsletter = () => {
  return useMutation({
    mutationFn: subscribeToNewsletterApi,
    onSuccess: (data) => {
      toast.success(data?.message || "Successfully subscribed to newsletter!");
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message || "Failed to subscribe. Please try again."
      );
    },
  });
};

/* ─────────────────────────────────────────────
   PUBLIC - UNSUBSCRIBE FROM NEWSLETTER
───────────────────────────────────────────── */
export const useUnsubscribeFromNewsletter = () => {
  return useMutation({
    mutationFn: unsubscribeFromNewsletterApi,
    onSuccess: (data) => {
      toast.success(data?.message || "Successfully unsubscribed.");
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message || "Failed to unsubscribe. Please try again."
      );
    },
  });
};

/* ─────────────────────────────────────────────
   ADMIN - GET ALL SUBSCRIBERS
───────────────────────────────────────────── */
export const useGetAllSubscribers = () => {
  const token = getTokenFromStore();
  
  return useQuery({
    queryKey: NEWSLETTER_KEYS.subscribers,
    queryFn: () => getAllSubscribersApi(token),
    enabled: !!token,
    staleTime: 2 * 60 * 1000,
    select: (data) => ({
      subscribers: data?.data?.subscribers || [],
      total: data?.data?.total || 0,
    }),
  });
};

/* ─────────────────────────────────────────────
   ADMIN - DELETE SUBSCRIBER
───────────────────────────────────────────── */
export const useDeleteSubscriber = () => {
  const queryClient = useQueryClient();
  const token = getTokenFromStore();

  return useMutation({
    mutationFn: (id) => deleteSubscriberApi(id, token),
    onSuccess: (data) => {
      toast.success(data?.message || "Subscriber removed successfully.");
      queryClient.invalidateQueries({ queryKey: NEWSLETTER_KEYS.subscribers });
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message || "Failed to delete subscriber."
      );
    },
  });
};