import config from "@/config";
import { omitBy, isNil } from "lodash-es";

export const formatDate = (date: Date | string): string => {
  const d = typeof date === "string" ? new Date(date) : date;
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
};

interface Meta {
  lang: string;
  postTitle: string;
  title: string;
  description: string;
  createdAt: Date;
  ogImage: string;
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
    createdAt,
    ogImage = defaultOgImage,
    tags = [],
  } = omitBy(content, isNil);

  return {
    lang,
    postTitle,
    title: `${postTitle} - ${config.title}`,
    description,
    createdAt,
    ogImage,
    tags,
  };
};
