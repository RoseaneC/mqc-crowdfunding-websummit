import { app } from "../../../../packages/api/src/index";

type HttpMethod =
  | "GET"
  | "POST"
  | "PUT"
  | "PATCH"
  | "DELETE"
  | "HEAD"
  | "OPTIONS";

export async function proxyToFastify(
  request: Request,
  method: HttpMethod,
  targetPath: string,
) {
  const search = new URL(request.url).search;

  let payload: string | Buffer | undefined;
  if (method !== "GET" && method !== "HEAD") {
    const contentType = request.headers.get("content-type") ?? "";
    if (
      contentType.includes("application/json") ||
      contentType.includes("text/")
    ) {
      payload = await request.text();
    } else {
      payload = Buffer.from(await request.arrayBuffer());
    }
  }

  const response = await app.inject({
    method,
    url: `${targetPath}${search}`,
    headers: Object.fromEntries(request.headers.entries()),
    payload,
  });

  const headers = new Headers();
  for (const [key, value] of Object.entries(response.headers)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        headers.append(key, item);
      }
    } else if (value !== undefined) {
      headers.set(key, String(value));
    }
  }

  return new Response(response.body, {
    status: response.statusCode,
    headers,
  });
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
