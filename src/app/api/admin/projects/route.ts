import { listAdminImpactProjects, toProjectDTO } from "../../_lib/projectStore";
import { getApiBaseUrl, proxyToFastify } from "../../_lib/proxy";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!getApiBaseUrl()) {
    const projects = await listAdminImpactProjects();

    return Response.json({
      data: projects.map((project) => toProjectDTO(project)),
      source: "local-project-store",
      warning:
        "Modo demonstrativo sem autenticacao administrativa real. Endpoints prontos para protecao futura.",
    });
  }

  return proxyToFastify(request, "GET", "/admin/projects");
}
