import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, FileText } from 'lucide-react';
import { Project, ProjectFile } from '../types';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project?: Project | null;
  onSaveProject: (project: Project) => void;
  onDeleteProject?: (projectId: string) => void;
}

const PROJECT_COLORS = [
  '#D97706', // Astrolabe Amber
  '#D95D39', // Terracotta
  '#2563EB', // Blue
  '#059669', // Emerald
  '#7C3AED', // Purple
  '#DC2626', // Red
];

export const ProjectModal: React.FC<ProjectModalProps> = ({
  isOpen,
  onClose,
  project,
  onSaveProject,
  onDeleteProject,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [customInstructions, setCustomInstructions] = useState('');
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [selectedColor, setSelectedColor] = useState(PROJECT_COLORS[0]);
  const [newFileName, setNewFileName] = useState('');
  const [newFileContent, setNewFileContent] = useState('');
  const [showAddFile, setShowAddFile] = useState(false);

  useEffect(() => {
    if (project) {
      setName(project.name);
      setDescription(project.description);
      setCustomInstructions(project.customInstructions);
      setFiles(project.files || []);
      setSelectedColor(project.color || PROJECT_COLORS[0]);
    } else {
      setName('');
      setDescription('');
      setCustomInstructions('');
      setFiles([]);
      setSelectedColor(PROJECT_COLORS[0]);
    }
    setShowAddFile(false);
  }, [project, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!name.trim()) return;

    const savedProject: Project = {
      id: project ? project.id : `proj-${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      customInstructions: customInstructions.trim(),
      files,
      color: selectedColor,
      createdAt: project ? project.createdAt : Date.now(),
    };

    onSaveProject(savedProject);
    onClose();
  };

  const handleAddKnowledgeFile = () => {
    if (!newFileName.trim() || !newFileContent.trim()) return;
    const newFile: ProjectFile = {
      id: `file-${Date.now()}`,
      name: newFileName.trim(),
      content: newFileContent.trim(),
      size: newFileContent.length,
    };
    setFiles([...files, newFile]);
    setNewFileName('');
    setNewFileContent('');
    setShowAddFile(false);
  };

  const handleDeleteFile = (id: string) => {
    setFiles(files.filter((f) => f.id !== id));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl max-h-[90vh] flex flex-col bg-white dark:bg-[#0E0E11] rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div
              className="w-3.5 h-3.5 rounded-full"
              style={{ backgroundColor: selectedColor }}
            />
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              {project ? 'Edit Project' : 'Create New Project'}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-sm">
          {/* Project Name */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5">
              Project Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Bengali Philosophy, React Architecture"
              className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 outline-none focus:border-zinc-950 dark:focus:border-white"
            />
          </div>

          {/* Color Tag */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5">
              Project Color Accent
            </label>
            <div className="flex items-center gap-3">
              {PROJECT_COLORS.map((col) => (
                <button
                  key={col}
                  type="button"
                  onClick={() => setSelectedColor(col)}
                  className={`w-6 h-6 rounded-full transition-transform cursor-pointer ${
                    selectedColor === col ? 'scale-125 ring-2 ring-offset-2 ring-zinc-950 dark:ring-white' : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: col }}
                />
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5">
              Description (Optional)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief summary of what this project focuses on"
              className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 outline-none focus:border-zinc-950 dark:focus:border-white"
            />
          </div>

          {/* Custom Project Instructions */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5">
              Custom Project Instructions
            </label>
            <p className="text-xs text-zinc-500 mb-2">
              Astrolabe will incorporate these instructions in every conversation inside this project.
            </p>
            <textarea
              value={customInstructions}
              onChange={(e) => setCustomInstructions(e.target.value)}
              placeholder="e.g., Always reply in eloquent Bengali. Emphasize historical context and structured poetic critique..."
              rows={3}
              className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 outline-none focus:border-zinc-950 dark:focus:border-white resize-none leading-relaxed text-xs sm:text-sm"
            />
          </div>

          {/* Project Knowledge Files */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                Project Knowledge Base ({files.length})
              </label>
              <button
                type="button"
                onClick={() => setShowAddFile(!showAddFile)}
                className="flex items-center gap-1 text-xs text-zinc-900 dark:text-zinc-100 hover:underline cursor-pointer font-medium"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Doc</span>
              </button>
            </div>

            <div className="space-y-1.5 mb-3">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs"
                >
                  <div className="flex items-center gap-2 truncate pr-2">
                    <FileText className="w-3.5 h-3.5 text-zinc-700 dark:text-zinc-300 shrink-0" />
                    <span className="font-medium truncate text-zinc-900 dark:text-zinc-100">{file.name}</span>
                  </div>
                  <button
                    onClick={() => handleDeleteFile(file.id)}
                    className="p-1 text-zinc-400 hover:text-red-500 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {showAddFile && (
              <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2.5 animate-in fade-in duration-150">
                <input
                  type="text"
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  placeholder="Document Title (e.g., guidelines.md)"
                  className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs outline-none focus:border-zinc-950 dark:focus:border-white"
                />
                <textarea
                  value={newFileContent}
                  onChange={(e) => setNewFileContent(e.target.value)}
                  placeholder="Paste context, guidelines, reference code or text here..."
                  rows={3}
                  className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs outline-none focus:border-zinc-950 dark:focus:border-white resize-none"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddFile(false)}
                    className="px-2.5 py-1 text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleAddKnowledgeFile}
                    className="px-3 py-1 text-xs rounded-lg bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 font-medium cursor-pointer"
                  >
                    Save File
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
          {project && onDeleteProject ? (
            <button
              type="button"
              onClick={() => {
                onDeleteProject(project.id);
                onClose();
              }}
              className="text-xs text-red-600 hover:text-red-700 font-medium cursor-pointer"
            >
              Delete Project
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!name.trim()}
              className="px-5 py-2 rounded-xl bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-xs font-semibold shadow-xs disabled:opacity-50 cursor-pointer"
            >
              {project ? 'Update Project' : 'Create Project'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
