import pkg, { CanvasRenderingContext2D } from "canvas";
import path from "node:path";
import TinySegmenter from "@/lib/tiny_segmenter";

const { createCanvas, registerFont } = pkg;
const segmenter = new TinySegmenter();

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
const FONT_SIZE = 60;
const SPACING = 1.5;
const FONT_HEIGHT = FONT_SIZE * SPACING;
const BLOG_NAME = "@macoshita";

function drawOGImage(title: string): Buffer {
  // only static build
  registerFont(path.resolve(process.cwd(), "fonts/KiwiMaru-Regular.ttf"), {
    family: "KiwiMaru",
  });

  const canvas = createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
  const ctx = canvas.getContext("2d");

  fill(ctx);
  drawTitle(ctx, title);
  drawName(ctx);

  return canvas.toBuffer("image/jpeg", { quality: 0.8 });
}

function fill(ctx: pkg.CanvasRenderingContext2D) {
  ctx.fillStyle = "#111";
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
}

function drawTitle(ctx: CanvasRenderingContext2D, title: string) {
  ctx.font = `${FONT_SIZE}px KiwiMaru`;
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#fff";
  const lines = wrapText(ctx, title, CANVAS_WIDTH * 0.8);
  lines.forEach((line, i) => {
    const { width } = ctx.measureText(line);
    ctx.fillText(
      line,
      (CANVAS_WIDTH - width) / 2,
      (CANVAS_HEIGHT + (1 - lines.length) * FONT_HEIGHT) / 2 + i * FONT_HEIGHT
    );
  });
}

function wrapText(
  ctx: CanvasRenderingContext2D,
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

function drawName(ctx: CanvasRenderingContext2D) {
  ctx.font = `40px KiwiMaru`;
  ctx.textBaseline = "bottom";
  const { width } = ctx.measureText(BLOG_NAME);
  ctx.fillText(BLOG_NAME, CANVAS_WIDTH - 80 - width, CANVAS_HEIGHT - 80);
}
