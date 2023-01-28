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

export const getPostMeta = (
  frontmatter: Record<string, any>,
  compiledContent: string | undefined,
  canonicalURL: URL
): Meta => {
  const defaultDescription =
    compiledContent
      ?.replace(/(<([^>]+)>)/gi, "")
      .substring(0, 100)
      .trim() ?? "";
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
  } = omitBy(frontmatter, isNil);

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
