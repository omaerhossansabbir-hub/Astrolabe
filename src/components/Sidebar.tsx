import React, { useState } from 'react';
import {
  MessageSquare,
  Plus,
  Settings,
  Pin,
  Trash2,
  Edit2,
  ChevronDown,
  ChevronRight,
  PanelLeftClose,
  Download,
  FolderPlus,
  LogIn,
  LogOut,
  ShieldCheck,
} from 'lucide-react';
import { ChatSession, Project } from '../types';
import { AstrolabeLogo } from './AstrolabeLogo';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  chats: ChatSession[];
  activeChatId: string | null;
  onSelectChat: (id: string) => void;
  onNewChat: () => void;
  onDeleteChat: (id: string) => void;
  onRenameChat: (id: string, newTitle: string) => void;
  onTogglePinChat: (id: string) => void;
  projects: Project[];
  activeProjectId: string | null;
  onSelectProject: (projectId: string | null) => void;
  onOpenProjectModal: (project?: Project) => void;
  onOpenSettings: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  chats,
  activeChatId,
  onSelectChat,
  onNewChat,
  onDeleteChat,
  onRenameChat,
  onTogglePinChat,
  projects,
  activeProjectId,
  onSelectProject,
  onOpenProjectModal,
  onOpenSettings,
  isOpen,
  onClose,
}) => {
  const { user, signInWithGoogle, signOut } = useAuth();
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [projectsExpanded, setProjectsExpanded] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const handleStartRename = (chat: ChatSession, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingChatId(chat.id);
    setEditingTitle(chat.title);
  };

  const handleSaveRename = (chatId: string) => {
    if (editingTitle.trim()) {
      onRenameChat(chatId, editingTitle.trim());
    }
    setEditingChatId(null);
  };

  const handleExportChat = (chat: ChatSession, e: React.MouseEvent) => {
    e.stopPropagation();
    const markdown =
      `# ${chat.title}\n*Exported from Astrolabe AI on ${new Date(chat.createdAt).toLocaleDateString()}*\n\n` +
      chat.messages
        .map((m) => `### ${m.role === 'user' ? 'User' : 'Astrolabe'}\n${m.content}\n`)
        .join('\n---\n\n');
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${chat.title.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'astrolabe-chat'}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredChats = chats.filter((c) => {
    if (activeProjectId && c.projectId !== activeProjectId) return false;
    if (searchQuery.trim() && !c.title.toLowerCase().includes(searchQuery.toLowerCase()))
      return false;
    return true;
  });

  const pinnedChats = filteredChats.filter((c) => c.isPinned);
  const recentChats = filteredChats.filter((c) => !c.isPinned);

  const now = Date.now();
  const oneDay = 24 * 60 * 60 * 1000;
  const todayChats = recentChats.filter((c) => now - c.updatedAt < oneDay);
  const previousChats = recentChats.filter((c) => now - c.updatedAt >= oneDay);

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs lg:hidden transition-opacity"
        />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 flex flex-col w-[280px] bg-[#F4F0E8] dark:bg-[#151413] border-r border-[#E8E2D7] dark:border-[#2C2A27] transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-[#E8E2D7] dark:border-[#2A2926]">
          <AstrolabeLogo size={28} showText={true} />

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#635F59] dark:text-[#A8A39A] hover:bg-[#EAE4D9] dark:hover:bg-[#252422] transition-colors cursor-pointer"
            title="Collapse sidebar"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        </div>

        {/* New Chat Primary Button */}
        <div className="p-3">
          <button
            onClick={onNewChat}
            className="group w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#232220] hover:bg-[#FAF9F5] dark:hover:bg-[#2C2A28] border border-[#E2DCD2] dark:border-[#383531] text-[#1F1D1A] dark:text-[#EDEAE4] font-medium text-sm shadow-xs transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-[#D95D39]/10 text-[#D95D39] group-hover:scale-105 transition-transform">
                <Plus className="w-4 h-4" />
              </div>
              <span className="font-serif-castle text-[15px] font-semibold tracking-wide">
                Start new chat
              </span>
            </div>
            <span className="text-[11px] font-mono-castle text-[#99948B] dark:text-[#736E65] bg-[#F4F0E8] dark:bg-[#1E1D1B] px-1.5 py-0.5 rounded border border-[#E2DCD2] dark:border-[#33302B]">
              ⌘K
            </span>
          </button>
        </div>

        {/* Scrollable Center: Projects & History */}
        <div className="flex-1 overflow-y-auto px-3 space-y-4 text-xs">
          {/* Projects Section */}
          <div className="space-y-1">
            <div className="flex items-center justify-between px-2 py-1 text-[#8E8980]">
              <button
                onClick={() => setProjectsExpanded(!projectsExpanded)}
                className="flex items-center gap-1.5 font-semibold text-[11px] uppercase tracking-wider text-[#635F59] dark:text-[#8E8980] hover:text-[#1F1D1A] dark:hover:text-[#EDEAE4] cursor-pointer"
              >
                {projectsExpanded ? (
                  <ChevronDown className="w-3.5 h-3.5" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5" />
                )}
                <span>Projects ({projects.length})</span>
              </button>

              <button
                onClick={() => onOpenProjectModal()}
                className="p-1 rounded hover:bg-[#EAE4D9] dark:hover:bg-[#252422] text-[#635F59] dark:text-[#A8A39A] cursor-pointer"
                title="Create new project"
              >
                <FolderPlus className="w-3.5 h-3.5" />
              </button>
            </div>

            {projectsExpanded && (
              <div className="space-y-0.5 pl-1">
                {activeProjectId && (
                  <button
                    onClick={() => onSelectProject(null)}
                    className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-[#8E8980] hover:bg-[#EAE4D9] dark:hover:bg-[#22211F] transition-colors cursor-pointer"
                  >
                    <span>Show all chats</span>
                    <span className="text-[10px]">✕ Clear</span>
                  </button>
                )}

                {projects.map((proj) => {
                  const isSelected = activeProjectId === proj.id;
                  return (
                    <div
                      key={proj.id}
                      onClick={() => onSelectProject(isSelected ? null : proj.id)}
                      className={`group flex items-center justify-between px-2.5 py-2 rounded-lg text-xs transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-[#EAE4D9] dark:bg-[#282724] text-[#1F1D1A] dark:text-[#EDEAE4] font-medium'
                          : 'text-[#635F59] dark:text-[#A8A39A] hover:bg-[#EDE7DC] dark:hover:bg-[#201F1D]'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: proj.color || '#D95D39' }}
                        />
                        <span className="truncate">{proj.name}</span>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenProjectModal(proj);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:text-[#D95D39] transition-opacity cursor-pointer"
                        title="Edit Project"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Pinned Chats */}
          {pinnedChats.length > 0 && (
            <div className="space-y-1">
              <div className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#8E8980] flex items-center gap-1.5">
                <Pin className="w-3 h-3 text-[#D95D39]" />
                <span>Pinned</span>
              </div>
              <div className="space-y-0.5">
                {pinnedChats.map((chat) => renderChatItem(chat))}
              </div>
            </div>
          )}

          {/* Today's Chats */}
          {todayChats.length > 0 && (
            <div className="space-y-1">
              <div className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#8E8980]">
                Today
              </div>
              <div className="space-y-0.5">
                {todayChats.map((chat) => renderChatItem(chat))}
              </div>
            </div>
          )}

          {/* Previous Chats */}
          {previousChats.length > 0 && (
            <div className="space-y-1">
              <div className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#8E8980]">
                Previous
              </div>
              <div className="space-y-0.5">
                {previousChats.map((chat) => renderChatItem(chat))}
              </div>
            </div>
          )}

          {filteredChats.length === 0 && (
            <div className="px-3 py-6 text-center text-xs text-[#8E8980]">
              <p>No conversations found</p>
              <button
                onClick={onNewChat}
                className="mt-2 text-[#D95D39] hover:underline cursor-pointer"
              >
                Create one now
              </button>
            </div>
          )}
        </div>

        {/* Bottom Profile & Authentication Footer */}
        <div className="p-3 border-t border-[#E8E2D7] dark:border-[#2C2A27] bg-[#EFECE5] dark:bg-[#181716] space-y-2">
          {user ? (
            /* Logged in User Bar */
            <div className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-[#201F1D] border border-[#E2DCD2] dark:border-[#33302B]">
              <div className="flex items-center gap-2.5 min-w-0 pr-1">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-7 h-7 rounded-full object-cover shrink-0"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#D97706] to-[#D95D39] flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {(user.displayName || user.email || 'A')[0].toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-[#1F1D1A] dark:text-[#EDEAE4] truncate">
                    {user.displayName || 'Astrolabe User'}
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Cloud Synced</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-0.5 shrink-0">
                <button
                  onClick={onOpenSettings}
                  className="p-1.5 rounded-lg text-[#8E8980] hover:text-[#1F1D1A] dark:hover:text-[#EDEAE4] hover:bg-[#F2ECE3] dark:hover:bg-[#2B2926] transition-colors cursor-pointer"
                  title="Settings"
                >
                  <Settings className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={signOut}
                  className="p-1.5 rounded-lg text-[#8E8980] hover:text-red-500 hover:bg-[#F2ECE3] dark:hover:bg-[#2B2926] transition-colors cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            /* Guest Sign In Prompt */
            <div className="space-y-1.5">
              <button
                onClick={signInWithGoogle}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-white dark:bg-[#232220] hover:bg-[#FAF9F5] dark:hover:bg-[#2B2926] border border-[#E2DCD2] dark:border-[#383531] text-[#1F1D1A] dark:text-[#EDEAE4] text-xs font-semibold shadow-xs transition-all cursor-pointer"
              >
                {/* Google G Icon */}
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Sign in with Google</span>
              </button>

              <button
                onClick={onOpenSettings}
                className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs text-[#8E8980] hover:text-[#1F1D1A] dark:hover:text-[#EDEAE4] hover:bg-[#EAE4D9] dark:hover:bg-[#201F1D] cursor-pointer"
              >
                <span>Settings & Preferences</span>
                <Settings className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );

  function renderChatItem(chat: ChatSession) {
    const isActive = activeChatId === chat.id;
    const isEditing = editingChatId === chat.id;

    return (
      <div
        key={chat.id}
        onClick={() => onSelectChat(chat.id)}
        className={`group relative flex items-center justify-between px-2.5 py-2 rounded-lg text-xs transition-all cursor-pointer ${
          isActive
            ? 'bg-white dark:bg-[#242321] text-[#1F1D1A] dark:text-[#EDEAE4] font-medium shadow-xs border border-[#E2DCD2]/70 dark:border-[#33302B]'
            : 'text-[#524E48] dark:text-[#A8A39A] hover:bg-[#EAE4D9] dark:hover:bg-[#201F1D]'
        }`}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1 pr-2">
          <MessageSquare
            className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-[#D95D39]' : 'text-[#8E8980]'}`}
          />

          {isEditing ? (
            <input
              type="text"
              value={editingTitle}
              onChange={(e) => setEditingTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveRename(chat.id);
                if (e.key === 'Escape') setEditingChatId(null);
              }}
              onBlur={() => handleSaveRename(chat.id)}
              autoFocus
              className="w-full bg-[#FAF9F5] dark:bg-[#1E1E1E] text-xs px-1.5 py-0.5 rounded border border-[#D95D39] outline-none"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <span className="truncate">{chat.title}</span>
          )}
        </div>

        {!isEditing && (
          <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 shrink-0 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onTogglePinChat(chat.id);
              }}
              className={`p-1 rounded hover:bg-[#DFD8CC] dark:hover:bg-[#2D2C29] cursor-pointer ${
                chat.isPinned ? 'text-[#D95D39]' : 'text-[#8E8980]'
              }`}
              title={chat.isPinned ? 'Unpin' : 'Pin chat'}
            >
              <Pin className="w-3 h-3" />
            </button>
            <button
              onClick={(e) => handleStartRename(chat, e)}
              className="p-1 rounded hover:bg-[#DFD8CC] dark:hover:bg-[#2D2C29] text-[#8E8980] hover:text-[#1F1D1A] cursor-pointer"
              title="Rename"
            >
              <Edit2 className="w-3 h-3" />
            </button>
            <button
              onClick={(e) => handleExportChat(chat, e)}
              className="p-1 rounded hover:bg-[#DFD8CC] dark:hover:bg-[#2D2C29] text-[#8E8980] hover:text-[#1F1D1A] cursor-pointer"
              title="Export Markdown"
            >
              <Download className="w-3 h-3" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteChat(chat.id);
              }}
              className="p-1 rounded hover:bg-[#DFD8CC] dark:hover:bg-[#2D2C29] text-[#8E8980] hover:text-red-500 cursor-pointer"
              title="Delete chat"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    );
  }
};
