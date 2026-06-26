import {
  listAdminImpactProjects,
  toProjectDTO,
} from "../../../_lib/projectStore";
import { getApiBaseUrl, proxyToFastify } from "../../../_lib/proxy";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!getApiBaseUrl()) {
    const projects = await listAdminImpactProjects();

    return Response.json(
      projects
        .filter((project) => project.status === "PENDING")
        .map((project) => toProjectDTO(project)),
    );
  }

  return proxyToFastify(request, "GET", "/admin/projects/pending");
}
