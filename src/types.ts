import { LucideIcon } from 'lucide-react';

export interface TreeNode {
  id: string;
  title?: string;
  level: number;
  children?: TreeNode[];
  isOpen?: boolean;
  definition?: string;
  supplies?: string;
  detail?: string;
  tip?: string;
  time?: string;
  image?: string;
  links?: string[];
}

export interface LevelInfo {
  label: string;
  Icon: LucideIcon;
  color: string;
  titleLabel: string;
}

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';
