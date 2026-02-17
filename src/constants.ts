import { Layout, User, FolderTree, Activity } from 'lucide-react';
import { LevelInfo } from './types';

export const LEVEL_CONFIG: Record<number, LevelInfo> = {
  0: { label: 'Lv.0 프로젝트', Icon: Layout, color: 'text-indigo-500', titleLabel: '프로젝트 명칭' },
  1: { label: 'Lv.1 담당자', Icon: User, color: 'text-blue-500', titleLabel: '이름' },
  2: { label: 'Lv.2 대분류', Icon: FolderTree, color: 'text-emerald-500', titleLabel: '대분류 명칭' },
  3: { label: 'Lv.3 진행과정', Icon: Activity, color: 'text-orange-500', titleLabel: '과정 명칭' },
  4: { label: 'Lv.4 추가과정', Icon: Activity, color: 'text-purple-500', titleLabel: '추가과정 명칭' },
  5: { label: 'Lv.5 세부과정', Icon: Activity, color: 'text-pink-500', titleLabel: '세부과정 명칭' },
};

export const DEFAULT_NODE_TITLES: Record<number, string> = {
  0: '새 프로젝트',
  1: '담당자 성함',
  2: '새 대분류',
  3: '새 진행과정',
  4: '새 추가과정',
  5: '새 세부과정',
};

// 현재 레벨에서 자식을 추가할 때 버튼에 표시할 라벨
export const ADD_CHILD_LABELS: Record<number, string> = {
  '-1': '프로젝트 추가',
  0: '담당자 추가',
  1: '대분류 추가',
  2: '진행과정 추가',
  3: '추가과정 추가',
  4: '세부과정 추가',
};

export const IMAGE_MAX_SIZE = 800;
export const IMAGE_QUALITY = 0.7;

export const FIELD_LABELS: Record<string, string> = {
  title: '제목',
  definition: '정의',
  supplies: '준비물',
  detail: '상세내용',
  tip: '팁',
  time: '소요시간',
  image: '이미지',
};

export function getLevelInfo(level: number): LevelInfo {
  return LEVEL_CONFIG[level] || LEVEL_CONFIG[5];
}
