import axios from "axios";

const isNonEmpty = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

const isCloudinaryUrl = (value: string): boolean => {
  return /https?:\/\/res\.cloudinary\.com\//i.test(value);
};

interface UploadOptions {
  folder?: string;
  timeoutMs?: number;
}

export const uploadImageToCloudinary = async (
  source: string,
  options: UploadOptions = {}
): Promise<string> => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;

  if (!isNonEmpty(cloudName) || !isNonEmpty(uploadPreset)) {
    return source;
  }

  if (isCloudinaryUrl(source)) {
    return source;
  }

  const form = new URLSearchParams();
  form.set("file", source);
  form.set("upload_preset", uploadPreset.trim());
  if (isNonEmpty(options.folder)) {
    form.set("folder", options.folder.trim());
  }

  const url = `https://api.cloudinary.com/v1_1/${cloudName.trim()}/image/upload`;
  const { data } = await axios.post<{
    secure_url?: string;
    url?: string;
  }>(url, form.toString(), {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    timeout: options.timeoutMs ?? 25000,
  });

  const secure = data?.secure_url;
  if (isNonEmpty(secure)) {
    return secure.trim();
  }

  const fallback = data?.url;
  if (isNonEmpty(fallback)) {
    return fallback.trim();
  }

  return source;
};

export const persistImageUrl = async (
  source: unknown,
  options: UploadOptions = {}
): Promise<string | undefined> => {
  if (!isNonEmpty(source)) return undefined;

  try {
    return await uploadImageToCloudinary(source.trim(), options);
  } catch (error) {
    console.error("Cloudinary upload failed, using original image URL:", error);
    return source.trim();
  }
};
