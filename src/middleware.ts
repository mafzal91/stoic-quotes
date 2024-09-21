import { NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { kv } from "@vercel/kv";
import { Database } from "@/utilities/database";
import type { NextFetchEvent, NextRequest } from "next/server";
import { ImagePresets } from "@/app/common";
import { imageDimensions } from "@/utilities/constants";

const imageDimensionsMap = new Map(
  imageDimensions.map(({ name, height, width }) => [name, { width, height }])
);
// Delete the screen preset because if its selected by the user, we want to use the width and height from the cookies
imageDimensionsMap.delete(ImagePresets.Screen);

const ratelimit = new Ratelimit({
  redis: kv,
  limiter: Ratelimit.slidingWindow(100, "60 s"),
  analytics: true,
});

async function apiHandler(request: NextRequest, event: NextFetchEvent) {
  const ip = request.ip ?? "127.0.0.1";
  try {
    const { success, pending, limit, reset, remaining } = await ratelimit.limit(
      ip
    );
    event.waitUntil(pending);

    let res = success
      ? NextResponse.next()
      : NextResponse.json(
          {
            error: {
              message: "Too many requests, please try again later.",
            },
          },
          { status: 429 }
        );

    res.headers.set("X-RateLimit-Limit", limit.toString());
    res.headers.set("X-RateLimit-Remaining", remaining.toString());
    res.headers.set("X-RateLimit-Reset", reset.toString());
    return res;
  } catch (error) {
    console.log(error);
    NextResponse.next();
  }
}

async function imagePathHandler(request: NextRequest) {
  const cookies = request.cookies.getAll();
  const quote_id = Number(request.nextUrl.pathname.split("/")[2]);
  const cookiesMap = new Map(cookies.map(({ name, value }) => [name, value]));
  const colorScheme = cookiesMap.get("colorScheme");
  const border = cookiesMap.get("border") ?? "true";
  const imagePreset = cookiesMap.get("imagePreset") ?? ImagePresets.Screen;
  let height = 1000;
  let width = 1000;
  console.log({
    cookies,
    quote_id,
    cookiesMap,
    colorScheme,
    border,
    imagePreset,
  });
  if (imageDimensionsMap.has(imagePreset)) {
    width = imageDimensionsMap.get(imagePreset)?.width ?? 1000;
    height = imageDimensionsMap.get(imagePreset)?.height ?? 1000;
  } else {
    const cookieHeight = cookiesMap.get("height");
    const cookieWidth = cookiesMap.get("width");

    width = cookieWidth ? parseInt(cookieWidth, 10) : 1000;
    height = cookieHeight ? parseInt(cookieHeight, 10) : 1000;
  }

  // const url = new URL(
  //   `https://qoupjlxnoue6szhd6gal3ibqfm0jcyfg.lambda-url.us-east-1.on.aws/`
  // );
  const url = new URL(
    `https://fz3mxvj5ue7dwrwpcdb67ygdeq0twlgx.lambda-url.us-east-1.on.aws/`
  );
  url.searchParams.set("quote_id", `${quote_id}`);
  url.searchParams.set("width", width.toString());
  url.searchParams.set("height", height.toString());
  const response = NextResponse.rewrite(url);

  cookies.forEach((cookie) => {
    response.cookies.set(cookie.name, cookie.value);
  });
  console.log(url.toString());
  // response.headers.set(
  //   "Content-Disposition",
  //   'attachment; filename="stoic-snapshots.png"'
  // );

  await new Database().saveDownloadSettings({
    quote_id,
    color_scheme: colorScheme,
    border,
    image_preset: imagePreset,
    width,
    height,
  });

  return response;
}

export async function middleware(request: NextRequest, event: NextFetchEvent) {
  if (request.nextUrl.pathname.startsWith("/image")) {
    return imagePathHandler(request);
  }

  if (request.nextUrl.pathname.startsWith("/api")) {
    return apiHandler(request, event);
  }
}

export const config = {
  matcher: ["/image/:path*", "/api/:path*"],
};
