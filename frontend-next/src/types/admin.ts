import type { DefinitionEntry, FaqPair, KeyFact } from "@/utils/seoAnalysis";

export interface BlogForm {
  title: string;
  permalink: string;
  metaDescription: string;
  description: string;
  category: string;
  keywords: string;
  image: File | null;
  imagePreview: string;
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

export type SetBlogField = <K extends BlogFormField>(name: K, value: BlogForm[K]) => void;

export interface ToastState {
  msg: string;
  type: string;
}
