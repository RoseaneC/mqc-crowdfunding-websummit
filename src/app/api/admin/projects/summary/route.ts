import { listAdminImpactProjects } from "../../../_lib/projectStore";
import { getApiBaseUrl, proxyToFastify } from "../../../_lib/proxy";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!getApiBaseUrl()) {
    const projects = await listAdminImpactProjects();

    return Response.json({
      pending: projects.filter((project) => project.status === "PENDING")
        .length,
      approved: projects.filter((project) => project.status === "APPROVED")
        .length,
      rejected: projects.filter((project) => project.status === "REJECTED")
        .length,
      total_projects: projects.length,
      source: "local-project-store",
    });
  }

  return proxyToFastify(request, "GET", "/admin/projects/summary");
}
