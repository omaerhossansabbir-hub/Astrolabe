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
  UserCheck,
  Loader2,
  Search,
  X,
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
  isDesktopOpen: boolean;
  onToggleDesktop: () => void;
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
  isDesktopOpen,
  onToggleDesktop,
}) => {
  const {
    user,
    isSigningIn,
    signInError,
    unauthorizedDomainHost,
    clearSignInError,
    signInWithGoogle,
    signInAsGuest,
    signOut,
    openAuthModal,
  } = useAuth();
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
        .map((m) => `### ${m.role === 'user' ? 'User' : 'Astrolabe AI'}\n${m.content}\n`)
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
  const sevenDays = 7 * oneDay;
  const todayChats = recentChats.filter((c) => now - c.updatedAt < oneDay);
  const weekChats = recentChats.filter(
    (c) => now - c.updatedAt >= oneDay && now - c.updatedAt < sevenDays
  );
  const olderChats = recentChats.filter((c) => now - c.updatedAt >= sevenDays);

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
        className={`fixed lg:static inset-y-0 left-0 z-50 flex flex-col bg-[#FAFAFA] dark:bg-[#09090B] border-r border-zinc-200 dark:border-zinc-800/80 transition-all duration-300 ease-in-out overflow-hidden ${
          isOpen ? 'translate-x-0 w-[280px]' : '-translate-x-full w-[280px]'
        } ${isDesktopOpen ? 'lg:translate-x-0 lg:w-[280px]' : 'lg:translate-x-0 lg:w-0 lg:border-r-0'}`}
      >
        <div className="flex flex-col h-full w-[280px]">
          {/* Top Brand Header */}
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-zinc-200 dark:border-zinc-800/80">
            <AstrolabeLogo size={28} showText={true} />

            <button
              onClick={() => {
                onClose();
                if (window.innerWidth >= 1024) onToggleDesktop();
              }}
              className="p-1.5 rounded-lg text-zinc-500 hover:text-black dark:hover:text-white hover:bg-zinc-200/60 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              title="Collapse sidebar"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          </div>

          {/* Primary Action & Search (ChatGPT / Claude pattern) */}
          <div className="p-3 space-y-2">
            <button
              onClick={onNewChat}
              className="group w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 font-medium text-sm shadow-xs transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span className="font-semibold tracking-tight text-[13px]">New chat</span>
              </div>
              <span className="text-[11px] font-mono-astrolabe text-zinc-400 dark:text-zinc-600 px-1.5 py-0.5 rounded bg-white/10 dark:bg-black/10">
                ⌘K
              </span>
            </button>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search chats..."
                className="w-full pl-8 pr-7 py-1.5 text-xs rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-950 dark:text-white placeholder-zinc-400 outline-none focus:border-black dark:focus:border-white transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Scrollable Center: Projects & History */}
          <div className="flex-1 overflow-y-auto px-3 space-y-5 text-xs pb-3">
            {/* Projects Section (Real User Projects Only) */}
            <div className="space-y-1">
              <div className="flex items-center justify-between px-2 py-1">
                <button
                  onClick={() => setProjectsExpanded(!projectsExpanded)}
                  className="flex items-center gap-1.5 font-semibold text-[11px] uppercase tracking-wider text-zinc-500 hover:text-black dark:hover:text-white cursor-pointer"
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
                  className="p-1 rounded hover:bg-zinc-200/70 dark:hover:bg-zinc-800 text-zinc-500 hover:text-black dark:hover:text-white cursor-pointer"
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
                      className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-zinc-500 hover:bg-zinc-200/60 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                    >
                      <span>Show all chats</span>
                      <span className="text-[10px]">✕ Clear</span>
                    </button>
                  )}

                  {projects.length === 0 ? (
                    <button
                      onClick={() => onOpenProjectModal()}
                      className="w-full text-left px-2.5 py-2 rounded-lg text-[11px] text-zinc-500 hover:text-black dark:hover:text-white hover:bg-zinc-200/50 dark:hover:bg-zinc-800/60 border border-dashed border-zinc-200 dark:border-zinc-800 transition-colors cursor-pointer"
                    >
                      + Create your first project
                    </button>
                  ) : (
                    projects.map((proj) => {
                      const isSelected = activeProjectId === proj.id;
                      return (
                        <div
                          key={proj.id}
                          onClick={() => onSelectProject(isSelected ? null : proj.id)}
                          className={`group flex items-center justify-between px-2.5 py-2 rounded-lg text-xs transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-zinc-200/80 dark:bg-zinc-800 text-black dark:text-white font-medium'
                              : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <div
                              className="w-2 h-2 rounded-full shrink-0 border border-zinc-400/40"
                              style={{ backgroundColor: proj.color || '#09090B' }}
                            />
                            <span className="truncate">{proj.name}</span>
                          </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenProjectModal(proj);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1 text-zinc-400 hover:text-black dark:hover:text-white transition-opacity cursor-pointer"
                            title="Edit Project"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>

            {/* Pinned Chats */}
            {pinnedChats.length > 0 && (
              <div className="space-y-1">
                <div className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                  <Pin className="w-3 h-3 text-zinc-700 dark:text-zinc-300" />
                  <span>Pinned</span>
                </div>
                <div className="space-y-0.5">{pinnedChats.map((chat) => renderChatItem(chat))}</div>
              </div>
            )}

            {/* Today's Chats */}
            {todayChats.length > 0 && (
              <div className="space-y-1">
                <div className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                  Today
                </div>
                <div className="space-y-0.5">{todayChats.map((chat) => renderChatItem(chat))}</div>
              </div>
            )}

            {/* Previous 7 Days */}
            {weekChats.length > 0 && (
              <div className="space-y-1">
                <div className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                  Previous 7 Days
                </div>
                <div className="space-y-0.5">{weekChats.map((chat) => renderChatItem(chat))}</div>
              </div>
            )}

            {/* Older Chats */}
            {olderChats.length > 0 && (
              <div className="space-y-1">
                <div className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                  Older
                </div>
                <div className="space-y-0.5">{olderChats.map((chat) => renderChatItem(chat))}</div>
              </div>
            )}

            {filteredChats.length === 0 && (
              <div className="px-3 py-6 text-center text-xs text-zinc-500">
                <p>{searchQuery ? 'No matching conversations' : 'No conversations yet'}</p>
                {!searchQuery && (
                  <button
                    onClick={onNewChat}
                    className="mt-2 text-black dark:text-white font-medium hover:underline cursor-pointer"
                  >
                    Start a new chat
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Bottom Profile & Auth Bar */}
          <div className="p-3 border-t border-zinc-200 dark:border-zinc-800/80 bg-zinc-50 dark:bg-zinc-900/40 space-y-2">
            {user ? (
              <div className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs">
                <div className="flex items-center gap-2.5 min-w-0 pr-1">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'User'}
                      className="w-7 h-7 rounded-full object-cover shrink-0 grayscale"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-black text-white dark:bg-white dark:text-black flex items-center justify-center text-xs font-bold shrink-0">
                      {(user.displayName || user.email || 'A')[0].toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-zinc-950 dark:text-white truncate">
                      {user.displayName || 'Astrolabe User'}
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-zinc-500 font-medium">
                      <ShieldCheck className="w-3 h-3 text-zinc-700 dark:text-zinc-300" />
                      <span>{user.isAnonymous ? 'Guest Profile' : 'Synced Account'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-0.5 shrink-0">
                  <button
                    onClick={onOpenSettings}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                    title="Settings"
                  >
                    <Settings className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={signOut}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                    title="Sign Out"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {signInError && (
                  <div className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs space-y-1.5">
                    <div className="flex items-start justify-between gap-1 text-[11px] text-zinc-700 dark:text-zinc-300 leading-snug">
                      <span>{signInError}</span>
                      <button
                        onClick={clearSignInError}
                        className="p-0.5 text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>
                    {unauthorizedDomainHost && (
                      <button
                        onClick={openAuthModal}
                        className="w-full py-1.5 px-2 bg-zinc-200 dark:bg-zinc-700 text-zinc-950 dark:text-white rounded-lg font-semibold text-[11px] hover:opacity-90 cursor-pointer"
                      >
                        ডোমেইন সেটিংস দেখুন ({unauthorizedDomainHost})
                      </button>
                    )}
                    <button
                      onClick={() => signInAsGuest('অ্যাস্ট্রো ইউজার')}
                      className="w-full py-1.5 px-2 bg-black dark:bg-white text-white dark:text-black rounded-lg font-semibold text-[11px] hover:opacity-90 cursor-pointer"
                    >
                      সরাসরি গেস্ট হিসেবে চালান
                    </button>
                  </div>
                )}

                <button
                  onClick={openAuthModal}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-black dark:bg-white text-white dark:text-black text-xs font-semibold shadow-xs hover:opacity-90 transition-all cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>সাইন ইন / অ্যাকাউন্ট খুলুন</span>
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={signInWithGoogle}
                    disabled={isSigningIn}
                    className="flex-1 flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-[11px] font-medium text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800 cursor-pointer transition-colors disabled:opacity-50"
                    title="Sign in with Google"
                  >
                    {isSigningIn ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <span className="font-bold text-xs">G</span>
                    )}
                    <span>Google</span>
                  </button>

                  <button
                    onClick={() => signInAsGuest('অ্যাস্ট্রো গেস্ট')}
                    className="flex-1 flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg bg-transparent hover:bg-zinc-200 dark:hover:bg-zinc-800 text-[11px] font-medium text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 cursor-pointer transition-colors"
                    title="গেস্ট প্রোফাইল দিয়ে শুরু করুন"
                  >
                    <UserCheck className="w-3 h-3 text-zinc-700 dark:text-zinc-300" />
                    <span>গেস্ট</span>
                  </button>

                  <button
                    onClick={onOpenSettings}
                    className="p-1.5 rounded-lg text-zinc-500 hover:text-black dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors cursor-pointer border border-zinc-200 dark:border-zinc-800"
                    title="Settings"
                  >
                    <Settings className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
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
            ? 'bg-white dark:bg-zinc-800 text-black dark:text-white font-medium shadow-2xs border border-zinc-200 dark:border-zinc-700'
            : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50'
        }`}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1 pr-2">
          <MessageSquare
            className={`w-3.5 h-3.5 shrink-0 ${
              isActive ? 'text-black dark:text-white' : 'text-zinc-400'
            }`}
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
              className="w-full bg-white dark:bg-zinc-900 text-xs px-1.5 py-0.5 rounded border border-black dark:border-white outline-none"
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
              className={`p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 cursor-pointer ${
                chat.isPinned ? 'text-black dark:text-white' : 'text-zinc-400'
              }`}
              title={chat.isPinned ? 'Unpin' : 'Pin chat'}
            >
              <Pin className="w-3 h-3" />
            </button>
            <button
              onClick={(e) => handleStartRename(chat, e)}
              className="p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer"
              title="Rename"
            >
              <Edit2 className="w-3 h-3" />
            </button>
            <button
              onClick={(e) => handleExportChat(chat, e)}
              className="p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer"
              title="Export Markdown"
            >
              <Download className="w-3 h-3" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteChat(chat.id);
              }}
              className="p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer"
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
