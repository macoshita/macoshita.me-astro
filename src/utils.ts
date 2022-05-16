import config from "@/config";

export const formatDate = (date: Date | string): string => {
  const d = typeof date === "string" ? new Date(date) : date;
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
};

interface Meta {
  lang: string;
  title: string;
  description: string;
  created_at: Date;
  og_image: string;
  tags: string[];
}

export const getPostMeta = (content: any, canonicalURL: URL): Meta => {
  const defaultDescription = content.astro.html
    .replace(/(<([^>]+)>)/gi, "")
    .substr(0, 100)
    .trim();
  const defaultOgImage = canonicalURL.pathname.replace(
    /^\/posts\/([^\/]+)\/$/,
    `${canonicalURL.origin}/og-image/$1.jpg`
  );
  const {
    lang = "ja",
    title: postTitle,
    description = defaultDescription,
    created_at,
    og_image = defaultOgImage,
    tags = [],
  } = content;

  return {
    lang,
    title: `${postTitle} - ${config.title}`,
    description,
    created_at,
    og_image,
    tags,
  };
};
