"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { ImagePlus, X } from "lucide-react";
import { TopBar } from "@/components/top-bar";
import { useAuth } from "@/lib/auth/auth-context";
import { createListing } from "@/lib/data/listings";
import { firebaseConfigured, storage } from "@/lib/firebase/client";
import type { Category, Condition, Emirate } from "@/lib/types";

const EMIRATES: Emirate[] = [
  "Abu Dhabi",
  "Dubai",
  "Sharjah",
  "Ajman",
  "Umm Al Quwain",
  "Ras Al Khaimah",
  "Fujairah",
];
const CONDITIONS: Condition[] = ["new", "like_new", "good", "fair", "for_parts"];

function PostDetailsInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const category = (searchParams.get("category") ?? "Other") as Category;
  const { firebaseUser, appUser, signInWithGoogle } = useAuth();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [condition, setCondition] = useState<Condition>("good");
  const [emirate, setEmirate] = useState<Emirate>("Dubai");
  const [area, setArea] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!firebaseUser) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-3 px-8 text-center">
        <p className="text-sm text-om-text-secondary">Sign in to post a listing.</p>
        <button
          onClick={signInWithGoogle}
          className="rounded-full bg-om-accent-primary px-5 py-2.5 text-sm font-medium text-om-text-inverse"
        >
          Sign in with Google
        </button>
      </div>
    );
  }

  const onFiles = async (files: FileList | null) => {
    if (!files?.length || !firebaseConfigured) return;
    setUploading(true);
    try {
      const uploaded = await Promise.all(
        Array.from(files)
          .slice(0, 6 - images.length)
          .map(async (file) => {
            const path = `listings/${firebaseUser.uid}/${Date.now()}-${file.name}`;
            const storageRef = ref(storage, path);
            await uploadBytes(storageRef, file);
            return getDownloadURL(storageRef);
          }),
      );
      setImages((prev) => [...prev, ...uploaded]);
    } catch (err) {
      console.error(err);
      setError("Couldn't upload one or more images. Try again.");
    } finally {
      setUploading(false);
    }
  };

  const submit = async () => {
    setError(null);
    if (!title.trim() || !description.trim() || !price) {
      setError("Title, description, and price are required.");
      return;
    }
    setSubmitting(true);
    try {
      const id = await createListing({
        ownerUid: firebaseUser.uid,
        ownerType: appUser?.shopId ? "shop" : "individual",
        shopId: appUser?.shopId,
        category,
        title: title.trim(),
        description: description.trim(),
        descriptionLang: "en",
        price: Number(price),
        currency: "AED",
        condition,
        emirate,
        area: area.trim() || undefined,
        images,
      });
      router.push(`/listing/${id}`);
    } catch (err) {
      console.error(err);
      setError(
        firebaseConfigured
          ? "Something went wrong creating your listing. Please try again."
          : "Firebase isn't configured yet in this environment — see README.md to connect a real project.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-dvh flex-col pb-28">
      <TopBar title={category} back="/post" />
      <div className="flex flex-col gap-4 p-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Photos</label>
          <div className="flex flex-wrap gap-2">
            {images.map((src) => (
              <div key={src} className="relative h-20 w-20 overflow-hidden rounded-lg bg-om-bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className="h-full w-full object-cover" />
                <button
                  onClick={() => setImages((prev) => prev.filter((s) => s !== src))}
                  className="absolute right-0.5 top-0.5 rounded-full bg-black/60 p-0.5 text-white"
                  aria-label="Remove photo"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
            {images.length < 6 ? (
              <label className="flex h-20 w-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-om-border-strong text-om-text-tertiary">
                <ImagePlus size={18} />
                <span className="text-[11px]">{uploading ? "Uploading…" : "Add"}</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => onFiles(e.target.files)}
                />
              </label>
            ) : null}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. 3-Seater Grey Fabric Sofa"
            className="w-full rounded-lg border border-om-border-default bg-om-bg-surface px-3 py-2.5 text-sm outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="Condition, reason for selling, anything a buyer should know"
            className="w-full rounded-lg border border-om-border-default bg-om-bg-surface px-3 py-2.5 text-sm outline-none"
          />
        </div>

        <div className="flex gap-3">
          <div className="flex-1">
            <label className="mb-1 block text-sm font-medium">Price (AED)</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full rounded-lg border border-om-border-default bg-om-bg-surface px-3 py-2.5 text-sm outline-none"
            />
          </div>
          <div className="flex-1">
            <label className="mb-1 block text-sm font-medium">Condition</label>
            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value as Condition)}
              className="w-full rounded-lg border border-om-border-default bg-om-bg-surface px-3 py-2.5 text-sm outline-none"
            >
              {CONDITIONS.map((c) => (
                <option key={c} value={c}>
                  {c.replace("_", " ")}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="flex-1">
            <label className="mb-1 block text-sm font-medium">Emirate</label>
            <select
              value={emirate}
              onChange={(e) => setEmirate(e.target.value as Emirate)}
              className="w-full rounded-lg border border-om-border-default bg-om-bg-surface px-3 py-2.5 text-sm outline-none"
            >
              {EMIRATES.map((e) => (
                <option key={e} value={e}>
                  {e}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="mb-1 block text-sm font-medium">Area (optional)</label>
            <input
              value={area}
              onChange={(e) => setArea(e.target.value)}
              placeholder="e.g. Al Nahda"
              className="w-full rounded-lg border border-om-border-default bg-om-bg-surface px-3 py-2.5 text-sm outline-none"
            />
          </div>
        </div>

        {error ? <p className="text-sm text-om-accent-error">{error}</p> : null}
      </div>

      <div className="fixed inset-x-0 bottom-0 border-t border-om-border-default bg-om-bg-surface p-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)]">
        <button
          onClick={submit}
          disabled={submitting}
          className="w-full rounded-full bg-om-accent-primary py-3 text-sm font-semibold text-om-text-inverse disabled:opacity-60"
        >
          {submitting ? "Posting…" : "Post listing"}
        </button>
      </div>
    </div>
  );
}

export default function PostDetailsPage() {
  return (
    <Suspense fallback={null}>
      <PostDetailsInner />
    </Suspense>
  );
}
