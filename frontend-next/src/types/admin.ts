import type { DefinitionEntry, FaqPair, KeyFact } from "@/utils/seoAnalysis";

/** The admin blog editor's form state (AdminBlogs + SeoPanel). */
export interface BlogForm {
  title: string;
  permalink: string;
  metaDescription: string;
  description: string;
  category: string;
  keywords: string;
  /** A newly picked file; null when the existing image is kept. */
  image: File | null;
  /** Blob URL of a new file, or the hosted URL of the saved image. */
  imagePreview: string;
  /** The saved image URL, so editing without re-uploading keeps it. */
  existingImageUrl: string;

  meta_title: string;
  focus_keyword: string;
  secondary_keywords: string[];
  canonical_url: string;
  robots_directive: string;
  schema_type: string;
  direct_answer: string;
  faq_schema: FaqPair[];
  key_facts: KeyFact[];
  definitions: DefinitionEntry[];
  alt_text: string;
  og_image_url: string;
  author_name: string;
  author_bio: string;
  areas_covered: string[];
  reviewer_name: string;
  reviewer_role: string;
  reviewed_at: string;
}

export type BlogFormField = keyof BlogForm;

/** Typed setter for one field of the form. */
export type SetBlogField = <K extends BlogFormField>(name: K, value: BlogForm[K]) => void;

export interface ToastState {
  msg: string;
  type: string;
}
