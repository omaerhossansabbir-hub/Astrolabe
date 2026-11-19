import React, { useState, useEffect, useRef } from 'react';
import {
  ChatSession,
  Message,
  Project,
  UserSettings,
  AstrolabeArtifact,
  FileAttachment,
  AstrolabeModel,
  ResponseStyle,
  GroundingSource,
} from './types';
import {
  getSavedChats,
  saveChats,
  getSavedProjects,
  saveProjects,
  getSavedSettings,
  saveSettings,
  getActiveChatId,
  setActiveChatId as persistActiveChatId,
} from './utils/storage';
import { parseAstrolabeResponse } from './utils/artifactParser';
import { useAuth } from './context/AuthContext';
import { auth } from './lib/firebase';
import {
  subscribeToUserChats,
  subscribeToUserProjects,
  saveChatToCloud,
  deleteChatFromCloud,
  saveProjectToCloud,
  deleteProjectFromCloud,
  syncUserProfile,
} from './services/firestoreSync';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { WelcomeScreen } from './components/WelcomeScreen';
import { ChatMessage } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import { ArtifactsPane } from './components/ArtifactsPane';
import { ProjectModal } from './components/ProjectModal';
import { SettingsModal } from './components/SettingsModal';
import { AuthModal } from './components/AuthModal';

export default function App() {
  const { user } = useAuth();
  const isCloudAuthenticated = Boolean(
    user && !user.uid.startsWith('guest_') && auth.currentUser?.uid === user.uid
  );

  const [chats, setChats] = useState<ChatSession[]>(() => getSavedChats());
  const [activeChatId, setActiveChatId] = useState<string | null>(() => getActiveChatId());
  const [projects, setProjects] = useState<Project[]>(() => getSavedProjects());
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [settings, setSettings] = useState<UserSettings>(() => getSavedSettings());

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);
  const [selectedModel, setSelectedModel] = useState<AstrolabeModel>(settings.defaultModel);
  const [responseStyle, setResponseStyle] = useState<ResponseStyle>(settings.responseStyle || 'default');
  const [enableThinking, setEnableThinking] = useState(settings.enableThinking);
  const [useSearch, setUseSearch] = useState(false);

  const [activeArtifact, setActiveArtifact] = useState<AstrolabeArtifact | null>(null);
  const [isArtifactsOpen, setIsArtifactsOpen] = useState(false);

  const [isStreaming, setIsStreaming] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sync Firestore chats and projects only when authenticated with Firebase
  useEffect(() => {
    if (!isCloudAuthenticated || !user) return;

    syncUserProfile(user);

    const unsubChats = subscribeToUserChats(user.uid, (cloudChats) => {
      setChats(cloudChats);
    });

    const unsubProjects = subscribeToUserProjects(user.uid, (cloudProjects) => {
      setProjects(cloudProjects);
    });

    return () => {
      unsubChats();
      unsubProjects();
    };
  }, [isCloudAuthenticated, user]);

  useEffect(() => {
    saveChats(chats);
  }, [chats]);

  useEffect(() => {
    saveProjects(projects);
  }, [projects]);

  const isDarkTheme =
    settings.theme === 'dark' ||
    (settings.theme === 'system' &&
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches);

  useEffect(() => {
    saveSettings(settings);
    if (isDarkTheme) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings, isDarkTheme]);

  const currentChat = chats.find((c) => c.id === activeChatId) || null;

  useEffect(() => {
    if (currentChat) {
      setSelectedModel(currentChat.model || settings.defaultModel);
      persistActiveChatId(currentChat.id);

      const chatArtifact = currentChat.messages
        .slice()
        .reverse()
        .find((m) => m.artifact)?.artifact;
      if (chatArtifact && !activeArtifact) {
        setActiveArtifact(chatArtifact);
      }
    } else {
      persistActiveChatId(null);
    }
  }, [activeChatId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (currentChat && currentChat.messages.length > 0) {
      scrollToBottom();
    }
  }, [currentChat?.messages.length, isStreaming]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        handleCreateNewChat();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeProjectId, selectedModel]);

  const handleCreateNewChat = () => {
    const newChat: ChatSession = {
      id: `chat-${Date.now()}`,
      title: 'New chat',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [],
      projectId: activeProjectId || undefined,
      model: selectedModel,
    };
    setChats((prev) => [newChat, ...prev]);
    setActiveChatId(newChat.id);
    setActiveArtifact(null);
    setIsArtifactsOpen(false);

    if (isCloudAuthenticated && user) {
      saveChatToCloud(user.uid, newChat);
    }
  };

  const handleDeleteChat = (id: string) => {
    const updated = chats.filter((c) => c.id !== id);
    setChats(updated);
    if (activeChatId === id) {
      const nextId = updated.length > 0 ? updated[0].id : null;
      setActiveChatId(nextId);
      setActiveArtifact(null);
      setIsArtifactsOpen(false);
    }

    if (isCloudAuthenticated && user) {
      deleteChatFromCloud(user.uid, id);
    }
  };

  const handleRenameChat = (id: string, newTitle: string) => {
    const updated = chats.map((c) =>
      c.id === id ? { ...c, title: newTitle, updatedAt: Date.now() } : c
    );
    setChats(updated);

    const changed = updated.find((c) => c.id === id);
    if (isCloudAuthenticated && user && changed) {
      saveChatToCloud(user.uid, changed);
    }
  };

  const handleTogglePinChat = (id: string) => {
    const updated = chats.map((c) =>
      c.id === id ? { ...c, isPinned: !c.isPinned, updatedAt: Date.now() } : c
    );
    setChats(updated);

    const changed = updated.find((c) => c.id === id);
    if (isCloudAuthenticated && user && changed) {
      saveChatToCloud(user.uid, changed);
    }
  };

  const handleStopStreaming = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
  };

  const handleSendMessage = async (
    text: string,
    attachments: FileAttachment[] = []
  ) => {
    if (!text && attachments.length === 0) return;

    let targetChat = currentChat;

    if (!targetChat) {
      targetChat = {
        id: `chat-${Date.now()}`,
        title: text.slice(0, 42).trim() || 'New chat',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        messages: [],
        projectId: activeProjectId || undefined,
        model: selectedModel,
      };
      setChats((prev) => [targetChat!, ...prev]);
      setActiveChatId(targetChat.id);
    }

    const userMessageId = `msg-${Date.now()}-user`;
    const userMessage: Message = {
      id: userMessageId,
      role: 'user',
      content: text,
      attachments,
      createdAt: Date.now(),
    };

    const assistantMessageId = `msg-${Date.now()}-assistant`;
    const placeholderAssistant: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      status: 'streaming',
      createdAt: Date.now(),
    };

    const isFirstMessage = targetChat.messages.length === 0;
    const newChatTitle = isFirstMessage ? text.slice(0, 42).trim() : targetChat.title;

    const updatedMessages = [...targetChat.messages, userMessage, placeholderAssistant];
    const updatedChat: ChatSession = {
      ...targetChat,
      title: newChatTitle,
      updatedAt: Date.now(),
      messages: updatedMessages,
    };

    setChats((prev) =>
      prev.map((c) => (c.id === targetChat!.id ? updatedChat : c))
    );

    setIsStreaming(true);
    const startTime = Date.now();

    const activeProj = projects.find((p) => p.id === (targetChat?.projectId || activeProjectId));
    let systemInstruction = settings.customSystemPrompt || '';
    if (activeProj?.customInstructions) {
      systemInstruction = `${systemInstruction}\n[Project: ${activeProj.name}]\n${activeProj.customInstructions}`;
    }
    if (activeProj?.files && activeProj.files.length > 0) {
      const fileContext = activeProj.files
        .map((f) => `--- File: ${f.name} ---\n${f.content}`)
        .join('\n\n');
      systemInstruction = `${systemInstruction}\n\n[Project Knowledge Files]:\n${fileContext}`;
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    let activityTimeout: any = null;
    const resetActivityTimer = () => {
      if (activityTimeout) clearTimeout(activityTimeout);
      activityTimeout = setTimeout(() => {
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
      }, 60000);
    };
    resetActivityTimer();

    let streamErrorMessage: string | null = null;
    let rawAccumulated = '';
    let collectedSources: GroundingSource[] = [];

    try {
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: updatedMessages
            .filter((m) => m.id !== assistantMessageId)
            .map((m) => ({
              role: m.role,
              content: m.content,
              attachments: m.attachments,
            })),
          model: selectedModel,
          systemInstruction,
          responseStyle,
          enableThinking,
          useSearch,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder('utf-8');
      let lastRenderTime = 0;

      if (reader) {
        let buffer = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          resetActivityTimer();
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.replace('data: ', '').trim());
                if (data.error) {
                  streamErrorMessage = data.error;
                  break;
                }
                if (Array.isArray(data.sources)) {
                  collectedSources = data.sources;
                }
                if (data.text) {
                  rawAccumulated += data.text;
                  const now = Date.now();

                  if (now - lastRenderTime > 25 || data.text.includes('\n')) {
                    lastRenderTime = now;
                    const parsed = parseAstrolabeResponse(rawAccumulated, assistantMessageId);

                    setChats((prev) =>
                      prev.map((c) => {
                        if (c.id !== targetChat!.id) return c;
                        return {
                          ...c,
                          messages: c.messages.map((m) => {
                            if (m.id !== assistantMessageId) return m;
                            return {
                              ...m,
                              content: parsed.cleanedText,
                              thinking: parsed.thinking,
                              artifact: parsed.artifact,
                              status: 'streaming',
                            };
                          }),
                        };
                      })
                    );

                    if (parsed.artifact && !isArtifactsOpen) {
                      setActiveArtifact(parsed.artifact);
                      setIsArtifactsOpen(true);
                    }
                  }
                }
              } catch (err: any) {
                if (err.name !== 'AbortError') {
                  console.error('Error parsing SSE chunk:', err);
                }
              }
            }
          }

          if (streamErrorMessage) {
            throw new Error(streamErrorMessage);
          }
        }
      }

      const totalThinkingTime = (Date.now() - startTime) / 1000;
      const finalParsed = parseAstrolabeResponse(rawAccumulated, assistantMessageId);
      const finalContent = finalParsed.cleanedText || rawAccumulated;

      if (!finalContent.trim() && !finalParsed.artifact) {
        throw new Error('No response was generated. Please try again.');
      }

      const finalMessages = updatedMessages.map((m) => {
        if (m.id !== assistantMessageId) return m;
        return {
          ...m,
          content: finalContent,
          thinking: finalParsed.thinking,
          thinkingTime: finalParsed.thinking ? totalThinkingTime : undefined,
          artifact: finalParsed.artifact,
          sources: collectedSources.length > 0 ? collectedSources : undefined,
          status: 'done' as const,
        };
      });

      const finalChatState: ChatSession = {
        ...targetChat,
        title: newChatTitle,
        updatedAt: Date.now(),
        messages: finalMessages,
      };

      setChats((prev) =>
        prev.map((c) => (c.id === targetChat!.id ? finalChatState : c))
      );

      if (isCloudAuthenticated && user) {
        saveChatToCloud(user.uid, finalChatState);
      }

      if (finalParsed.artifact) {
        setActiveArtifact(finalParsed.artifact);
        setIsArtifactsOpen(true);
      }
    } catch (err: any) {
      const isAbort = err?.name === 'AbortError';
      if (isAbort && rawAccumulated.trim().length > 0) {
        const parsed = parseAstrolabeResponse(rawAccumulated, assistantMessageId);
        setChats((prev) =>
          prev.map((c) =>
            c.id !== targetChat!.id
              ? c
              : {
                  ...c,
                  messages: c.messages.map((m) =>
                    m.id !== assistantMessageId
                      ? m
                      : {
                          ...m,
                          content: parsed.cleanedText || rawAccumulated,
                          thinking: parsed.thinking,
                          artifact: parsed.artifact,
                          status: 'done' as const,
                        }
                  ),
                }
          )
        );
      } else {
        const errorText = isAbort
          ? 'Generation stopped.'
          : err?.message || 'Unable to generate a response. Please retry.';
        setChats((prev) =>
          prev.map((c) =>
            c.id !== targetChat!.id
              ? c
              : {
                  ...c,
                  messages: c.messages.map((m) =>
                    m.id !== assistantMessageId
                      ? m
                      : {
                          ...m,
                          content: errorText,
                          status: 'error' as const,
                        }
                  ),
                }
          )
        );
      }
    } finally {
      if (activityTimeout) clearTimeout(activityTimeout);
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  };

  const handleRetry = (msgIndex: number) => {
    if (!currentChat || isStreaming) return;
    const prevMessages = currentChat.messages.slice(0, msgIndex);
    const lastUserMsg = prevMessages.filter((m) => m.role === 'user').pop();
    if (!lastUserMsg) return;

    setChats((prev) =>
      prev.map((c) =>
        c.id === currentChat.id ? { ...c, messages: prevMessages } : c
      )
    );

    handleSendMessage(lastUserMsg.content, lastUserMsg.attachments);
  };

  const handleOpenArtifact = (art: AstrolabeArtifact) => {
    setActiveArtifact(art);
    setIsArtifactsOpen(true);
  };

  const handleSaveProject = (savedProject: Project) => {
    const exists = projects.some((p) => p.id === savedProject.id);
    const updated = exists
      ? projects.map((p) => (p.id === savedProject.id ? savedProject : p))
      : [...projects, savedProject];

    setProjects(updated);
    setActiveProjectId(savedProject.id);

    if (isCloudAuthenticated && user) {
      saveProjectToCloud(user.uid, savedProject);
    }
  };

  const handleDeleteProject = (projectId: string) => {
    setProjects(projects.filter((p) => p.id !== projectId));
    if (activeProjectId === projectId) {
      setActiveProjectId(null);
    }
    if (isCloudAuthenticated && user) {
      deleteProjectFromCloud(user.uid, projectId);
    }
  };

  const handleToggleSidebar = () => {
    if (window.innerWidth < 1024) {
      setSidebarOpen(!sidebarOpen);
    } else {
      setDesktopSidebarOpen(!desktopSidebarOpen);
    }
  };

  const activeProject = projects.find((p) => p.id === activeProjectId);
  const currentMessages = currentChat ? currentChat.messages : [];
  const hasMessages = currentMessages.length > 0;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white dark:bg-[#09090B] text-zinc-950 dark:text-zinc-100 font-sans">
      <Sidebar
        chats={chats}
        activeChatId={activeChatId}
        onSelectChat={(id) => {
          setActiveChatId(id);
          setSidebarOpen(false);
        }}
        onNewChat={() => {
          handleCreateNewChat();
          setSidebarOpen(false);
        }}
        onDeleteChat={handleDeleteChat}
        onRenameChat={handleRenameChat}
        onTogglePinChat={handleTogglePinChat}
        projects={projects}
        activeProjectId={activeProjectId}
        onSelectProject={(pId) => setActiveProjectId(pId)}
        onOpenProjectModal={(proj) => {
          setEditingProject(proj || null);
          setProjectModalOpen(true);
        }}
        onOpenSettings={() => setSettingsModalOpen(true)}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isDesktopOpen={desktopSidebarOpen}
        onToggleDesktop={() => setDesktopSidebarOpen(!desktopSidebarOpen)}
      />

      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden relative">
        <Header
          onToggleSidebar={handleToggleSidebar}
          chatTitle={currentChat?.title || 'New chat'}
          selectedModel={selectedModel}
          onSelectModel={setSelectedModel}
          responseStyle={responseStyle}
          onSelectResponseStyle={setResponseStyle}
          activeProject={activeProject}
          hasArtifacts={!!activeArtifact || currentMessages.some((m) => !!m.artifact)}
          isArtifactsOpen={isArtifactsOpen}
          onToggleArtifacts={() => setIsArtifactsOpen(!isArtifactsOpen)}
          onNewChat={handleCreateNewChat}
          isDarkTheme={isDarkTheme}
          onToggleTheme={() =>
            setSettings({ ...settings, theme: isDarkTheme ? 'light' : 'dark' })
          }
        />

        <div className="flex-1 flex min-h-0 overflow-hidden relative">
          <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
            <div className="flex-1 overflow-y-auto flex flex-col">
              {!hasMessages ? (
                <WelcomeScreen
                  onSelectPrompt={(p) => handleSendMessage(p)}
                  userName={user?.displayName ? user.displayName.split(' ')[0] : 'Friend'}
                />
              ) : (
                <div className="py-4">
                  {currentMessages.map((msg, idx) => (
                    <ChatMessage
                      key={msg.id}
                      message={msg}
                      onOpenArtifact={handleOpenArtifact}
                      onRetry={
                        msg.role === 'assistant' && idx === currentMessages.length - 1
                          ? () => handleRetry(idx)
                          : undefined
                      }
                    />
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            <ChatInput
              onSendMessage={handleSendMessage}
              isStreaming={isStreaming}
              onStopStreaming={handleStopStreaming}
              enableThinking={enableThinking}
              onToggleThinking={() => setEnableThinking(!enableThinking)}
              useSearch={useSearch}
              onToggleSearch={() => setUseSearch(!useSearch)}
              defaultLanguage={settings.language}
              placeholder={
                activeProject
                  ? `Message Astrolabe AI in ${activeProject.name}...`
                  : 'Ask Astrolabe AI anything...'
              }
            />
          </div>

          <ArtifactsPane
            artifact={activeArtifact}
            isOpen={isArtifactsOpen}
            onClose={() => setIsArtifactsOpen(false)}
            onUpdateArtifact={(updated) => {
              setActiveArtifact(updated);
              if (currentChat) {
                const updatedMessages = currentChat.messages.map((m) =>
                  m.artifact?.id === updated.id ? { ...m, artifact: updated } : m
                );
                const updatedChat: ChatSession = { ...currentChat, messages: updatedMessages };
                setChats((prev) => prev.map((c) => (c.id === currentChat.id ? updatedChat : c)));
                if (isCloudAuthenticated && user) {
                  saveChatToCloud(user.uid, updatedChat);
                }
              }
            }}
          />
        </div>
      </div>

      <ProjectModal
        isOpen={projectModalOpen}
        onClose={() => setProjectModalOpen(false)}
        project={editingProject}
        onSaveProject={handleSaveProject}
        onDeleteProject={handleDeleteProject}
      />

      <SettingsModal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
        settings={settings}
        onSaveSettings={(s) => setSettings(s)}
      />

      <AuthModal />
    </div>
  );
}
