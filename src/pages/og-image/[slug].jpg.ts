import path from "node:path";
import TinySegmenter from "@/lib/tiny_segmenter";
import { createCanvas, GlobalFonts, SKRSContext2D } from "@napi-rs/canvas";

const segmenter = new TinySegmenter();

// work only static build
GlobalFonts.registerFromPath(
  path.resolve(process.cwd(), "fonts/KiwiMaru-Regular.ttf"),
  "KiwiMaru"
);

export function getStaticPaths() {
  // Ref: https://github.com/withastro/astro/blob/c3f411a7f2d77739cc32e7b7fbceb3d02018238d/packages/astro/test/fixtures/static-build/src/pages/posts.json.js
  const posts = Object.keys(import.meta.glob("../posts/**/*.md"));

  return posts.map((filename) => ({
    params: { slug: filename.replace(/^.*\/(.*)\.md$/, "$1") },
  }));
}

export async function get({ slug }) {
  const {
    frontmatter: { title },
  } = await import(`../posts/${slug}.md`);

  return {
    body: drawOGImage(title),
  };
}

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
  for (fontSize of [80, 72, 64]) {
    ctx.font = `${fontSize}px KiwiMaru`;
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#fff";
    lines = wrapText(ctx, title, CANVAS_WIDTH - PADDING * 2);
    if (lines.length <= 3) {
      break;
    }
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
  return segmenter.segment(text).reduce(
    (lines, segment) => {
      const { width } = ctx.measureText(
        lines[lines.length - 1] + segment.trim()
      );
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
