import path from "node:path";
import { createCanvas, GlobalFonts, type SKRSContext2D } from "@napi-rs/canvas";
import type { APIRoute } from "astro";
import { getCollection } from "astro:content";

const segmenter = new Intl.Segmenter("ja", { granularity: "word" });

// work only static build
GlobalFonts.registerFromPath(
  path.resolve(process.cwd(), "fonts/KiwiMaru-Regular.ttf"),
  "KiwiMaru"
);

export async function getStaticPaths() {
  const posts = await getCollection("blog");
  return posts.map((post) => ({
    params: { slug: post.id },
    props: post,
  }));
}

export const GET: APIRoute = async ({ props }) => {
  return new Response(drawOGImage(props.data.title));
};

const CANVAS_WIDTH = 1200;
const CANVAS_HEIGHT = 630;
const PADDING = 96;
const BLOG_NAME = "@macoshita";

function drawOGImage(title: string): Buffer {
  const canvas = createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
  const ctx = canvas.getContext("2d");

  fill(ctx);
  drawTitle(ctx, title);
  drawName(ctx);

  return canvas.toBuffer("image/jpeg", 80);
}

function fill(ctx: SKRSContext2D) {
  ctx.fillStyle = "#111";
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
}

function drawTitle(ctx: SKRSContext2D, title: string) {
  let lines, fontSize;
  for (const size of [80, 72, 64]) {
    ctx.font = `${size}px KiwiMaru`;
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#fff";
    lines = wrapText(ctx, title, CANVAS_WIDTH - PADDING * 2);
    if (lines.length <= 3) {
      fontSize = size;
      break;
    }
  }
  if (!lines || !fontSize) {
    throw new Error("Title is too long to fit in the canvas.");
  }

  const fontHeight = fontSize * 1.5;
  lines.forEach((line, i) => {
    const { width } = ctx.measureText(line);
    ctx.fillText(
      line,
      (CANVAS_WIDTH - width) / 2,
      (CANVAS_HEIGHT + (1 - lines.length) * fontHeight) / 2 + i * fontHeight
    );
  });
}

function wrapText(
  ctx: SKRSContext2D,
  text: string,
  maxWidth: number
): string[] {
  return Array.from(segmenter.segment(text)).reduce(
    (lines, { segment }) => {
      const { width } = ctx.measureText(lines[lines.length - 1] + segment);
      if (width > maxWidth) {
        lines.push("");
      }

      lines[lines.length - 1] += segment;
      return lines;
    },
    [""]
  );
}

function drawName(ctx: SKRSContext2D) {
  ctx.font = `40px KiwiMaru`;
  ctx.textBaseline = "middle";
  const { width } = ctx.measureText(BLOG_NAME);
  ctx.fillText(
    BLOG_NAME,
    CANVAS_WIDTH - PADDING - width,
    CANVAS_HEIGHT - PADDING
  );
}
