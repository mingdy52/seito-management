import React from 'react';
import { X, FileDown, Printer, DownloadCloud, Upload } from 'lucide-react';
import { TreeNode } from '../types';
import { generateManualHTML } from '../export/generateManualHTML';

interface ExportModalProps {
  data: TreeNode;
  onClose: () => void;
  onDataImport: (data: TreeNode) => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ data, onClose, onDataImport }) => {
  const exportToGoogleDocs = () => {
    const content = generateManualHTML(data);
    const blob = new Blob(['\ufeff', content], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `세이토_매뉴얼_GoogleDocs용_${new Date().toISOString().split('T')[0]}.doc`;
    link.click();
    URL.revokeObjectURL(url);
    onClose();
  };

  const exportToPDF = () => {
    const content = generateManualHTML(data);
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(content);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => { printWindow.print(); printWindow.close(); }, 500);
    }
    onClose();
  };

  const exportDataAsJSON = () => {
    const dataStr = JSON.stringify(data, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `세이토_백업데이터_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    onClose();
  };

  const validateTreeNode = (node: unknown): node is TreeNode => {
    if (!node || typeof node !== 'object') return false;
    const n = node as Record<string, unknown>;
    if (typeof n.id !== 'string' || typeof n.level !== 'number') return false;
    if (n.children !== undefined) {
      if (!Array.isArray(n.children)) return false;
      if (!n.children.every(validateTreeNode)) return false;
    }
    return true;
  };

  const importDataFromJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedData = JSON.parse(event.target!.result as string);
        if (importedData && importedData.id === 'system_root' && validateTreeNode(importedData)) {
          onDataImport(importedData);
          onClose();
        } else {
          alert('올바른 세이토 백업 파일이 아닙니다.');
        }
      } catch (err) {
        console.error("파일 읽기 실패", err);
        alert('파일을 읽을 수 없습니다.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-slate-800">매뉴얼 내보내기</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={24}/></button>
        </div>
        <div className="grid gap-3">
          <button onClick={exportToGoogleDocs} className="w-full flex items-center justify-between p-4 bg-blue-50 hover:bg-blue-100 rounded-2xl transition-all group">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 text-white rounded-lg"><FileDown size={20}/></div>
              <div className="font-bold text-blue-900 text-left">Google Docs 파일 저장</div>
            </div>
          </button>
          <button onClick={exportToPDF} className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-all group">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-800 text-white rounded-lg"><Printer size={20}/></div>
              <div className="font-bold text-slate-900 text-left">PDF / 인쇄하기</div>
            </div>
          </button>

          <div className="my-2 border-t border-slate-100"></div>

          <button onClick={exportDataAsJSON} className="w-full flex items-center justify-between p-4 bg-emerald-50 hover:bg-emerald-100 rounded-2xl transition-all group">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-600 text-white rounded-lg"><DownloadCloud size={20}/></div>
              <div className="font-bold text-emerald-900 text-left">작업 데이터 백업 (JSON)</div>
            </div>
          </button>
          <label className="w-full flex items-center justify-between p-4 bg-orange-50 hover:bg-orange-100 rounded-2xl transition-all group cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-600 text-white rounded-lg"><Upload size={20}/></div>
              <div className="font-bold text-orange-900 text-left">백업 데이터 불러오기</div>
            </div>
            <input type="file" accept=".json" onChange={importDataFromJSON} className="hidden" />
          </label>
        </div>
      </div>
    </div>
  );
};
