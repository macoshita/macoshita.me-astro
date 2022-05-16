---
title: The prefetch tag is not work without crossorigin attribute on Amazon S3
lang: en
category: prefetch-crossorigin-amazon-s3
tags:
createdAt: 2018-04-17 00:00:00 +0900
updated_at: 2018-04-17 00:00:00 +0900
published: true
layout: "@/layouts/BlogPostLayout.astro"
---

On Amazon S3, `<link rel="prefetch">` is not work without crossorigin attribute.

[Test Site](http://macoshita-test-crossorigin.s3-website-ap-northeast-1.amazonaws.com/)

Perhaps Amazon S3 only add CORS headers (Access-Control-Allow-Origin, Access-Control-Allow-Methods ...) when request headers has `Origin`.
When the document has no crossorigin prefetch tag, access to prefetch URL without origin header on Chrome.
This response is cached Chrome, and reuse next access by `script` tag.
This cache has no CORS headers. :cry:

## Source:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="initial-scale=1" />
    <title>crossorigin test</title>
    <link
      rel="prefetch"
      href="https://s3-ap-northeast-1.amazonaws.com/macoshita-test-crossorigin/main.js"
      crossorigin
    />
    <!-- important -->
  </head>
  <body>
    <h1>crossorigin prefetch test (maybe success)</h1>
    <a id="test" href="javascript:void(0)">Click to load script</a>
    <script>
      document.getElementById("test").addEventListener(
        "click",
        function () {
          const script = document.createElement("script");
          script.src =
            "https://s3-ap-northeast-1.amazonaws.com/macoshita-test-crossorigin/main.js";
          script.crossOrigin = "crossorigin";

          document.getElementsByTagName("head")[0].appendChild(script);
        },
        false
      );
    </script>
  </body>
</html>
```

## Result:

### Success

![success](/images/2018-04-17-1.png)

### Fail

![fail](/images/2018-04-17-2.png)
