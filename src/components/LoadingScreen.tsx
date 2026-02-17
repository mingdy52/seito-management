import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingScreen: React.FC = () => (
  <div className="h-screen flex items-center justify-center bg-white flex-col gap-4">
    <Loader2 className="animate-spin text-blue-600" size={48} />
    <p className="font-bold text-slate-600">세이토 매뉴얼 동기화 중...</p>
  </div>
);
