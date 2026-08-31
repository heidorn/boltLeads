import { atom } from 'nanostores';

/*
 * Estado da barra lateral de chats.
 *
 * Vive fora do componente porque quem abre são dois lugares: o botão do topo
 * (intenção explícita) e o cursor encostando na borda esquerda (atalho).
 */
export const sidebarOpen = atom<boolean>(false);

export function toggleSidebar() {
  sidebarOpen.set(!sidebarOpen.get());
}
