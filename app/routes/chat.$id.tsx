import { json, type LoaderFunctionArgs, type MetaFunction } from '@remix-run/cloudflare';
import { default as IndexRoute } from './_index';

/*
 * Sem `meta`, a aba de um chat existente cai no fallback do navegador e mostra a
 * URL crua ("localhost:5180/chat/2-1788…"). O nome do chat em si é definido no
 * cliente, conforme a conversa ganha título; aqui garantimos ao menos a marca.
 */
export const meta: MetaFunction = () => {
  return [
    { title: 'Leads Per Hour — Studio' },
    { name: 'description', content: 'Studio da Leads Per Hour: descreva, gere e publique aplicações com IA.' },
  ];
};

export async function loader(args: LoaderFunctionArgs) {
  return json({ id: args.params.id });
}

export default IndexRoute;
