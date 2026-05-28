import { handleContactOptions, handleContactPost } from "../_lib/contact";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function OPTIONS() {
  return handleContactOptions();
}

export function POST(request: Request) {
  return handleContactPost(request);
}
