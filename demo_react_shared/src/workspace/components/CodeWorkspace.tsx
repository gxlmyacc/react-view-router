import React, { useEffect, useState } from 'react';
import CodeBlock from './CodeBlock';
import CodeEditor from './CodeEditor';
import './CodeWorkspace.scss';

export interface CodeWorkspaceFile {
  path: string;
  content: string;
}

interface FileTreeNode {
  name: string;
  path: string;
  file?: CodeWorkspaceFile;
  children: FileTreeNode[];
}

export interface CodeWorkspaceProps {
  files: CodeWorkspaceFile[];
  entry?: string;
  editable?: boolean;
  className?: string;
  onChange?(path: string, content: string): void;
}

export function getCodeLanguage(path: string): string {
  return path.split('.').pop()?.toLowerCase() || 'text';
}

export function createCodeFileTree(files: CodeWorkspaceFile[]): FileTreeNode[] {
  const root: FileTreeNode[] = [];
  files.forEach(file => {
    const parts = file.path.split('/');
    let nodes = root;
    let currentPath = '';
    parts.forEach((name, index) => {
      currentPath = currentPath ? `${currentPath}/${name}` : name;
      let node = nodes.find(item => item.name === name);
      if (!node) {
        node = { name, path: currentPath, children: [] };
        nodes.push(node);
      }
      if (index === parts.length - 1) node.file = file;
      nodes = node.children;
    });
  });
  const sort = (nodes: FileTreeNode[]): FileTreeNode[] => nodes
    .sort((left, right) => {
      if (Boolean(left.file) !== Boolean(right.file)) return left.file ? 1 : -1;
      return left.name.localeCompare(right.name);
    })
    .map(node => ({ ...node, children: sort(node.children) }));
  return sort(root);
}

export default function CodeWorkspace({
  files,
  entry,
  editable = false,
  className = '',
  onChange,
}: CodeWorkspaceProps): React.ReactElement {
  const firstPath = entry && files.some(file => file.path === entry) ? entry : files[0]?.path;
  const [activePath, setActivePath] = useState(firstPath || '');
  const activeFile = files.find(file => file.path === activePath) || files[0];
  const tree = createCodeFileTree(files);
  useEffect(() => {
    if (!files.some(file => file.path === activePath) && firstPath) setActivePath(firstPath);
  }, [activePath, files, firstPath]);

  const renderTree = (nodes: FileTreeNode[], depth = 0): React.ReactNode => nodes.map(node => (
    <li key={node.path}>
      {node.file ? (
        <button
          className={node.path === activeFile?.path ? 'is-active' : ''}
          onClick={() => setActivePath(node.path)}
          style={{ paddingLeft: 10 + (depth * 13) }}
          type="button"
        >{node.name}</button>
      ) : (
        <span className="code-workspace-folder" style={{ paddingLeft: 10 + (depth * 13) }}>{node.name}</span>
      )}
      {node.children.length > 0 && <ul>{renderTree(node.children, depth + 1)}</ul>}
    </li>
  ));

  return (
    <div className={['code-workspace', className].filter(Boolean).join(' ')}>
      <aside className="code-workspace-files">
        <ul>{renderTree(tree)}</ul>
      </aside>
      {activeFile && (editable ? (
        <CodeEditor
          key={activeFile.path}
          label={activeFile.path}
          language={getCodeLanguage(activeFile.path)}
          onChange={content => onChange && onChange(activeFile.path, content)}
          value={activeFile.content}
        />
      ) : (
        <section className="code-workspace-viewer">
          <strong>{activeFile.path}</strong>
          <CodeBlock code={activeFile.content} language={getCodeLanguage(activeFile.path)} />
        </section>
      ))}
    </div>
  );
}
