import type { GlobalResponse, PageResponse, TechItem } from "@/types/siteData";

const API_BASE_URL = import.meta.env["VITE_API_BASE_URL"];

export interface UpdatePageDataRequest {
  content: unknown;
  seoData?: unknown;
  sections: Array<{ id: number; content: unknown }>;
}

export interface MediaUploadResponse {
  fileName: string;
  originalFileName: string;
  folder: "images" | "resume";
  url: string;
  contentType: string;
  size: number;
}

interface RawSectionContent {
  id: number;
  pageId: number;
  key: string;
  content?: string | null;
}

interface RawPageResponse {
  language: PageResponse["language"];
  data: {
    id: number;
    key: string;
    slug: string;
    content?: string | null;
    seoData?: string | null;
    sections: RawSectionContent[];
  };
}

interface RawGlobalResponse {
  language: GlobalResponse["language"];
  data: Array<{
    id: number;
    key: string;
    content?: string | null;
  }>;
}

async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`);

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return response.json();
}

async function authenticatedRequest<T>(path: string, token: string, init: RequestInit) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      ...init.headers,
    },
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `API request failed: ${response.status}`);
  }

  const contentType = response.headers.get("content-type");
  return contentType?.includes("application/json")
    ? (response.json() as Promise<T>)
    : (undefined as T);
}

function parseJson<T = unknown>(value: string | null | undefined): T {
  if (!value) return {} as T;
  return JSON.parse(value) as T;
}

export async function getPageData<TContent = unknown>(
  language: string,
  pageKey: string,
): Promise<PageResponse<TContent>> {
  const response = await apiGet<RawPageResponse>(
    `/Site/page-data?language=${encodeURIComponent(language)}&pagekey=${encodeURIComponent(pageKey)}`,
  );

  return {
    language: response.language,
    data: {
      ...response.data,
      content: parseJson<TContent>(response.data.content),
      seoData: response.data.seoData ? parseJson(response.data.seoData) : undefined,
      sections: response.data.sections.map((section) => ({
        ...section,
        content: parseJson(section.content),
      })),
    },
  };
}

export async function getGlobalData(language: string): Promise<GlobalResponse> {
  const response = await apiGet<RawGlobalResponse>(
    `/Site/global-data?language=${encodeURIComponent(language)}`,
  );

  return {
    language: response.language,
    data: response.data.map((item) => ({
      ...item,
      content: parseJson(item.content),
    })),
  };
}

export function getTechnologies(): Promise<TechItem[]> {
  return apiGet<TechItem[]>("/Site/technologies");
}

export interface TechnologyInput {
  key: string;
  name: string;
  imageUrl: string | null;
}

export function createTechnology(token: string, input: TechnologyInput) {
  return authenticatedRequest<TechItem>("/Site/technologies", token, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}

export function updateTechnology(token: string, id: number, input: TechnologyInput) {
  return authenticatedRequest<TechItem>(`/Site/technologies/${id}`, token, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}

export function deleteTechnology(token: string, id: number) {
  return authenticatedRequest<void>(`/Site/technologies/${id}`, token, { method: "DELETE" });
}

export function updatePageData(
  token: string,
  language: string,
  pageId: number,
  request: UpdatePageDataRequest,
) {
  return authenticatedRequest<void>(
    `/Site/page-data?language=${encodeURIComponent(language)}&pageId=${pageId}`,
    token,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    },
  );
}

export function updateGlobalData(token: string, language: string, key: string, content: unknown) {
  return authenticatedRequest<void>(
    `/Site/global-data?language=${encodeURIComponent(language)}&key=${encodeURIComponent(key)}`,
    token,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    },
  );
}

export function uploadMedia(token: string, file: File) {
  const formData = new FormData();
  formData.append("file", file);

  return authenticatedRequest<MediaUploadResponse>("/Site/upload-media", token, {
    method: "POST",
    body: formData,
  });
}

export async function getImageFiles(): Promise<string[]> {
  return apiGet<string[]>("/Site/media/images");
}

export function deleteImage(token: string, fileName: string) {
  return authenticatedRequest<void>(`/Site/media/images/${encodeURIComponent(fileName)}`, token, {
    method: "DELETE",
  });
}

export function getApiAssetUrl(path: string) {
  return `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function resolveApiResourceUrl(path: string) {
  if (path === "/resume.pdf") return getApiAssetUrl("/Site/media/resume");
  if (path.startsWith("/Uploads/") || path.startsWith("/Site/media/")) {
    return getApiAssetUrl(path);
  }
  return path;
}
