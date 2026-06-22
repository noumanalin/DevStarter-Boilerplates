import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/* -----------------------------
RESOURCE TYPE — single source of truth, used by BOTH upload and delete.
Cloudinary categorizes assets as "image" | "video" | "raw" — note that
PDFs (and 3D models) belong under "image", not "raw". Sending a PDF as
"raw" is what caused the extension-less, broken delivery URL.
------------------------------ */
export const getResourceType = (mime = "") => {
  if (mime.startsWith("image/")) return "image";
  if (mime.startsWith("video/")) return "video";
  if (mime === "application/pdf") return "image";
  return "raw"; // Word, Excel, PowerPoint, and anything else
};

/* -----------------------------
UPLOAD FORMAT
- Raster images: force webp (unchanged behavior).
- PDFs: leave undefined — Cloudinary auto-detects "pdf" and the delivery
  URL will end in .pdf on its own, since it's an "image"-type asset.
- True raw files (docx/xlsx/pptx/etc): a Buffer has no filename for
  Cloudinary to read, so we explicitly pass the original extension as
  the format — this is what makes the delivery URL end in .docx/.xlsx/etc.
------------------------------ */
export const getUploadFormat = (mime = "", originalName = "") => {
  if (mime.startsWith("image/")) return "webp";
  if (mime === "application/pdf") return undefined;

  const ext = originalName.split(".").pop()?.toLowerCase();
  return ext || undefined;
};

export const uploadToCloudinary = (buffer, folder = "blogs", publicId, resourceType = "image", format) => {
  return new Promise((resolve, reject) => {
    const options = {
      folder,
      resource_type: resourceType,
      quality: "auto:best",
      ...(publicId && { public_id: publicId }),
      ...(format && { format }),
    };

    const uploadStream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });

    uploadStream.end(buffer);
  });
};

/* -----------------------------
DELETE — must be told the SAME resource_type the asset was uploaded
with, or Cloudinary silently fails to delete it (this was the bug:
every non-image file was being "deleted" with resource_type: "image",
which doesn't match anything, so nothing actually got removed).
------------------------------ */
export const deleteFromCloudinary = async (publicId, resourceType = "image") => {
  return await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
};

// NOTE: only meaningful for "raw" assets, since image/video public IDs never
// include an extension to begin with. If you reuse this elsewhere, don't
// strip the extension before deleting/looking up a raw asset — its public_id
// must keep the extension, per Cloudinary's raw-file requirements.
export const extractPublicId = (url) => {
  if (!url) return null;
  try {
    const parts = url.split("/upload/");
    if (parts.length < 2) return null;
    const withoutVersion = parts[1].replace(/^v\d+\//, "");
    const withoutExtension = withoutVersion.replace(/\.[^/.]+$/, "");
    return withoutExtension;
  } catch {
    return null;
  }
};

export default cloudinary;