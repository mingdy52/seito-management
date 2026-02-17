import React from 'react';
import { Box, FileText, Sparkles, X, UploadCloud, LinkIcon, Image as ImageIcon } from 'lucide-react';
import { TreeNode } from '../types';

interface ProcessEditorProps {
  node: TreeNode;
  allNodes: { id: string; label: string; level: number }[];
  onUpdate: (id: string, fields: Partial<TreeNode>) => void;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>, nodeId: string) => void;
  onFieldBlur: (nodeId: string, field: string) => void;
  onSelectNode: (id: string) => void;
  findNodeById: (id: string) => TreeNode | null;
}

export const ProcessEditor: React.FC<ProcessEditorProps> = ({
  node, allNodes, onUpdate, onImageUpload, onFieldBlur, onSelectNode, findNodeById,
}) => {
  return (
    <>
      <div className="space-y-6 md:space-y-8 animate-in fade-in duration-300">
        <div className="grid gap-5 md:gap-8">
          <div>
            <label className="block text-[10px] md:text-xs font-bold text-slate-400 mb-2 md:mb-3 uppercase"><Box size={14} className="inline mr-1 text-blue-400"/> 준비물</label>
            <textarea className="w-full p-3 md:p-4 rounded-xl md:rounded-2xl border bg-blue-50/10 focus:bg-white min-h-[80px] md:min-h-[100px] outline-none resize-y text-sm md:text-base" value={node.supplies || ''} onChange={(e) => onUpdate(node.id, { supplies: e.target.value })} onBlur={() => onFieldBlur(node.id, 'supplies')} placeholder="재료와 도구" />
          </div>
          <div>
            <label className="block text-[10px] md:text-xs font-bold text-slate-400 mb-2 md:mb-3 uppercase"><FileText size={14} className="inline mr-1 text-slate-400"/> 상세 과정</label>
            <textarea className="w-full p-3 md:p-4 rounded-xl md:rounded-2xl border bg-slate-50 focus:bg-white min-h-[180px] md:min-h-[220px] outline-none resize-y leading-relaxed text-sm md:text-base" value={node.detail || ''} onChange={(e) => onUpdate(node.id, { detail: e.target.value })} onBlur={() => onFieldBlur(node.id, 'detail')} placeholder="수행 단계" />
          </div>
          <div>
            <label className="block text-[10px] md:text-xs font-bold text-orange-500 mb-2 md:mb-3 uppercase"><Sparkles size={14} className="inline mr-1"/> 핵심 노하우</label>
            <textarea className="w-full p-3 md:p-4 rounded-xl md:rounded-2xl border border-orange-100 bg-orange-50/10 focus:bg-white min-h-[80px] md:min-h-[100px] outline-none font-medium resize-y text-sm md:text-base" value={node.tip || ''} onChange={(e) => onUpdate(node.id, { tip: e.target.value })} onBlur={() => onFieldBlur(node.id, 'tip')} placeholder="꿀팁 기록" />
          </div>
          <div>
            <label className="block text-[10px] md:text-xs font-bold text-slate-400 mb-2 md:mb-3 uppercase"><ImageIcon size={14} className="inline mr-1 text-slate-400"/> 사진 첨부</label>
            {node.image ? (
              <div className="relative inline-block">
                <img src={node.image} alt="Uploaded" className="max-h-60 rounded-xl border border-slate-200 shadow-sm" />
                <button
                  onClick={() => onUpdate(node.id, { image: '' })}
                  className="absolute -top-2 -right-2 p-1.5 bg-white text-red-500 border border-red-100 rounded-full hover:bg-red-50 hover:text-red-600 shadow-md transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-32 md:h-40 border-2 border-slate-300 border-dashed rounded-xl md:rounded-2xl cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors group">
                <div className="flex flex-col items-center justify-center pt-5 pb-6 text-slate-400 group-hover:text-slate-500">
                  <UploadCloud size={28} className="mb-2" />
                  <p className="text-sm font-bold">클릭하여 이미지 업로드</p>
                  <p className="text-xs mt-1">용량 최적화를 위해 자동 압축됩니다 (JPG, PNG)</p>
                </div>
                <input type="file" className="hidden" accept="image/*" onChange={(e) => onImageUpload(e, node.id)} />
              </label>
            )}
          </div>
        </div>
        <div className="pt-5 md:pt-6 border-t border-slate-100">
          <label className="block text-[10px] font-bold text-slate-400 mb-2 uppercase">예상 시간 (분)</label>
          <input type="number" className="w-full p-3 rounded-xl border bg-slate-50 focus:bg-white outline-none font-bold max-w-[120px] md:max-w-[150px] text-sm md:text-base" value={node.time || ''} onChange={(e) => onUpdate(node.id, { time: e.target.value })} onBlur={() => onFieldBlur(node.id, 'time')} />
        </div>
      </div>

      {/* 관련 항목 링크 섹션 */}
      <div className="pt-6 md:pt-8 mt-6 md:mt-8 border-t border-slate-200">
        <label className="block text-[10px] md:text-xs font-bold text-slate-400 mb-3 md:mb-4 uppercase flex items-center gap-1.5">
          <LinkIcon size={14} className="text-blue-500"/> 관련 항목 연결 (References)
        </label>

        <div className="flex flex-wrap gap-2 mb-3 md:mb-4">
          {(node.links || []).map(linkId => {
            const linkedNode = findNodeById(linkId);
            if (!linkedNode) return null;
            return (
              <div key={linkId} className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-sm font-bold border border-blue-200 transition-colors group shadow-sm">
                <LinkIcon size={14} className="text-blue-500 shrink-0" />
                <button
                  onClick={() => onSelectNode(linkId)}
                  className="hover:underline text-left truncate max-w-[200px] md:max-w-[300px]"
                  title={allNodes.find(n => n.id === linkId)?.label}
                >
                  {linkedNode.title || '이름 없음'}
                </button>
                <button
                  onClick={() => onUpdate(node.id, { links: node.links!.filter(id => id !== linkId) })}
                  className="p-1 text-blue-300 hover:text-red-500 rounded-full ml-1 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            );
          })}
        </div>

        <select
          className="w-full p-3 md:p-4 rounded-xl border bg-slate-50 hover:bg-slate-100 focus:bg-white focus:ring-4 focus:ring-blue-500/10 outline-none text-sm md:text-base font-bold text-slate-400 hover:text-slate-600 transition-all cursor-pointer"
          value=""
          onChange={(e) => {
            if (e.target.value) {
              const newLinks = [...(node.links || []), e.target.value];
              onUpdate(node.id, { links: newLinks });
            }
          }}
        >
          <option value="">+ 클릭해서 연결할 항목 찾기...</option>
          {allNodes
            .filter(n => n.level >= 3 && n.id !== node.id && !(node.links || []).includes(n.id))
            .map(n => (
              <option key={n.id} value={n.id}>{n.label}</option>
            ))
          }
        </select>
      </div>
    </>
  );
};
