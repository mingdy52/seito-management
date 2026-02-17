import { TreeNode } from '../types';

function renderProcessFields(node: TreeNode, indent: number): string {
  let html = '';
  const marginStyle = indent > 0 ? ` style="margin-left: ${indent}px;"` : '';
  const pMarginStyle = indent > 0 ? ` style="margin-left: ${indent}px;"` : '';

  if (node.supplies) html += `<div class="box"${marginStyle}><span class="label">준비물</span><pre>${node.supplies}</pre></div>`;
  if (node.detail) html += `<div class="box"${marginStyle}><span class="label">상세 과정</span><pre>${node.detail}</pre></div>`;
  if (node.tip) html += `<div class="box"${marginStyle}><span class="label">핵심 노하우</span><pre class="tip">${node.tip}</pre></div>`;
  if (node.image) html += `<div class="box"${marginStyle}><span class="label">참고 사진</span><img src="${node.image}" style="max-width: 100%; height: auto; border-radius: 5px; margin-top: 10px;" /></div>`;
  if (node.time) html += `<p${pMarginStyle}><strong>소요 시간:</strong> ${node.time}분</p>`;

  return html;
}

export function generateManualHTML(data: TreeNode): string {
  if (!data) return "";

  let html = `<html><head><meta charset="utf-8"><style>
    body { font-family: 'Malgun Gothic', sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 40px auto; padding: 20px; }
    h1 { color: #1e40af; border-bottom: 2px solid #1e40af; padding-bottom: 10px; margin-top: 40px; }
    h2 { color: #1e3a8a; border-left: 5px solid #1e3a8a; padding-left: 15px; margin-top: 30px; }
    h3 { color: #065f46; margin-top: 25px; background: #f0fdf4; padding: 8px; border-radius: 5px; }
    h4 { color: #9a3412; margin-top: 20px; border-bottom: 1px dashed #ddd; }
    .box { border: 1px solid #e2e8f0; padding: 15px; border-radius: 8px; background: #f8fafc; margin: 10px 0; }
    .label { font-weight: bold; color: #64748b; font-size: 0.8em; text-transform: uppercase; display: block; margin-bottom: 5px; }
    .tip { color: #ea580c; font-weight: bold; }
    pre { white-space: pre-wrap; font-family: inherit; margin: 0; }
  </style></head><body>`;

  const traverse = (node: TreeNode) => {
    if (node.level === -1) {
      if (node.children) node.children.forEach(traverse);
      return;
    }

    if (node.level === 0) {
      html += `<h1>[프로젝트] ${node.title}</h1>`;
    } else if (node.level === 1) {
      html += `<h2>[담당] ${node.title}</h2>`;
    } else if (node.level === 2) {
      html += `<h3>대분류: ${node.title}</h3>`;
      if (node.definition) html += `<div class="box"><span class="label">정의</span><pre>${node.definition}</pre></div>`;
    } else if (node.level === 3) {
      html += `<h4>과정: ${node.title}</h4>`;
      html += renderProcessFields(node, 0);
    } else if (node.level === 4) {
      html += `<h5 style="color: #4c1d95; margin-top: 15px; padding-left: 20px;">└ 추가과정: ${node.title}</h5>`;
      html += renderProcessFields(node, 20);
    } else if (node.level === 5) {
      html += `<h6 style="color: #be185d; margin-top: 15px; padding-left: 40px;">└ 세부과정: ${node.title}</h6>`;
      html += renderProcessFields(node, 40);
    }

    if (node.children) node.children.forEach(traverse);
  };

  if (data.children) data.children.forEach(traverse);
  html += `</body></html>`;
  return html;
}
