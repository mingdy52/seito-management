import { TreeNode } from '../types';

export function findNode(node: TreeNode | null, id: string): TreeNode | null {
  if (!node) return null;
  if (node.id === id) return node;
  for (const child of (node.children || [])) {
    const found = findNode(child, id);
    if (found) return found;
  }
  return null;
}

export function findParent(node: TreeNode | null, childId: string): TreeNode | null {
  if (!node || !node.children) return null;
  if (node.children.some(child => child.id === childId)) return node;
  for (const child of node.children) {
    const parent = findParent(child, childId);
    if (parent) return parent;
  }
  return null;
}

export function findAncestorAtLevel(root: TreeNode, targetId: string, level: number): TreeNode | null {
  const path: TreeNode[] = [];
  function dfs(node: TreeNode): boolean {
    path.push(node);
    if (node.id === targetId) return true;
    for (const child of (node.children || [])) {
      if (dfs(child)) return true;
    }
    path.pop();
    return false;
  }
  dfs(root);
  return path.find(n => n.level === level) || null;
}

export function setOpenByLevel(node: TreeNode, maxLevel: number): void {
  if (node.children && node.children.length > 0) {
    node.isOpen = node.level <= maxLevel;
    node.children.forEach(child => setOpenByLevel(child, maxLevel));
  }
}

export function collapseAll(node: TreeNode): void {
  node.isOpen = false;
  node.children?.forEach(child => collapseAll(child));
}

export function getAllNodesList(node: TreeNode | null, path = ''): { id: string; label: string; level: number }[] {
  if (!node) return [];
  if (node.level === -1) {
    let list: { id: string; label: string; level: number }[] = [];
    if (node.children) {
      node.children.forEach(child => {
        list = list.concat(getAllNodesList(child, ''));
      });
    }
    return list;
  }
  const currentPath = path ? `${path} > ${node.title || '이름 없음'}` : (node.title || '이름 없음');
  let list = [{ id: node.id, label: currentPath, level: node.level }];
  if (node.children) {
    node.children.forEach(child => {
      list = list.concat(getAllNodesList(child, currentPath));
    });
  }
  return list;
}
