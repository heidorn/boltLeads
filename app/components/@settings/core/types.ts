import type { ReactNode } from 'react';
import { User, Folder, Wifi, Settings, Box, Sliders } from 'lucide-react';

export type SettingCategory = 'profile' | 'file_sharing' | 'connectivity' | 'system' | 'services' | 'preferences';

export type TabType =
  | 'profile'
  | 'settings'
  | 'notifications'
  | 'features'
  | 'data'
  | 'cloud-providers'
  | 'local-providers'
  | 'github'
  | 'gitlab'
  | 'netlify'
  | 'vercel'
  | 'supabase'
  | 'event-logs'
  | 'mcp';

export type WindowType = 'user' | 'developer';

export interface UserProfile {
  nickname: any;
  name: string;
  email: string;
  avatar?: string;
  theme: 'light' | 'dark' | 'system';
  notifications: boolean;
  password?: string;
  bio?: string;
  language: string;
  timezone: string;
}

export interface SettingItem {
  id: TabType;
  label: string;
  icon: string;
  category: SettingCategory;
  description?: string;
  component: () => ReactNode;
  badge?: string;
  keywords?: string[];
}

export interface TabVisibilityConfig {
  id: TabType;
  visible: boolean;
  window: WindowType;
  order: number;
  isExtraDevTab?: boolean;
  locked?: boolean;
}

export interface DevTabConfig extends TabVisibilityConfig {
  window: 'developer';
}

export interface UserTabConfig extends TabVisibilityConfig {
  window: 'user';
}

export interface TabWindowConfig {
  userTabs: UserTabConfig[];
}

export const TAB_LABELS: Record<TabType, string> = {
  profile: 'Perfil',
  settings: 'Preferências',
  notifications: 'Notificações',
  features: 'Recursos',
  data: 'Dados',
  'cloud-providers': 'Provedores em nuvem',
  'local-providers': 'Provedores locais',
  github: 'GitHub',
  gitlab: 'GitLab',
  netlify: 'Netlify',
  vercel: 'Vercel',
  supabase: 'Supabase',
  'event-logs': 'Registros',
  mcp: 'Servidores MCP',
};

export const categoryLabels: Record<SettingCategory, string> = {
  profile: 'Perfil e conta',
  file_sharing: 'Compartilhamento de arquivos',
  connectivity: 'Conectividade',
  system: 'Sistema',
  services: 'Serviços',
  preferences: 'Preferências',
};

export const categoryIcons: Record<SettingCategory, React.ComponentType<{ className?: string }>> = {
  profile: User,
  file_sharing: Folder,
  connectivity: Wifi,
  system: Settings,
  services: Box,
  preferences: Sliders,
};

export interface Profile {
  username?: string;
  bio?: string;
  avatar?: string;
  preferences?: {
    notifications?: boolean;
    theme?: 'light' | 'dark' | 'system';
    language?: string;
    timezone?: string;
  };
}
