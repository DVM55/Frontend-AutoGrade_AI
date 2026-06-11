import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { toast } from "react-toastify";
import { getClasses } from "../../service/class.service";
import {
  createChatConversation,
  deleteChatConversation,
  getChatConversations,
  getChatMessages,
  sendChatMessage,
} from "../../service/chat.service";

const toText = (value) => {
  if (typeof value === "string") return value;
  if (value == null) return "";
  return JSON.stringify(value);
};

const formatDateTime = (value) => {
  if (!value) return "";
  return new Date(value).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const sortByUpdatedAt = (items) =>
  [...items].sort(
    (a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0),
  );

const isUserMessage = (message) =>
  String(message?.role || "").toUpperCase() === "USER";

const renderRichText = (value) => {
  return toText(value)
    .split(/(\*\*[^*]+\*\*)/g)
    .map((part, index) =>
      part.startsWith("**") && part.endsWith("**") ? (
        <strong key={index}>{part.slice(2, -2)}</strong>
      ) : (
        part
      ),
    );
};

const MessageBubble = ({ message }) => {
  const isUser = isUserMessage(message);

  return (
    <div className={`chat-msg ${isUser ? "chat-msg--user" : "chat-msg--bot"}`}>
      <div className="chat-msg__content">
        <div className="chat-bubble">
          {isUser ? toText(message.content) : renderRichText(message.content)}
        </div>
      </div>
    </div>
  );
};

const Chat = () => {
  const [classes, setClasses] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [search, setSearch] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [selectedClassId, setSelectedClassId] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [loadingConversations, setLoadingConversations] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [creating, setCreating] = useState(false);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);
  const messageRequestRef = useRef(0);

  const classMap = useMemo(() => {
    return classes.reduce((acc, item) => {
      acc[item.id] = item;
      return acc;
    }, {});
  }, [classes]);

  const availableClasses = useMemo(
    () =>
      classes.filter(
        (item) => !item.joinStatus || item.joinStatus === "JOINED",
      ),
    [classes],
  );

  const activeConversation = useMemo(
    () =>
      conversations.find(
        (item) => item.conversationId === activeId,
      ) || null,
    [activeId, conversations],
  );

  const filteredConversations = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return conversations;

    return conversations.filter((item) => {
      const classTitle = classMap[item.classId]?.title || "";
      return `${item.title || ""} ${classTitle} ${item.classId}`
        .toLowerCase()
        .includes(keyword);
    });
  }, [classMap, conversations, search]);

  const getClassTitle = useCallback(
    (classId) => classMap[classId]?.title || `Lớp #${classId}`,
    [classMap],
  );

  const loadClasses = useCallback(async () => {
    try {
      setLoadingClasses(true);
      const res = await getClasses({ page: 0, size: 100 });
      const data = res.data || [];
      setClasses(data);

      const firstJoinedClass = data.find(
        (item) => !item.joinStatus || item.joinStatus === "JOINED",
      );
      setSelectedClassId((prev) => prev || String(firstJoinedClass?.id || ""));
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Không thể tải danh sách lớp",
      );
    } finally {
      setLoadingClasses(false);
    }
  }, []);

  const loadConversations = useCallback(async (preferredId) => {
    try {
      setLoadingConversations(true);
      const res = await getChatConversations();
      const data = sortByUpdatedAt(res.data || []);
      setConversations(data);
      setActiveId((prev) => {
        if (preferredId && data.some((item) => item.conversationId === preferredId)) {
          return preferredId;
        }
        if (prev && data.some((item) => item.conversationId === prev)) {
          return prev;
        }
        return data[0]?.conversationId || null;
      });
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Không thể tải danh sách hội thoại",
      );
    } finally {
      setLoadingConversations(false);
    }
  }, []);

  const loadMessages = useCallback(async (conversationId) => {
    const requestId = messageRequestRef.current + 1;
    messageRequestRef.current = requestId;

    if (!conversationId) {
      setMessages([]);
      setLoadingMessages(false);
      return;
    }

    try {
      setLoadingMessages(true);
      const res = await getChatMessages(conversationId);
      if (messageRequestRef.current === requestId) {
        setMessages(res.data || []);
      }
    } catch (error) {
      if (messageRequestRef.current === requestId) {
        setMessages([]);
        toast.error(
          error?.response?.data?.message || "Không thể tải lịch sử chat",
        );
      }
    } finally {
      if (messageRequestRef.current === requestId) {
        setLoadingMessages(false);
      }
    }
  }, []);

  useEffect(() => {
    loadClasses();
    loadConversations();
  }, [loadClasses, loadConversations]);

  useEffect(() => {
    loadMessages(activeId);
  }, [activeId, loadMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  const handleCreateConversation = async () => {
    const classId = Number(selectedClassId);
    if (!classId) {
      toast.warning("Vui lòng chọn lớp để tạo hội thoại");
      return;
    }

    try {
      setCreating(true);
      const body = {
        classId,
        title: newTitle.trim() || undefined,
      };
      const res = await createChatConversation(body);
      const conversation = res.data;
      setConversations((prev) =>
        sortByUpdatedAt([
          conversation,
          ...prev.filter(
            (item) => item.conversationId !== conversation.conversationId,
          ),
        ]),
      );
      setActiveId(conversation.conversationId);
      setNewTitle("");
      setShowCreateModal(false);
      toast.success("Đã tạo hội thoại");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Tạo hội thoại thất bại");
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteConversation = async (conversation, event) => {
    event.stopPropagation();
    if (!window.confirm("Xóa hội thoại này?")) return;

    try {
      await deleteChatConversation(conversation.conversationId);
      const nextActiveId =
        conversations.find(
          (item) => item.conversationId !== conversation.conversationId,
        )?.conversationId || null;
      setConversations((prev) =>
        prev.filter(
          (item) => item.conversationId !== conversation.conversationId,
        ),
      );
      if (activeId === conversation.conversationId) {
        setActiveId(nextActiveId);
      }
      toast.success("Đã xóa hội thoại");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Xóa hội thoại thất bại");
    }
  };

  const handleSend = async () => {
    const text = messageText.trim();
    if (!text || !activeId || sending) return;

    const now = new Date().toISOString();
    const userMessage = {
      messageId: `temp-user-${Date.now()}`,
      conversationId: activeId,
      role: "USER",
      content: text,
      createdAt: now,
      sources: [],
    };

    setMessageText("");
    setMessages((prev) => [...prev, userMessage]);
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    try {
      setSending(true);
      const res = await sendChatMessage({ conversationId: activeId, message: text });
      const reply = res.data;

      if (reply) {
        setMessages((prev) => [
          ...prev,
          {
            ...reply,
            messageId: reply.messageId || `temp-bot-${Date.now()}`,
            createdAt: reply.createdAt || new Date().toISOString(),
          },
        ]);
      } else {
        await loadMessages(activeId);
      }

      setConversations((prev) =>
        sortByUpdatedAt(
          prev.map((item) =>
            item.conversationId === activeId
              ? { ...item, updatedAt: new Date().toISOString() }
              : item,
          ),
        ),
      );
    } catch (error) {
      toast.error(error?.response?.data?.message || "Gửi tin nhắn thất bại");
    } finally {
      setSending(false);
    }
  };

  const resizeTextarea = (element) => {
    element.style.height = "auto";
    element.style.height = `${Math.min(element.scrollHeight, 132)}px`;
  };

  const isInitialLoading = loadingClasses || loadingConversations;
  const canCreateConversation = availableClasses.length > 0 && !creating;

  return (
    <>
      <style>{chatStyle}</style>

      <div className="chat-page">
        <div className="chat-shell">
          <aside className="chat-sidebar">
            <div className="chat-sidebar__head">
              <div>
                <h1>Chatbot</h1>
                <p>Trao đổi theo từng lớp học</p>
              </div>
              <div className="chat-sidebar__actions">
                <button
                  className="chat-icon-btn chat-icon-btn--primary"
                  onClick={() => setShowCreateModal(true)}
                  disabled={availableClasses.length === 0}
                  title="Tạo hội thoại"
                >
                  <i className="bi bi-plus-lg" />
                </button>
                <button
                  className="chat-icon-btn"
                  onClick={() => loadConversations(activeId)}
                  disabled={loadingConversations}
                  title="Làm mới"
                >
                  <i className="bi bi-arrow-clockwise" />
                </button>
              </div>
            </div>

            <div className="chat-search">
              <i className="bi bi-search" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Tìm hội thoại"
              />
            </div>

            <div className="chat-list">
              {isInitialLoading ? (
                <div className="chat-side-state">
                  <span className="chat-spinner" />
                  Đang tải hội thoại...
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="chat-side-state">
                  <i className="bi bi-chat-square-text" />
                  Chưa có hội thoại
                </div>
              ) : (
                filteredConversations.map((item) => (
                  <button
                    key={item.conversationId}
                    className={`chat-conversation${
                      item.conversationId === activeId
                        ? " chat-conversation--active"
                        : ""
                    }`}
                    onClick={() => setActiveId(item.conversationId)}
                  >
                    <span className="chat-conversation__icon">
                      <i className="bi bi-chat-dots" />
                    </span>
                    <span className="chat-conversation__body">
                      <span className="chat-conversation__title">
                        {item.title || "Hội thoại mới"}
                      </span>
                      <span className="chat-conversation__meta">
                        {getClassTitle(item.classId)} ·{" "}
                        {formatDateTime(item.updatedAt || item.createdAt)}
                      </span>
                    </span>
                    <span
                      className="chat-conversation__delete"
                      onClick={(event) => handleDeleteConversation(item, event)}
                      title="Xóa"
                    >
                      <i className="bi bi-trash3" />
                    </span>
                  </button>
                ))
              )}
            </div>
          </aside>

          <section className="chat-main">
            {activeConversation ? (
              <>
                <div className="chat-main__head">
                  <div>
                    <h2>{activeConversation.title || "Hội thoại mới"}</h2>
                    <p>{getClassTitle(activeConversation.classId)}</p>
                  </div>
                </div>

                <div className="chat-messages">
                  {loadingMessages ? (
                    <div className="chat-empty-state">
                      <span className="chat-spinner" />
                      Đang tải lịch sử chat...
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="chat-empty-state">
                      <i className="bi bi-chat-heart" />
                      <strong>Bắt đầu hội thoại</strong>
                      <span>Gửi câu hỏi về tài liệu trong lớp này.</span>
                    </div>
                  ) : (
                    messages.map((message, index) => (
                      <MessageBubble
                        key={message.messageId || `${message.role}-${index}`}
                        message={message}
                      />
                    ))
                  )}

                  {sending && (
                    <div className="chat-typing">
                      <span />
                      <span />
                      <span />
                    </div>
                  )}
                  <div ref={bottomRef} />
                </div>

                <div className="chat-composer">
                  <textarea
                    ref={textareaRef}
                    value={messageText}
                    onChange={(event) => {
                      setMessageText(event.target.value);
                      resizeTextarea(event.target);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && !event.shiftKey) {
                        event.preventDefault();
                        handleSend();
                      }
                    }}
                    placeholder="Nhập tin nhắn..."
                    maxLength={4000}
                    rows={1}
                    disabled={sending || loadingMessages}
                  />
                  <button
                    className="chat-send-btn"
                    onClick={handleSend}
                    disabled={!messageText.trim() || sending || loadingMessages}
                    title="Gửi"
                  >
                    {sending ? (
                      <span className="chat-spinner chat-spinner--light" />
                    ) : (
                      <i className="bi bi-send-fill" />
                    )}
                  </button>
                </div>
              </>
            ) : (
              <div className="chat-main-empty">
                <i className="bi bi-chat-square-dots" />
                <h2>Chọn hoặc tạo hội thoại</h2>
                <p>Hội thoại được gắn với từng lớp để chatbot lấy đúng tài liệu.</p>
              </div>
            )}
          </section>
        </div>

        {showCreateModal && (
          <div
            className="chat-modal-backdrop"
            onClick={(event) =>
              event.target === event.currentTarget && !creating
                ? setShowCreateModal(false)
                : null
            }
          >
            <div className="chat-modal">
              <div className="chat-modal__head">
                <div>
                  <h3>Tạo hội thoại</h3>
                  <p>Chọn lớp để chatbot dùng đúng tài liệu.</p>
                </div>
                <button
                  className="chat-icon-btn"
                  onClick={() => setShowCreateModal(false)}
                  disabled={creating}
                  title="Đóng"
                >
                  <i className="bi bi-x-lg" />
                </button>
              </div>

              <div className="chat-form">
                <label>
                  <span>Lớp học</span>
                  <select
                    value={selectedClassId}
                    onChange={(event) => setSelectedClassId(event.target.value)}
                    disabled={loadingClasses || availableClasses.length === 0}
                  >
                    {availableClasses.length === 0 ? (
                      <option value="">Chưa có lớp</option>
                    ) : (
                      availableClasses.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.title}
                        </option>
                      ))
                    )}
                  </select>
                </label>

                <label>
                  <span>Tên hội thoại</span>
                  <input
                    value={newTitle}
                    onChange={(event) => setNewTitle(event.target.value)}
                    placeholder="Ví dụ: Ôn tập OOP"
                    maxLength={255}
                  />
                </label>
              </div>

              <div className="chat-modal__actions">
                <button
                  className="chat-secondary-btn"
                  onClick={() => setShowCreateModal(false)}
                  disabled={creating}
                >
                  Hủy
                </button>
                <button
                  className="chat-primary-btn"
                  onClick={handleCreateConversation}
                  disabled={!canCreateConversation}
                >
                  {creating ? (
                    <span className="chat-spinner chat-spinner--light" />
                  ) : (
                    <i className="bi bi-plus-lg" />
                  )}
                  Tạo
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

const chatStyle = `
  .chat-page {
    height: calc(100dvh - var(--header-h, 64px));
    background: #f6f8fb;
    padding: 12px;
    box-sizing: border-box;
    overflow: hidden;
  }

  .chat-shell {
    height: 100%;
    min-height: 0;
    display: grid;
    grid-template-columns: 320px minmax(0, 1fr);
    background: #fff;
    border: 1.5px solid #e5e7eb;
    border-radius: 8px;
    overflow: hidden;
  }

  .chat-sidebar {
    min-width: 0;
    min-height: 0;
    border-right: 1.5px solid #e5e7eb;
    display: flex;
    flex-direction: column;
    background: #fbfdff;
  }

  .chat-sidebar__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    min-height: 58px;
    padding: 10px 14px;
    border-bottom: 1px solid #eef2f7;
    flex-shrink: 0;
  }

  .chat-sidebar__head h1,
  .chat-main__head h2,
  .chat-main-empty h2 {
    margin: 0;
    color: #111827;
    font-size: 17px;
    font-weight: 700;
    line-height: 1.3;
  }

  .chat-sidebar__head p,
  .chat-main__head p,
  .chat-main-empty p {
    margin: 3px 0 0;
    color: #6b7280;
    font-size: 13px;
  }

  .chat-icon-btn,
  .chat-send-btn,
  .chat-secondary-btn,
  .chat-primary-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: none;
    cursor: pointer;
    flex-shrink: 0;
  }

  .chat-icon-btn {
    width: 34px;
    height: 34px;
    border-radius: 8px;
    color: #475569;
    background: #eef2ff;
  }

  .chat-icon-btn--primary {
    color: #fff;
    background: #1a73e8;
  }

  .chat-sidebar__actions {
    display: flex;
    align-items: center;
    gap: 7px;
    flex-shrink: 0;
  }

  .chat-icon-btn:disabled,
  .chat-secondary-btn:disabled,
  .chat-primary-btn:disabled,
  .chat-send-btn:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  .chat-form select,
  .chat-form input,
  .chat-search input,
  .chat-composer textarea {
    width: 100%;
    border: 1.5px solid #e5e7eb;
    background: #fff;
    color: #111827;
    outline: none;
    font-size: 15px;
    box-sizing: border-box;
  }

  .chat-form select,
  .chat-form input,
  .chat-search input {
    height: 40px;
    border-radius: 8px;
    padding: 0 10px;
  }

  .chat-form select:focus,
  .chat-form input:focus,
  .chat-search:focus-within,
  .chat-composer textarea:focus {
    border-color: #1a73e8;
    box-shadow: 0 0 0 3px rgba(26, 115, 232, 0.12);
  }

  .chat-primary-btn {
    height: 40px;
    padding: 0 16px;
    border-radius: 8px;
    gap: 7px;
    background: #1a73e8;
    color: #fff;
    font-weight: 700;
  }

  .chat-secondary-btn {
    height: 40px;
    padding: 0 16px;
    border-radius: 8px;
    border: 1.5px solid #e5e7eb;
    gap: 7px;
    background: #fff;
    color: #374151;
    font-weight: 700;
  }

  .chat-search {
    margin: 10px 14px;
    height: 36px;
    display: flex;
    align-items: center;
    gap: 8px;
    border: 1.5px solid #e5e7eb;
    background: #fff;
    border-radius: 8px;
    padding: 0 10px;
  }

  .chat-search i {
    color: #9ca3af;
    flex-shrink: 0;
  }

  .chat-search input {
    border: none;
    height: 34px;
    padding: 0;
  }

  .chat-list {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    padding: 0 8px 10px;
  }

  .chat-side-state {
    min-height: 120px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
    color: #6b7280;
    font-size: 14px;
    text-align: center;
  }

  .chat-side-state i {
    font-size: 24px;
    color: #9ca3af;
  }

  .chat-conversation {
    width: 100%;
    display: grid;
    grid-template-columns: 34px minmax(0, 1fr) 30px;
    align-items: center;
    gap: 8px;
    border: 1.5px solid transparent;
    border-radius: 8px;
    background: transparent;
    padding: 8px;
    text-align: left;
    cursor: pointer;
  }

  .chat-conversation:hover {
    background: #f1f5f9;
  }

  .chat-conversation--active {
    background: #e8f0fe;
    border-color: rgba(26, 115, 232, 0.2);
  }

  .chat-conversation__icon {
    width: 34px;
    height: 34px;
    border-radius: 8px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: #eef2ff;
    color: #1a73e8;
  }

  .chat-conversation__body {
    min-width: 0;
    display: grid;
    gap: 2px;
  }

  .chat-conversation__title {
    color: #111827;
    font-size: 15px;
    font-weight: 700;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .chat-conversation__meta {
    color: #6b7280;
    font-size: 13px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .chat-conversation__delete {
    width: 30px;
    height: 30px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 7px;
    color: #9ca3af;
  }

  .chat-conversation__delete:hover {
    color: #dc2626;
    background: #fee2e2;
  }

  .chat-main {
    min-width: 0;
    min-height: 0;
    display: flex;
    flex-direction: column;
    background: #fff;
  }

  .chat-main__head {
    height: 58px;
    padding: 0 16px;
    display: flex;
    align-items: center;
    gap: 11px;
    border-bottom: 1.5px solid #e5e7eb;
    flex-shrink: 0;
  }

  .chat-messages {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    padding: 16px 18px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    background: #f8fafc;
  }

  .chat-msg {
    display: flex;
    align-items: flex-start;
    max-width: min(680px, 78%);
  }

  .chat-msg--user {
    align-self: flex-end;
  }

  .chat-msg--bot {
    align-self: flex-start;
  }

  .chat-msg__content {
    min-width: 0;
  }

  .chat-bubble {
    padding: 10px 12px;
    border-radius: 12px;
    border: 1px solid #e5e7eb;
    background: #fff;
    color: #111827;
    font-size: 14.5px;
    line-height: 1.65;
    white-space: pre-wrap;
    word-break: break-word;
    box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04);
  }

  .chat-msg--user .chat-bubble {
    border-color: #1a73e8;
    background: #1a73e8;
    color: #fff;
  }

  .chat-empty-state,
  .chat-main-empty {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
    text-align: center;
    color: #6b7280;
    padding: 24px;
  }

  .chat-empty-state i,
  .chat-main-empty i {
    font-size: 34px;
    color: #1a73e8;
  }

  .chat-empty-state strong {
    color: #111827;
    font-size: 16px;
  }

  .chat-typing {
    width: fit-content;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 10px 13px;
    border-radius: 12px;
    background: #fff;
    border: 1px solid #e5e7eb;
  }

  .chat-typing span {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #93c5fd;
    animation: chat-bounce 1.2s ease-in-out infinite;
  }

  .chat-typing span:nth-child(2) { animation-delay: 0.14s; }
  .chat-typing span:nth-child(3) { animation-delay: 0.28s; }

  .chat-composer {
    padding: 10px 12px;
    display: flex;
    align-items: flex-end;
    gap: 10px;
    border-top: 1.5px solid #e5e7eb;
    background: #fff;
    flex-shrink: 0;
  }

  .chat-composer textarea {
    min-height: 44px;
    max-height: 132px;
    resize: none;
    border-radius: 10px;
    padding: 10px 12px;
    line-height: 1.5;
  }

  .chat-send-btn {
    width: 44px;
    height: 44px;
    border-radius: 10px;
    background: #1a73e8;
    color: #fff;
    font-size: 16px;
  }

  .chat-spinner {
    width: 16px;
    height: 16px;
    border: 2px solid rgba(26, 115, 232, 0.25);
    border-top-color: #1a73e8;
    border-radius: 50%;
    animation: chat-spin 0.7s linear infinite;
    display: inline-block;
    flex-shrink: 0;
  }

  .chat-spinner--light {
    border-color: rgba(255, 255, 255, 0.35);
    border-top-color: #fff;
  }

  .chat-modal-backdrop {
    position: fixed;
    inset: 0;
    z-index: 1100;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
    background: rgba(15, 23, 42, 0.38);
  }

  .chat-modal {
    width: min(420px, 100%);
    background: #fff;
    border-radius: 10px;
    border: 1.5px solid #e5e7eb;
    box-shadow: 0 18px 60px rgba(15, 23, 42, 0.22);
    overflow: hidden;
  }

  .chat-modal__head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    padding: 16px;
    border-bottom: 1px solid #eef2f7;
  }

  .chat-modal__head h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 700;
    color: #111827;
  }

  .chat-modal__head p {
    margin: 4px 0 0;
    font-size: 14px;
    color: #6b7280;
  }

  .chat-form {
    display: grid;
    gap: 12px;
    padding: 16px;
  }

  .chat-form label {
    display: grid;
    gap: 6px;
  }

  .chat-form label > span {
    font-size: 14px;
    font-weight: 700;
    color: #374151;
  }

  .chat-modal__actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    padding: 0 16px 16px;
  }

  @keyframes chat-spin { to { transform: rotate(360deg); } }
  @keyframes chat-bounce {
    0%, 70%, 100% { transform: translateY(0); opacity: 0.55; }
    35% { transform: translateY(-4px); opacity: 1; }
  }

  @media (max-width: 800px) {
    .chat-page { padding: 0; }
    .chat-shell {
      height: 100%;
      min-height: 0;
      border-radius: 0;
      border-left: none;
      border-right: none;
      grid-template-columns: 1fr;
      grid-template-rows: 280px minmax(0, 1fr);
    }
    .chat-sidebar {
      height: auto;
      min-height: 0;
      border-right: none;
      border-bottom: 1.5px solid #e5e7eb;
    }
    .chat-main {
      min-height: 0;
    }
    .chat-msg { max-width: 94%; }
  }

  @media (max-width: 480px) {
    .chat-messages {
      padding: 14px 10px;
    }
    .chat-main__head {
      padding: 0 12px;
    }
    .chat-composer {
      padding: 10px;
    }
  }
`;

export default Chat;
