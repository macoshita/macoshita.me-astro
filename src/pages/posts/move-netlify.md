---
title: Move to Netlify this blog
lang: en
category: move-netlify
tags: [Netlify, Nuxt.js]
createdAt: 2018-04-18 00:00:00 +0900
updated_at: 2018-04-18 00:00:00 +0900
published: true
layout: "@/layouts/BlogPostLayout.astro"
---

I'm making this blog using [nuxt](https://nuxtjs.org/) lately.
I built it at local machine and deployed it GitHub Pages, using [push-dir](https://www.npmjs.com/package/push-dir) until now.
But building at local machine is troublesome, and I'll edit a bit on GitHub directly, I considered to use CD sevice.
I thought that Circle CI is good, but [Netlify](https://www.netlify.com/) has the CD mechanism, can use own domain, and it's free!
So, I have been moved to Netlify this blog.

## Deployment Strategy

<https://github.com/macoshita/macoshita.me>

- `npm run generate` generate static files to `dist` directory.
- Upload `dist` directory whole, that's all.

## Netlify Console

- Choose the repository.
- Input building command and dist directory.
  - Can skip if repository has `netlify.toml`.
- Set up custom domain.
  - Buy domain.
  - Netlify DNS make four Nameservers. Set this servers at domain registrar's console.
  - (I bought domain at Amazon Route 53, so I opened AWS Console and edited Route 53 > Registered domains > Name servers.)
- Configure HTTPS.
  - Click on "Verify DNS configuration", Netlify configure "Let's Encrypt".
    - But you will wait for about a hour.
  - Enable Force HTTPS if successed it.

It's very easy. Maybe you can do it with only smartphone! :thumbsup:

## Results

I achieved the original goals that automatic deployment.

![audits](/images/2018-04-18-audits.png)

Audits score is no change to compare with GitHub Pages.
(It's natural that this blog is very few CSS :stuck_out_tongue_closed_eyes: )

## Bonus: Cache settings of Netlify

<https://www.netlify.com/blog/2017/02/23/better-living-through-caching/>

`max-age=0, must-revalidate, public`

`must-revalidate` is a directive that:

- If cache is expired that browser should check whether content has been changed.
- If content is no change that browser can reuse cache.

Netlify server set ETag and `Cache-control: max-age=0` automatically.
It means, browser always check whether content has been changed and use cache while that is no change.

Is it too slow that always request content? Netlify's blog said:

> The CDN makes the check-in from the browser fast - it talks with the node closest to it and that node is ready with an instant answer as to whether the content is usable as-is (Etag matches, no deploys or rollbacks have happened).
> Using HTTP/2, browsers multiplexes these connections so they can all happen within a single connection and you don’t have to do things like negotiate the HTTPS handshake over and over again.

However this blog has filename based cache-busting JS and CSS, so I thought their content should edit Cache-Control max-age and I tried that.
But... this blog is already cached by service worker, so it did not make sense :joy:
