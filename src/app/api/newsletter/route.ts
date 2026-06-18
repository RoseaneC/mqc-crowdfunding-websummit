import {
  handleNewsletterOptions,
  handleNewsletterPost,
} from "../_lib/newsletter";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function OPTIONS() {
  return handleNewsletterOptions();
}

export function POST(request: Request) {
  return handleNewsletterPost(request);
}
