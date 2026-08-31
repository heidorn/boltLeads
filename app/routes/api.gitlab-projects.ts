import { json } from '@remix-run/cloudflare';
import { withSecurity } from '~/lib/security';
import type { GitLabProjectInfo } from '~/types/GitLab';

interface GitLabProject {
  id: number;
  name: string;
  path_with_namespace: string;
  description: string;
  web_url: string;
  http_url_to_repo: string;
  star_count: number;
  forks_count: number;
  updated_at: string;
  default_branch: string;
  visibility: string;
}

async function gitlabProjectsLoader({ request }: { request: Request }) {
  try {
    const body: any = await request.json();
    const { token, gitlabUrl = 'https://gitlab.com' } = body;

    if (!token) {
      return json({ error: 'O token do GitLab é obrigatório' }, { status: 400 });
    }

    // Fetch user's projects from GitLab API
    const url = `${gitlabUrl}/api/v4/projects?membership=true&per_page=100&order_by=updated_at&sort=desc`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
        'User-Agent': 'bolt.diy-app',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        return json({ error: 'Token do GitLab inválido' }, { status: 401 });
      }

      const errorText = await response.text().catch(() => 'Erro desconhecido');
      console.error('GitLab API error:', response.status, errorText);

      return json(
        {
          error: `Erro da API do GitLab: ${response.status}`,
        },
        { status: response.status },
      );
    }

    const projects: GitLabProject[] = await response.json();

    // Transform to our GitLabProjectInfo format
    const transformedProjects: GitLabProjectInfo[] = projects.map((project) => ({
      id: project.id,
      name: project.name,
      path_with_namespace: project.path_with_namespace,
      description: project.description || '',
      http_url_to_repo: project.http_url_to_repo,
      star_count: project.star_count,
      forks_count: project.forks_count,
      updated_at: project.updated_at,
      default_branch: project.default_branch,
      visibility: project.visibility,
    }));

    return json({
      projects: transformedProjects,
      total: transformedProjects.length,
    });
  } catch (error) {
    console.error('Failed to fetch GitLab projects:', error);

    if (error instanceof Error) {
      if (error.message.includes('fetch')) {
        return json(
          {
            error: 'Não foi possível conectar ao GitLab. Verifique sua conexão de rede.',
          },
          { status: 503 },
        );
      }

      return json(
        {
          error: `Não foi possível obter os projetos: ${error.message}`,
        },
        { status: 500 },
      );
    }

    return json(
      {
        error: 'Ocorreu um erro inesperado ao carregar os projetos',
      },
      { status: 500 },
    );
  }
}

export const action = withSecurity(gitlabProjectsLoader);
