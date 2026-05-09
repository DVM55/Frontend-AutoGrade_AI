import React, { useEffect, useState, useRef, useCallback, memo } from "react";
import { sendMessage, getHistory } from "../../service/chatbot";
import { toast } from "react-toastify";

/* ─── CSS ─── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@300;400;500;600;700&display=swap');

  .cb-fab {
    position: fixed;
    bottom: calc(24px + env(safe-area-inset-bottom));
    right: 24px;
    width: 54px; height: 54px;
    border-radius: 50%;
    background: linear-gradient(135deg, #2563eb, #1d4ed8);
    border: none; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 4px 20px rgba(37,99,235,0.45);
    z-index: 9999;
    transition: transform .2s, box-shadow .2s;
  }
  .cb-fab:hover { transform: scale(1.08); box-shadow: 0 6px 28px rgba(37,99,235,0.55); }
  .cb-fab:active { transform: scale(0.95); }
  .cb-fab-icon { transition: opacity .15s, transform .2s; position: absolute; }
  .cb-fab-icon--close { opacity: 0; transform: rotate(-90deg) scale(0.6); }
  .cb-fab--open .cb-fab-icon--chat { opacity: 0; transform: rotate(90deg) scale(0.6); }
  .cb-fab--open .cb-fab-icon--close { opacity: 1; transform: rotate(0deg) scale(1); }

  .cb-fab-badge {
    position: absolute; top: -3px; right: -3px;
    width: 18px; height: 18px; border-radius: 50%;
    background: #ef4444;
    font-size: 10px; font-weight: 700; color: #fff;
    display: flex; align-items: center; justify-content: center;
    border: 2px solid #fff;
    font-family: 'Be Vietnam Pro', sans-serif;
  }

  .cb-panel {
    position: fixed;
    bottom: calc(90px + env(safe-area-inset-bottom));
    right: 24px;
    width: 370px; height: 520px;
    background: #fff;
    border-radius: 20px;
    border: 1px solid #e2e8f0;
    box-shadow: 0 12px 48px rgba(37,99,235,0.14), 0 4px 16px rgba(0,0,0,0.08);
    display: flex; flex-direction: column;
    overflow: hidden;
    z-index: 9998;
    font-family: 'Be Vietnam Pro', sans-serif;
    transition: opacity .2s, visibility .2s;
  }
  .cb-panel--closed { opacity: 0; visibility: hidden; pointer-events: none; }
  .cb-panel--open { opacity: 1; visibility: visible; }

  .cb-header {
    padding: 13px 15px;
    border-bottom: 1px solid #f1f5f9;
    display: flex; align-items: center; gap: 10px;
    flex-shrink: 0; background: #fff;
  }
  .cb-header-av {
    width: 36px; height: 36px; border-radius: 11px;
    background: linear-gradient(135deg, #2563eb, #3b82f6);
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
    box-shadow: 0 2px 8px rgba(37,99,235,0.28);
  }
  .cb-header-name { font-size: 13.5px; font-weight: 600; color: #0f172a; }
  .cb-header-status { font-size: 11px; color: #94a3b8; display: flex; align-items: center; gap: 4px; margin-top: 1px; }
  .cb-status-dot {
    width: 6px; height: 6px; border-radius: 50%; background: #22c55e;
  }
  .cb-header-close {
    margin-left: auto; width: 36px; height: 36px; border-radius: 8px;
    border: none; background: #f1f5f9; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    color: #64748b; transition: background .15s; flex-shrink: 0;
  }
  .cb-header-close:hover { background: #e2e8f0; }

  .cb-messages {
    flex: 1;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    padding: 13px 11px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    background: #f8faff;
  }

  .cb-empty {
    flex: 1; display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    gap: 6px; text-align: center; padding: 16px;
  }
  .cb-empty-icon {
    width: 46px; height: 46px; border-radius: 14px;
    background: linear-gradient(135deg, #eff6ff, #dbeafe);
    border: 1px solid #bfdbfe;
    display: flex; align-items: center; justify-content: center; margin-bottom: 5px;
  }
  .cb-empty-title { font-size: 13.5px; font-weight: 600; color: #0f172a; }
  .cb-empty-sub { font-size: 12px; color: #94a3b8; line-height: 1.5; }

  .cb-row { display: flex; align-items: flex-end; gap: 7px; }
  .cb-row--user { flex-direction: row-reverse; }

  .cb-bot-av {
    width: 25px; height: 25px; border-radius: 8px;
    background: linear-gradient(135deg, #2563eb, #3b82f6);
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0; box-shadow: 0 2px 5px rgba(37,99,235,0.2);
  }
  .cb-bot-av--hide { opacity: 0; }

  .cb-bubble {
    max-width: 88%;
    padding: 8px 12px;
    font-size: 13px;
    line-height: 1.6;
    word-break: break-word;
    white-space: pre-wrap;
  }
  .cb-bubble--bot {
    background: #fff; color: #0f172a;
    border-radius: 4px 13px 13px 13px;
    border: 1px solid #e2e8f0;
    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  }
  .cb-bubble--user {
    background: linear-gradient(135deg, #2563eb, #1d4ed8); color: #fff;
    border-radius: 13px 4px 13px 13px;
    box-shadow: 0 2px 8px rgba(37,99,235,0.22);
  }
  .cb-row--consecutive .cb-bubble--bot { border-radius: 13px; }
  .cb-row--consecutive .cb-bubble--user { border-radius: 13px; }

  .cb-time { font-size: 10px; color: #94a3b8; margin-top: 3px; opacity: 0; transition: opacity .2s; padding: 0 2px; }
  .cb-row:hover .cb-time { opacity: 1; }
  .cb-time--right { text-align: right; }

  .cb-typing {
    display: flex; align-items: center; gap: 3px; padding: 9px 12px;
    background: #fff; border-radius: 4px 13px 13px 13px;
    border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.04);
  }
  .cb-typing span {
    width: 5px; height: 5px; border-radius: 50%; background: #93c5fd;
    animation: cb-bounce 1.4s ease-in-out infinite;
  }
  .cb-typing span:nth-child(2) { animation-delay: .16s; }
  .cb-typing span:nth-child(3) { animation-delay: .32s; }
  @keyframes cb-bounce {
    0%, 60%, 100% { transform: translateY(0); background: #93c5fd; }
    30% { transform: translateY(-4px); background: #2563eb; }
  }

  .cb-history-loading {
    display: flex; flex-direction: column; align-items: center;
    justify-content: center; flex: 1; gap: 10px; color: #94a3b8;
  }
  .cb-spin {
    width: 20px; height: 20px; border: 2px solid #eff6ff;
    border-top-color: #2563eb; border-radius: 50%;
    animation: cb-spin .6s linear infinite;
  }
  @keyframes cb-spin { to { transform: rotate(360deg); } }

  .cb-chips {
    padding: 0 11px 9px; background: #f8faff;
    display: flex; flex-wrap: wrap; gap: 5px; flex-shrink: 0;
  }
  .cb-chip {
    font-family: 'Be Vietnam Pro', sans-serif;
    font-size: 11px; font-weight: 500;
    padding: 4px 10px; border-radius: 100px;
    border: 1.5px solid #bfdbfe; color: #2563eb;
    background: #eff6ff; cursor: pointer; line-height: 1.3;
  }
  .cb-chip:active { background: #dbeafe; }

  .cb-inputbar {
    padding: 9px 11px;
    padding-bottom: max(9px, env(safe-area-inset-bottom));
    border-top: 1px solid #e2e8f0;
    display: flex; gap: 7px; align-items: flex-end;
    background: #fff; flex-shrink: 0;
  }
  .cb-input-wrap {
    flex: 1; background: #f8faff; border: 1.5px solid #e2e8f0;
    border-radius: 11px; padding: 7px 11px;
    display: flex; align-items: flex-end; transition: border-color .2s;
  }
  .cb-input-wrap:focus-within { border-color: #93c5fd; background: #fff; }
  .cb-textarea {
    flex: 1; border: none; outline: none; resize: none;
    font-family: 'Be Vietnam Pro', sans-serif;
    font-size: 16px;
    background: transparent; color: #0f172a; line-height: 1.5; max-height: 75px;
    -webkit-appearance: none;
    appearance: none;
  }
  .cb-textarea::placeholder { color: #94a3b8; }
  .cb-send {
    width: 44px; height: 44px; border-radius: 9px;
    background: linear-gradient(135deg, #2563eb, #1d4ed8);
    border: none; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0; box-shadow: 0 2px 7px rgba(37,99,235,0.26);
  }
  .cb-send:active:not(:disabled) { opacity: 0.8; }
  .cb-send:disabled { opacity: .4; cursor: not-allowed; }

  @media (max-width: 480px) {
    .cb-panel {
      top: 0; left: 0; right: 0; bottom: 0;
      width: 100%; height: 100%;
      border-radius: 0; border: none;
    }
    .cb-fab {
      bottom: calc(16px + env(safe-area-inset-bottom));
      right: 16px;
    }
    .cb-fab--open { display: none; }
    .cb-inputbar {
      padding: 8px 12px;
      padding-bottom: max(12px, env(safe-area-inset-bottom));
    }
  }
`;

/* ─── Helpers ─── */

const getTime = () => {
  const d = new Date();
  return d.getHours() + ":" + String(d.getMinutes()).padStart(2, "0");
};

const toStr = (val) => {
  if (typeof val === "string") return val;
  if (val == null) return "";
  return JSON.stringify(val);
};

const scrollToBottom = (ref) => {
  try {
    if (ref.current) {
      ref.current.scrollIntoView();
    }
  } catch (e) {
    try {
      if (ref.current && ref.current.parentElement) {
        ref.current.parentElement.scrollTop =
          ref.current.parentElement.scrollHeight;
      }
    } catch (_) {}
  }
};

/* ─── Bold parser ─── */

const parseBold = (text) => {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return parts.map(function (part, i) {
    return i % 2 === 1 ? React.createElement("strong", { key: i }, part) : part;
  });
};

const renderLines = (content) => {
  return content.split("\n").map(function (line, i, arr) {
    return React.createElement(
      React.Fragment,
      { key: i },
      parseBold(line),
      i < arr.length - 1 ? React.createElement("br") : null,
    );
  });
};

/* ─── Sub-components ─── */

const BotAvatar = function (props) {
  var hide = props.hide;
  return (
    <div className={"cb-bot-av" + (hide ? " cb-bot-av--hide" : "")}>
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    </div>
  );
};

const TypingDots = function () {
  return (
    <div className="cb-row">
      <BotAvatar />
      <div className="cb-typing">
        <span />
        <span />
        <span />
      </div>
    </div>
  );
};

const Bubble = memo(function Bubble(props) {
  var msg = props.msg;
  var consecutive = props.consecutive;
  var isUser = msg.role === "USER";
  var content = toStr(msg.content);
  return (
    <div
      className={
        "cb-row" +
        (isUser ? " cb-row--user" : "") +
        (consecutive ? " cb-row--consecutive" : "")
      }
    >
      {!isUser && <BotAvatar hide={consecutive} />}
      <div>
        <div className={"cb-bubble cb-bubble--" + (isUser ? "user" : "bot")}>
          {isUser ? content : renderLines(content)}
        </div>
        {msg.time ? (
          <div className={"cb-time" + (isUser ? " cb-time--right" : "")}>
            {msg.time}
          </div>
        ) : null}
      </div>
    </div>
  );
});

const ChatInput = memo(function ChatInput(props) {
  var onSend = props.onSend;
  var disabled = props.disabled;
  var [input, setInput] = useState("");
  var ref = useRef(null);

  var resize = useCallback(function (el) {
    requestAnimationFrame(function () {
      el.style.height = "auto";
      el.style.height = Math.min(el.scrollHeight, 75) + "px";
    });
  }, []);

  var send = useCallback(
    function () {
      var t = input.trim();
      if (!t || disabled) return;
      onSend(t);
      setInput("");
      if (ref.current) ref.current.style.height = "auto";
    },
    [input, disabled, onSend],
  );

  return (
    <div className="cb-inputbar">
      <div className="cb-input-wrap">
        <textarea
          ref={ref}
          className="cb-textarea"
          rows={1}
          placeholder="Nhập tin nhắn..."
          value={input}
          disabled={disabled}
          onChange={function (e) {
            setInput(e.target.value);
            resize(e.target);
          }}
          onKeyDown={function (e) {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
        />
      </div>
      <button
        className="cb-send"
        disabled={!input.trim() || disabled}
        onClick={send}
      >
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="22" y1="2" x2="11" y2="13" />
          <polygon points="22 2 15 22 11 13 2 9 22 2" />
        </svg>
      </button>
    </div>
  );
});

const CHIPS = [
  "Làm thế nào để học tốt?",
  "Giải thích khái niệm",
  "Tóm tắt nội dung",
  "Tạo bài tập",
];

/* ─── Main component ─── */

const Chatbot = function () {
  var [open, setOpen] = useState(false);
  var [unread, setUnread] = useState(0);
  var [messages, setMessages] = useState([]);
  var [loading, setLoading] = useState(false);
  var [historyLoading, setHistoryLoading] = useState(true);
  var [showChips, setShowChips] = useState(true);
  var bottomRef = useRef(null);

  useEffect(function () {
    if (!document.getElementById("cb-styles")) {
      var el = document.createElement("style");
      el.id = "cb-styles";
      el.textContent = STYLES;
      document.head.appendChild(el);
    }
  }, []);

  useEffect(function () {
    var fetchHistory = async function () {
      try {
        var res = await getHistory();
        var data = res.data;
        if (data.length > 0) {
          setShowChips(false);
          setMessages(
            data.map(function (m, i) {
              return Object.assign({}, m, {
                content: toStr(m.content),
                id: i,
                time: "",
              });
            }),
          );
        }
      } catch (err) {
        console.error("Error fetching chat history:", err);
        toast.error(
          (err.response && err.response.data && err.response.data.message) ||
            "Không thể tải lịch sử trò chuyện.",
        );
      } finally {
        setHistoryLoading(false);
      }
    };
    fetchHistory();
  }, []);

  useEffect(
    function () {
      if (open) {
        setUnread(0);
        setTimeout(function () {
          scrollToBottom(bottomRef);
        }, 60);
      }
    },
    [open],
  );

  useEffect(
    function () {
      scrollToBottom(bottomRef);
    },
    [messages, loading],
  );

  var send = useCallback(
    async function (text) {
      if (!text || loading) return;
      setShowChips(false);
      setMessages(function (prev) {
        return prev.concat([
          { role: "USER", content: text, id: Date.now(), time: getTime() },
        ]);
      });
      setLoading(true);
      try {
        var res = await sendMessage(text);
        var reply = toStr(res.data.content);
        setMessages(function (prev) {
          return prev.concat([
            {
              role: "ASSISTANT",
              content: reply,
              id: Date.now() + 1,
              time: getTime(),
            },
          ]);
        });
        if (!open)
          setUnread(function (u) {
            return u + 1;
          });
      } catch (err) {
        toast.error(
          (err.response && err.response.data && err.response.data.message) ||
            "Gửi tin nhắn thất bại. Vui lòng thử lại.",
        );
      } finally {
        setLoading(false);
      }
    },
    [loading, open],
  );

  return (
    <>
      <div
        className={"cb-panel " + (open ? "cb-panel--open" : "cb-panel--closed")}
      >
        <div className="cb-header">
          <div className="cb-header-av">
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <div className="cb-header-name">Trợ lý ảo</div>
            <div className="cb-header-status">
              <span className="cb-status-dot" /> Đang hoạt động
            </div>
          </div>
          <button
            className="cb-header-close"
            onClick={function () {
              setOpen(false);
            }}
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {historyLoading ? (
          <div className="cb-history-loading">
            <div className="cb-spin" />
            <span style={{ fontSize: 13 }}>Đang tải lịch sử...</span>
          </div>
        ) : (
          <div className="cb-messages">
            {messages.length === 0 && !loading ? (
              <div className="cb-empty">
                <div className="cb-empty-icon">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#2563eb"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
                <div className="cb-empty-title">
                  Xin chào! Tôi có thể giúp gì?
                </div>
                <div className="cb-empty-sub">
                  Đặt câu hỏi hoặc chọn gợi ý bên dưới
                </div>
              </div>
            ) : (
              messages.map(function (msg, i) {
                var prev = messages[i - 1];
                return (
                  <Bubble
                    key={msg.id}
                    msg={msg}
                    consecutive={prev ? prev.role === msg.role : false}
                  />
                );
              })
            )}
            {loading && <TypingDots />}
            <div ref={bottomRef} />
          </div>
        )}

        {showChips && !historyLoading && (
          <div className="cb-chips">
            {CHIPS.map(function (c) {
              return (
                <button
                  key={c}
                  className="cb-chip"
                  onClick={function () {
                    send(c);
                  }}
                >
                  {c}
                </button>
              );
            })}
          </div>
        )}

        <ChatInput onSend={send} disabled={historyLoading || loading} />
      </div>

      <button
        className={"cb-fab" + (open ? " cb-fab--open" : "")}
        onClick={function () {
          setOpen(function (o) {
            return !o;
          });
        }}
        title={open ? "Đóng" : "Mở trợ lý ảo"}
      >
        <span className="cb-fab-icon cb-fab-icon--chat">
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </span>
        <span className="cb-fab-icon cb-fab-icon--close">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </span>
        {!open && unread > 0 && (
          <span className="cb-fab-badge">{unread > 9 ? "9+" : unread}</span>
        )}
      </button>
    </>
  );
};

export default Chatbot;
