"use client";

import { useEffect, useRef, useState } from "react";
import { Camera } from "lucide-react";
import Image from "next/image";
import type { ProfileData } from "../me/page";

type Props = {
  data: ProfileData;
  onChange: (data: ProfileData) => void;
  onNext: () => void;
};

type Errors = Partial<Record<keyof ProfileData, string>>;

export default function ProfileStep({ data, onChange, onNext }: Props) {
  const [errors, setErrors] = useState<Errors>({});
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!/^image\/(png|jpeg|webp|gif|avif)$/.test(file.type)) {
      setErrors((prev) => ({
        ...prev,
        photo: "Please select a PNG, JPEG, WebP, GIF, or AVIF image",
      }));
      e.target.value = "";
      return;
    }

    if (file.size > 4 * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        photo: "Please select an image smaller than 4 MB",
      }));
      e.target.value = "";
      return;
    }

    onChange({ ...data, photo: file });
    setPreview(URL.createObjectURL(file));
    setErrors((prev) => ({ ...prev, photo: undefined }));
  }

  function validate(): boolean {
    const next: Errors = {};
    if (!data.photo) next.photo = "Please add a photo";
    if (!data.name.trim()) next.name = "Please enter your name";
    if (!data.about.trim())
      next.about = "Please write something about yourself";
    if (!data.socialUrl.trim()) next.socialUrl = "Please enter a social link";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleNext() {
    if (!validate()) return;

    setLoading(true);
    setServerError(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Please log in again before saving your profile.");
      }

      const uploadData = new FormData();
      uploadData.append("file", data.photo!);

      const uploadRes = await fetch("/api/profile/avatar", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: uploadData,
      });
      const uploadResult = await uploadRes.json().catch(() => ({}));

      if (!uploadRes.ok) {
        throw new Error(
          uploadResult.error || "Profile photo upload failed. Please try again.",
        );
      }

      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: data.name,
          about: data.about,
          socialMediaURL: data.socialUrl,
          avatarImage: uploadResult.avatarImageUrl,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        setServerError(result.error || "Алдаа гарлаа");
        return;
      }

      onNext();
    } catch (err) {
      setServerError(
        err instanceof Error
          ? err.message
          : "Unable to save your profile. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">
        Complete your profile page
      </h1>

      <div className="mb-6">
        <label className="block text-sm text-gray-700 mb-3">Add photo</label>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className={`relative w-32 h-32 rounded-full border-2 border-dashed flex items-center justify-center transition-colors overflow-hidden ${
            errors.photo
              ? "border-red-400"
              : "border-gray-300 hover:border-gray-400"
          }`}
        >
          {preview ? (
            <Image
              src={preview}
              alt="Selected profile preview"
              fill
              unoptimized
              sizes="128px"
              className="object-cover"
            />
          ) : (
            <Camera className="w-7 h-7 text-gray-400" />
          )}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handlePhoto}
        />
        {errors.photo && (
          <p className="mt-1 text-xs text-red-500">{errors.photo}</p>
        )}
      </div>

      <div className="mb-5">
        <label className="block text-sm text-gray-700 mb-1.5">Name</label>
        <input
          type="text"
          value={data.name}
          onChange={(e) => {
            onChange({ ...data, name: e.target.value });
            if (errors.name) setErrors((p) => ({ ...p, name: undefined }));
          }}
          placeholder="Enter your name here"
          className={`w-full rounded-lg border px-4 py-2.5 text-sm outline-none transition-colors focus:border-gray-400 ${
            errors.name ? "border-red-400" : "border-gray-300"
          }`}
        />
        {errors.name && (
          <p className="mt-1 text-xs text-red-500">{errors.name}</p>
        )}
      </div>

      <div className="mb-5">
        <label className="block text-sm text-gray-700 mb-1.5">About</label>
        <textarea
          value={data.about}
          onChange={(e) => {
            onChange({ ...data, about: e.target.value });
            if (errors.about) setErrors((p) => ({ ...p, about: undefined }));
          }}
          placeholder="Write about yourself here"
          rows={5}
          className={`w-full rounded-lg border px-4 py-2.5 text-sm outline-none resize-none transition-colors focus:border-gray-400 ${
            errors.about ? "border-red-400" : "border-gray-300"
          }`}
        />
        {errors.about && (
          <p className="mt-1 text-xs text-red-500">{errors.about}</p>
        )}
      </div>

      <div className="mb-8">
        <label className="block text-sm text-gray-700 mb-1.5">
          Social media URL
        </label>
        <input
          type="text"
          value={data.socialUrl}
          onChange={(e) => {
            onChange({ ...data, socialUrl: e.target.value });
            if (errors.socialUrl)
              setErrors((p) => ({ ...p, socialUrl: undefined }));
          }}
          placeholder="https://"
          className={`w-full rounded-lg border px-4 py-2.5 text-sm outline-none transition-colors focus:border-gray-400 ${
            errors.socialUrl ? "border-red-400" : "border-gray-300"
          }`}
        />
        {errors.socialUrl && (
          <p className="mt-1 text-xs text-red-500">{errors.socialUrl}</p>
        )}
      </div>

      {serverError && (
        <p className="mb-4 text-sm text-red-500 text-center">{serverError}</p>
      )}

      <div className="flex justify-end">
        <button
          onClick={handleNext}
          disabled={loading}
          className="bg-gray-400 text-white text-sm w-[246px] font-medium px-8 py-3 rounded-lg hover:bg-gray-900 transition-colors disabled:opacity-50"
        >
          {loading ? "Хадгалж байна..." : "Continue"}
        </button>
      </div>
    </div>
  );
}
