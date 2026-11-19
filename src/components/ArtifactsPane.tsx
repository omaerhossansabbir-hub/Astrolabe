import React, { useState, useEffect } from 'react';
import {
  X,
  Code2,
  Eye,
  Copy,
  Check,
  Download,
  Maximize2,
  Minimize2,
  RotateCcw,
  Smartphone,
  Tablet,
  Monitor,
  ExternalLink,
  Layers,
  GitFork,
  Play,
  FileCode,
} from 'lucide-react';
import { AstrolabeArtifact } from '../types';
import { buildIframeContent } from '../utils/artifactParser';

interface ArtifactsPaneProps {
  artifact: AstrolabeArtifact | null;
  onClose: () => void;
  onUpdateArtifact?: (updated: AstrolabeArtifact) => void;
  isOpen: boolean;
}

export const ArtifactsPane: React.FC<ArtifactsPaneProps> = ({
  artifact,
  onClose,
  onUpdateArtifact,
  isOpen,
}) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [deviceView, setDeviceView] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [iframeKey, setIframeKey] = useState(0);

  const [editableCode, setEditableCode] = useState('');
  const [isModified, setIsModified] = useState(false);

  useEffect(() => {
    setIframeKey((k) => k + 1);
    if (artifact) {
      setEditableCode(artifact.content);
      setIsModified(false);
      if (['html', 'svg', 'mermaid'].includes(artifact.language.toLowerCase())) {
        setActiveTab('preview');
      } else {
        setActiveTab('code');
      }
    }
  }, [artifact?.id, artifact?.content]);

  if (!isOpen || !artifact) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(editableCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApplyChanges = () => {
    if (!artifact) return;
    const updated: AstrolabeArtifact = {
      ...artifact,
      content: editableCode,
      version: (artifact.version || 1) + 1,
    };
    if (onUpdateArtifact) {
      onUpdateArtifact(updated);
    }
    setIframeKey((k) => k + 1);
    setIsModified(false);
    setActiveTab('preview');
  };

  const handleDownload = () => {
    const extMap: Record<string, string> = {
      html: 'html',
      svg: 'svg',
      mermaid: 'mmd',
      javascript: 'js',
      jsx: 'jsx',
      python: 'py',
      css: 'css',
      markdown: 'md',
    };
    const ext = extMap[artifact.language.toLowerCase()] || 'txt';
    const blob = new Blob([editableCode], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${artifact.title.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'astrolabe-artifact'}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleOpenRawWindow = () => {
    const currentArtifact: AstrolabeArtifact = { ...artifact, content: editableCode };
    const blob = new Blob([buildIframeContent(currentArtifact)], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  const lines = editableCode.split('\n');

  return (
    <aside
      className={`fixed lg:relative inset-y-0 right-0 z-40 flex flex-col bg-white dark:bg-[#0E0E11] border-l border-zinc-200 dark:border-zinc-800 shadow-2xl lg:shadow-none transition-all duration-300 ease-in-out ${
        isFullscreen
          ? 'fixed inset-0 z-50 w-screen h-screen'
          : 'w-full lg:w-[48%] xl:w-[50%] 2xl:w-[52%] h-full'
      }`}
    >
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <div className="flex items-center gap-2.5 min-w-0 pr-2">
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-950 dark:text-white shrink-0">
            {artifact.language === 'svg' ? (
              <Layers className="w-4 h-4" />
            ) : artifact.language === 'mermaid' ? (
              <GitFork className="w-4 h-4" />
            ) : (
              <Code2 className="w-4 h-4" />
            )}
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-zinc-950 dark:text-white truncate">
              {artifact.title || 'Astrolabe Artifact'}
            </h2>
            <div className="flex items-center gap-2 text-[11px] text-zinc-500">
              <span className="uppercase font-mono-astrolabe tracking-wider font-semibold text-zinc-900 dark:text-zinc-100">
                {artifact.language}
              </span>
              <span>•</span>
              <span>v{artifact.version || 1}</span>
              <span>•</span>
              <span>{lines.length} lines</span>
              {isModified && (
                <span className="text-[10px] text-zinc-900 dark:text-white font-semibold">• Edited</span>
              )}
            </div>
          </div>
        </div>

        {/* Center: Preview vs Code segmented control */}
        <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 p-0.5 rounded-lg border border-zinc-200 dark:border-zinc-700 shrink-0">
          <button
            onClick={() => setActiveTab('preview')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
              activeTab === 'preview'
                ? 'bg-white dark:bg-zinc-950 text-black dark:text-white shadow-xs'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Preview</span>
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
              activeTab === 'code'
                ? 'bg-white dark:bg-zinc-950 text-black dark:text-white shadow-xs'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>Code</span>
          </button>
        </div>

        {/* Right Toolbar Actions */}
        <div className="flex items-center gap-1 shrink-0">
          {isModified && (
            <button
              onClick={handleApplyChanges}
              className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-black dark:bg-white text-white dark:text-black hover:opacity-90 transition-colors cursor-pointer shadow-xs"
              title="Run and apply modified code"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>Run</span>
            </button>
          )}

          {activeTab === 'preview' && (
            <button
              onClick={() => setIframeKey((k) => k + 1)}
              className="p-1.5 rounded-md text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
              title="Reload preview"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={handleCopyCode}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            title="Copy source code"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-black dark:text-white" />
                <span className="text-black dark:text-white">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Copy</span>
              </>
            )}
          </button>

          <button
            onClick={handleDownload}
            className="p-1.5 rounded-md text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
            title="Download file"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            onClick={handleOpenRawWindow}
            className="hidden sm:flex p-1.5 rounded-md text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
            title="Open preview in new tab"
          >
            <ExternalLink className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-md text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
            title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </button>

          <div className="w-[1px] h-4 bg-zinc-200 dark:bg-zinc-800 mx-1" />

          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
            title="Close Artifacts panel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Sub-bar for Responsive Viewport switcher */}
      {activeTab === 'preview' && (
        <div className="flex items-center justify-between px-4 py-1.5 bg-zinc-50 dark:bg-zinc-900/60 border-b border-zinc-200 dark:border-zinc-800 text-xs text-zinc-500">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400">
              Astrolabe Sandbox
            </span>
            <span className="text-[11px] font-mono-astrolabe text-zinc-900 dark:text-zinc-100">
              • Live
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setDeviceView('desktop')}
              className={`p-1 rounded cursor-pointer ${
                deviceView === 'desktop'
                  ? 'bg-white dark:bg-zinc-800 text-black dark:text-white shadow-xs'
                  : 'hover:text-black dark:hover:text-white text-zinc-400'
              }`}
              title="Desktop view (100%)"
            >
              <Monitor className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setDeviceView('tablet')}
              className={`p-1 rounded cursor-pointer ${
                deviceView === 'tablet'
                  ? 'bg-white dark:bg-zinc-800 text-black dark:text-white shadow-xs'
                  : 'hover:text-black dark:hover:text-white text-zinc-400'
              }`}
              title="Tablet view (768px)"
            >
              <Tablet className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setDeviceView('mobile')}
              className={`p-1 rounded cursor-pointer ${
                deviceView === 'mobile'
                  ? 'bg-white dark:bg-zinc-800 text-black dark:text-white shadow-xs'
                  : 'hover:text-black dark:hover:text-white text-zinc-400'
              }`}
              title="Mobile view (375px)"
            >
              <Smartphone className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 relative overflow-hidden bg-zinc-100 dark:bg-zinc-950">
        {activeTab === 'preview' ? (
          <div className="w-full h-full flex items-center justify-center p-2 lg:p-4 overflow-auto">
            <div
              className={`h-full transition-all duration-200 bg-white dark:bg-zinc-900 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-sm ${
                deviceView === 'desktop'
                  ? 'w-full'
                  : deviceView === 'tablet'
                  ? 'w-[768px]'
                  : 'w-[380px]'
              }`}
            >
              <iframe
                key={iframeKey}
                title={artifact.title}
                srcDoc={buildIframeContent({ ...artifact, content: editableCode })}
                sandbox="allow-scripts allow-forms allow-same-origin allow-modals"
                className="w-full h-full border-none"
              />
            </div>
          </div>
        ) : (
          <div className="w-full h-full flex flex-col bg-zinc-950 text-zinc-100 font-mono-astrolabe text-[13px]">
            <div className="flex items-center justify-between px-4 py-2 bg-zinc-900 border-b border-zinc-800 text-xs text-zinc-400">
              <span className="flex items-center gap-1.5 text-[11px]">
                <FileCode className="w-3.5 h-3.5 text-zinc-300" />
                Interactive Code Editor
              </span>

              {isModified && (
                <button
                  onClick={handleApplyChanges}
                  className="flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold bg-white text-black hover:bg-zinc-200 cursor-pointer shadow-xs"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>Apply & Run</span>
                </button>
              )}
            </div>

            <div className="flex-1 overflow-auto p-4 flex">
              <div className="select-none text-zinc-600 text-right pr-4 border-r border-zinc-800 leading-relaxed">
                {lines.map((_, i) => (
                  <div key={i}>{i + 1}</div>
                ))}
              </div>

              <textarea
                value={editableCode}
                onChange={(e) => {
                  setEditableCode(e.target.value);
                  setIsModified(true);
                }}
                spellCheck={false}
                className="flex-1 pl-4 bg-transparent text-zinc-100 outline-none resize-none font-mono-astrolabe leading-relaxed whitespace-pre overflow-x-auto"
              />
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
