import fs from 'node:fs/promises';
import path from 'node:path';
import readline from 'node:readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function main() {
  const slug = process.argv[2] || await question('Post slug (e.g. my-new-post): ');
  if (!slug) {
    console.error('Slug is required');
    process.exit(1);
  }

  const title = await question('Post title: ');

  // Get current date in JST, since user seems to be in Japan (+09:00 timezone)
  const now = new Date();
  const jstDate = new Date(now.getTime() + (9 * 60 * 60 * 1000));
  const date = jstDate.toISOString().split('T')[0];

  const content = `---
title: ${title || slug}
description: ""
createdAt: ${date}
tags: []
---

`;

  const ext = slug.endsWith('.mdx') || slug.endsWith('.md') ? '' : '.md';
  const filePath = path.join(process.cwd(), 'src/content/blog', slug + ext);

  try {
    await fs.writeFile(filePath, content, { flag: 'wx' });
    console.log(`Created ${filePath}`);
  } catch (err) {
    if (err.code === 'EEXIST') {
      console.error(`File already exists: ${filePath}`);
    } else {
      console.error(err);
    }
  }

  rl.close();
}

main();
