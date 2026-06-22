import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  uploadMedia,
  getAllMedia,
  getMediaStats,
  getCloudinaryUsage,
  getSingleMedia,
  updateMedia,
  deleteMedia,
} from "./mediaApi.js";
import { toast } from "react-toastify";

/* -----------------------------
GET ALL MEDIA
------------------------------ */
export const useMediaList = () => {
  return useQuery({
    queryKey: ["media"],
    queryFn: getAllMedia,
  });
};

/* -----------------------------
GET MEDIA STATS
------------------------------ */
export const useMediaStats = () => {
  return useQuery({
    queryKey: ["media", "stats"],
    queryFn: getMediaStats,
  });
};

/* -----------------------------
GET CLOUDINARY USAGE
Separate namespace on purpose — see comment above. Cached for 5 minutes
so normal media CRUD never silently re-triggers Cloudinary's Admin API.
------------------------------ */
export const useCloudinaryUsage = () => {
  return useQuery({
    queryKey: ["cloudinary-usage"],
    queryFn: getCloudinaryUsage,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
};

/* -----------------------------
GET SINGLE MEDIA
------------------------------ */
export const useSingleMedia = (id) => {
  return useQuery({
    queryKey: ["media", id],
    queryFn: () => getSingleMedia(id),
    enabled: !!id,
  });
};

/* -----------------------------
UPLOAD MEDIA
------------------------------ */
export const useUploadMedia = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadMedia,
    onSuccess: () => {
      // Prefix match: invalidates ["media"] and ["media","stats"], but NOT
      // ["cloudinary-usage"] since that key doesn't share the "media" prefix.
      queryClient.invalidateQueries({ queryKey: ["media"] });
      toast.success("Media uploaded successfully!");
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Upload failed");
    },
  });
};

/* -----------------------------
UPDATE MEDIA
------------------------------ */
export const useUpdateMedia = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateMedia,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["media"] });
      toast.success("Media updated successfully!");
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Update failed");
    },
  });
};

/* -----------------------------
DELETE MEDIA
------------------------------ */
export const useDeleteMedia = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteMedia,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["media"] });
      toast.success("Media deleted successfully!");
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Delete failed");
    },
  });
};