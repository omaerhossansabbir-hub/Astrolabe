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

export default function App() {
  const { user } = useAuth();

  const [chats, setChats] = useState<ChatSession[]>(() => getSavedChats());
  const [activeChatId, setActiveChatId] = useState<string | null>(() => getActiveChatId());
  const [projects, setProjects] = useState<Project[]>(() => getSavedProjects());
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [settings, setSettings] = useState<UserSettings>(() => getSavedSettings());

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState<AstrolabeModel>(settings.defaultModel);
  const [responseStyle, setResponseStyle] = useState<ResponseStyle>(settings.responseStyle || 'default');
  const [enableThinking, setEnableThinking] = useState(settings.enableThinking);

  // Artifacts state
  const [activeArtifact, setActiveArtifact] = useState<AstrolabeArtifact | null>(null);
  const [isArtifactsOpen, setIsArtifactsOpen] = useState(false);

  // Streaming & abort controller
  const [isStreaming, setIsStreaming] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Modals
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Real-time Cloud Synchronization when user is logged in
  useEffect(() => {
    if (!user) return;

    syncUserProfile(user);

    const unsubChats = subscribeToUserChats(user.uid, (cloudChats) => {
      if (cloudChats.length > 0) {
        setChats(cloudChats);
      }
    });

    const unsubProjects = subscribeToUserProjects(user.uid, (cloudProjects) => {
      if (cloudProjects.length > 0) {
        setProjects(cloudProjects);
      }
    });

    return () => {
      unsubChats();
      unsubProjects();
    };
  }, [user]);

  // Save to localStorage as well for offline/guest resiliency
  useEffect(() => {
    saveChats(chats);
  }, [chats]);

  useEffect(() => {
    saveProjects(projects);
  }, [projects]);

  useEffect(() => {
    saveSettings(settings);
    const isDark =
      settings.theme === 'dark' ||
      (settings.theme === 'system' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings]);

  // Find active chat
  const currentChat = chats.find((c) => c.id === activeChatId) || null;

  // Sync active chat model
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
    }
  }, [activeChatId]);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (currentChat && currentChat.messages.length > 0) {
      scrollToBottom();
    }
  }, [currentChat?.messages.length, isStreaming]);

  // Keyboard shortcut: Cmd+K / Ctrl+K for new chat
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

  // Create new chat
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
    setChats([newChat, ...chats]);
    setActiveChatId(newChat.id);
    setActiveArtifact(null);
    setIsArtifactsOpen(false);

    if (user) {
      saveChatToCloud(user.uid, newChat);
    }
  };

  // Delete chat
  const handleDeleteChat = (id: string) => {
    const updated = chats.filter((c) => c.id !== id);
    setChats(updated);
    if (activeChatId === id) {
      const nextId = updated.length > 0 ? updated[0].id : null;
      setActiveChatId(nextId);
      if (!nextId) {
        handleCreateNewChat();
      }
    }

    if (user) {
      deleteChatFromCloud(user.uid, id);
    }
  };

  // Rename chat
  const handleRenameChat = (id: string, newTitle: string) => {
    const updated = chats.map((c) =>
      c.id === id ? { ...c, title: newTitle, updatedAt: Date.now() } : c
    );
    setChats(updated);

    const changed = updated.find((c) => c.id === id);
    if (user && changed) {
      saveChatToCloud(user.uid, changed);
    }
  };

  // Toggle Pin chat
  const handleTogglePinChat = (id: string) => {
    const updated = chats.map((c) =>
      c.id === id ? { ...c, isPinned: !c.isPinned, updatedAt: Date.now() } : c
    );
    setChats(updated);

    const changed = updated.find((c) => c.id === id);
    if (user && changed) {
      saveChatToCloud(user.uid, changed);
    }
  };

  // Stop streaming
  const handleStopStreaming = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
  };

  // Send message
  const handleSendMessage = async (
    text: string,
    attachments: FileAttachment[] = []
  ) => {
    if (!text && attachments.length === 0) return;

    let targetChat = currentChat;

    if (!targetChat) {
      targetChat = {
        id: `chat-${Date.now()}`,
        title: text.slice(0, 35) || 'New chat',
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

    // Dynamic inactivity timer: resets whenever incoming tokens arrive so long outputs never get cut off
    let activityTimeout: any = null;
    const resetActivityTimer = () => {
      if (activityTimeout) clearTimeout(activityTimeout);
      activityTimeout = setTimeout(() => {
        if (abortControllerRef.current) {
          console.warn('Astrolabe client stream inactivity timeout');
          abortControllerRef.current.abort();
        }
      }, 60000); // 60 seconds of complete silence before aborting
    };
    resetActivityTimer();

    let streamErrorMessage: string | null = null;
    let rawAccumulated = '';

    try {
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
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
                if (data.text) {
                  rawAccumulated += data.text;
                  const now = Date.now();

                  // High-frequency responsive throttle for ultra-smooth typing
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

      // Final pass on stream completion
      const totalThinkingTime = (Date.now() - startTime) / 1000;
      const finalParsed = parseAstrolabeResponse(rawAccumulated, assistantMessageId);

      const hasContent = (finalParsed.cleanedText || rawAccumulated).trim().length > 0;

      const finalMessages = updatedMessages.map((m) => {
        if (m.id !== assistantMessageId) return m;
        return {
          ...m,
          content: hasContent
            ? finalParsed.cleanedText || rawAccumulated
            : 'অ্যাস্ট্রো ল্যাব সর্বদা সক্রিয়। অনুগ্রহ করে আবার প্রশ্ন করুন।',
          thinking: finalParsed.thinking,
          thinkingTime: finalParsed.thinking ? totalThinkingTime : undefined,
          artifact: finalParsed.artifact,
          status: hasContent ? ('done' as const) : ('error' as const),
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

      if (user) {
        saveChatToCloud(user.uid, finalChatState);
      }

      if (finalParsed.artifact) {
        setActiveArtifact(finalParsed.artifact);
        setIsArtifactsOpen(true);
      }
    } catch (err: any) {
      console.warn('Stream ended or handled:', err?.message || err);
      // If we already accumulated content, don't show an error card!
      if (rawAccumulated.trim().length > 15) {
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
                  content: parsed.cleanedText || rawAccumulated,
                  thinking: parsed.thinking,
                  artifact: parsed.artifact,
                  status: 'done' as const,
                };
              }),
            };
          })
        );
      } else {
        setChats((prev) =>
          prev.map((c) => {
            if (c.id !== targetChat!.id) return c;
            return {
              ...c,
              messages: c.messages.map((m) => {
                if (m.id !== assistantMessageId) return m;
                return {
                  ...m,
                  content:
                    'অ্যাস্ট্রো ল্যাব সক্রিয় রয়েছে। অনুগ্রহ করে নিচে "আবার চেষ্টা করুন" এ চাপুন।',
                  status: 'error',
                };
              }),
            };
          })
        );
      }
    } finally {
      if (activityTimeout) clearTimeout(activityTimeout);
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  };

  // Retry previous assistant message
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

  // Open Artifact
  const handleOpenArtifact = (art: AstrolabeArtifact) => {
    setActiveArtifact(art);
    setIsArtifactsOpen(true);
  };

  // Save project
  const handleSaveProject = (savedProject: Project) => {
    const exists = projects.some((p) => p.id === savedProject.id);
    const updated = exists
      ? projects.map((p) => (p.id === savedProject.id ? savedProject : p))
      : [...projects, savedProject];

    setProjects(updated);
    setActiveProjectId(savedProject.id);

    if (user) {
      saveProjectToCloud(user.uid, savedProject);
    }
  };

  const handleDeleteProject = (projectId: string) => {
    setProjects(projects.filter((p) => p.id !== projectId));
    if (activeProjectId === projectId) {
      setActiveProjectId(null);
    }
    if (user) {
      deleteProjectFromCloud(user.uid, projectId);
    }
  };

  const activeProject = projects.find((p) => p.id === activeProjectId);
  const currentMessages = currentChat ? currentChat.messages : [];
  const hasMessages = currentMessages.length > 0;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#FAF9F5] dark:bg-[#1C1B1A] text-[#1F1D1A] dark:text-[#EDEAE4]">
      {/* Astrolabe Sidebar with Google Auth */}
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
      />

      {/* Main Chat & Content Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden relative">
        {/* Top Header */}
        <Header
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
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
        />

        {/* Middle Stage: Split between Chat View and Artifacts Side Panel */}
        <div className="flex-1 flex min-h-0 overflow-hidden relative">
          {/* Chat Column */}
          <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
            {/* Scrollable Message List or Welcome Screen */}
            <div className="flex-1 overflow-y-auto">
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

            {/* Bottom Input Area */}
            <ChatInput
              onSendMessage={handleSendMessage}
              isStreaming={isStreaming}
              onStopStreaming={handleStopStreaming}
              enableThinking={enableThinking}
              onToggleThinking={() => setEnableThinking(!enableThinking)}
              defaultLanguage={settings.language}
              placeholder={
                activeProject
                  ? `Message Astrolabe in ${activeProject.name}...`
                  : 'Message Astrolabe (Type or click Voice)...'
              }
            />
          </div>

          {/* Interactive Astrolabe Artifacts Side Panel */}
          <ArtifactsPane
            artifact={activeArtifact}
            isOpen={isArtifactsOpen}
            onClose={() => setIsArtifactsOpen(false)}
            onUpdateArtifact={(updated) => {
              setActiveArtifact(updated);
              // Also update in active chat messages if present
              if (currentChat) {
                const updatedMessages = currentChat.messages.map((m) =>
                  m.artifact?.id === updated.id ? { ...m, artifact: updated } : m
                );
                const updatedChat: ChatSession = { ...currentChat, messages: updatedMessages };
                setChats((prev) => prev.map((c) => (c.id === currentChat.id ? updatedChat : c)));
                if (user) {
                  saveChatToCloud(user.uid, updatedChat);
                }
              }
            }}
          />
        </div>
      </div>

      {/* Project Modal */}
      <ProjectModal
        isOpen={projectModalOpen}
        onClose={() => setProjectModalOpen(false)}
        project={editingProject}
        onSaveProject={handleSaveProject}
        onDeleteProject={handleDeleteProject}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
        settings={settings}
        onSaveSettings={(s) => setSettings(s)}
      />
    </div>
  );
}
