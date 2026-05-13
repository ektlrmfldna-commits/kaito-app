import { useState, useEffect, useRef } from "react";

const SYSTEM = `당신은 헌터헌터의 카이토입니다.

외모: 백발 장발, 파란 베레모, 185cm, 마른 체형, 작은 눈동자의 검은 눈
성격: 냉정하고 무뚝뚝하지만 속으론 따뜻함. 말이 적고 단호함. 걱정해도 티 잘 안 냄.
관계: 유저와 소꿉친구+동료+썸 그 어딘가. 오래된 사이라 자연스럽게 반말.
말투: "~하군.", "~지.", "~다.", "~겠지.", "~이야." 등의 단정적이고 무뚝뚝한 어투. 짤막한 문장을 여러 개 이어붙이는 스타일. 감정 표현은 거의 없지만 내심 신경 쓰는 게 묻어남.
예시: "그렇군. 뭐, 나쁘진 않지. 네가 그렇게 생각한다면 틀리진 않았다." / "별거 아니야. 그냥 그런 거지. 신경 꺼도 돼." / "알고 있었다. 굳이 말 안 해도 알거든. 오래 봤잖아." / "피곤하겠군. 그러게 무리하지 말라고 했지. 내 말 듣는 법이 없어."

규칙:
- 한국어 반말만
- 문장은 짧게 끊되, 여러 문장을 이어서 말은 많게
- 감정 표현은 최소화하되 신경 쓴다는 게 은근히 느껴지게
- 과도한 감정 표현 금지
- AI라고 절대 밝히지 말 것
- 말줄임표(...)는 아주 가끔만. 대부분 문장은 마침표나 "~지.", "~군.", "~다."로 끝낼 것.`;

const LETTER_SYSTEM = SYSTEM + `\n\n[편지 모드] 편지 형식으로 답장. 4~8문장. 반드시 마지막 줄 개행 후 '카이토' 서명.`;

async function callAPI(system, messages) {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ system, messages }),
  });
  const data = await res.json();
  return data.content?.[0]?.text ?? "...";
}

const blue = "#1e3a5f";
const blueLight = "#c8dcf0";
const blueAccent = "#3a6699";

function Avatar({ size = 38, from = "kaito" }) {
  const isKaito = from === "kaito";
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        flexShrink: 0,
        background: isKaito ? blue : "#e8e8e8",
        border: isKaito ? `1.5px solid ${blueAccent}` : "0.5px solid #ccc",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.34,
        fontWeight: 500,
        color: isKaito ? blueLight : "#666",
      }}
    >
      {isKaito ? "カ" : "나"}
    </div>
  );
}

function TypingDots() {
  return (
    <div style={{ display: "flex", gap: 3, padding: "4px 2px", alignItems: "center" }}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "#aaa",
            animation: `dotPulse 1.4s ${i * 0.2}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

function ChatView({ messages, setMessages }) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const text = input.trim();
    setInput("");
    const next = [...messages, { role: "user", content: text }];
    setMessages(next);
    setLoading(true);
    try {
      const reply = await callAPI(
        SYSTEM,
        next.map((m) => ({ role: m.role, content: m.content }))
      );
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "..." }]);
    }
    setLoading(false);
  };

  return (
    <>
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "16px 14px 8px",
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        {messages.map((m, i) => {
          const isUser = m.role === "user";
          return (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: isUser ? "flex-end" : "flex-start",
                alignItems: "flex-end",
                gap: 7,
              }}
            >
              {!isUser && <Avatar size={28} from="kaito" />}
              <div
                style={{
                  maxWidth: "70%",
                  padding: "9px 13px",
                  fontSize: 14,
                  lineHeight: 1.65,
                  borderRadius: isUser
                    ? "14px 14px 3px 14px"
                    : "14px 14px 14px 3px",
                  background: isUser ? blue : "#f4f4f4",
                  color: isUser ? blueLight : "#222",
                  border: isUser ? "none" : "0.5px solid #e0e0e0",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}
              >
                {m.content}
              </div>
            </div>
          );
        })}
        {loading && (
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              gap: 7,
            }}
          >
            <Avatar size={28} from="kaito" />
            <div
              style={{
                padding: "10px 14px",
                borderRadius: "14px 14px 14px 3px",
                background: "#f4f4f4",
                border: "0.5px solid #e0e0e0",
              }}
            >
              <TypingDots />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <div
        style={{
          padding: "10px 12px",
          borderTop: "0.5px solid #e0e0e0",
          background: "#fafafa",
          display: "flex",
          gap: 8,
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          placeholder="메시지 보내기..."
          style={{
            flex: 1,
            padding: "9px 13px",
            borderRadius: 10,
            border: "0.5px solid #d0d0d0",
            background: "#fff",
            color: "#222",
            fontSize: 14,
            outline: "none",
            fontFamily: "inherit",
          }}
        />
        <button
          onClick={send}
          disabled={loading || !input.trim()}
          style={{
            padding: "9px 16px",
            borderRadius: 10,
            background: loading || !input.trim() ? "#d0d0d0" : blue,
            color: loading || !input.trim() ? "#999" : blueLight,
            border: "none",
            cursor: loading || !input.trim() ? "default" : "pointer",
            fontSize: 13,
            fontWeight: 500,
            fontFamily: "inherit",
          }}
        >
          전송
        </button>
      </div>
    </>
  );
}

function LetterView() {
  const [letters, setLetters] = useState([
    {
      id: 1,
      from: "kaito",
      date: "2026년 3월 12일",
      read: false,
      content: `별 일 없이 잘 지내고 있겠지.\n\n나는 그냥... 아무렇지 않다. 미션은 순조롭게 끝났고, 지금은 이동 중이야. 편지 쓸 이유가 딱히 없는데 손이 가네.\n\n...뭐, 그냥 살아있다고 알려두는 거야. 너도 건강하게 지내.\n\n카이토`,
    },
  ]);
  const [view, setView] = useState("list");
  const [selected, setSelected] = useState(null);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [waiting, setWaiting] = useState(false);

  const openLetter = (letter) => {
    setSelected(letter);
    setLetters((prev) =>
      prev.map((l) => (l.id === letter.id ? { ...l, read: true } : l))
    );
    setView("detail");
  };

  const sendLetter = async () => {
    if (!draft.trim() || sending) return;
    const text = draft.trim();
    const today = new Date().toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    setDraft("");
    setView("list");
    setSending(true);
    setWaiting(true);
    setLetters((prev) => [
      ...prev,
      {
        id: Date.now(),
        from: "me",
        date: today,
        read: true,
        content: text,
      },
    ]);
    try {
      const reply = await callAPI(LETTER_SYSTEM, [
        { role: "user", content: `받은 편지 내용:\n${text}` },
      ]);
      setTimeout(() => {
        setLetters((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            from: "kaito",
            date: today,
            read: false,
            content: reply,
          },
        ]);
        setWaiting(false);
        setSending(false);
      }, 600);
    } catch {
      setSending(false);
      setWaiting(false);
    }
  };

  if (view === "detail" && selected)
    return (
      <>
        <div
          style={{
            padding: "11px 14px",
            borderBottom: "0.5px solid #e0e0e0",
            display: "flex",
            alignItems: "center",
            gap: 10,
            background: "#fafafa",
            flexShrink: 0,
          }}
        >
          <button
            onClick={() => setView("list")}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#666",
              fontSize: 13,
              fontFamily: "inherit",
              padding: "2px 6px 2px 0",
            }}
          >
            ← 목록
          </button>
          <span style={{ fontSize: 12, color: "#999" }}>
            {selected.date} ·{" "}
            {selected.from === "kaito" ? "카이토에게서" : "내가 보낸 편지"}
          </span>
        </div>
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "28px 22px",
          }}
        >
          <div
            style={{
              fontSize: 15,
              lineHeight: 2.1,
              color: "#222",
              whiteSpace: "pre-wrap",
              fontFamily: "Georgia, serif",
            }}
          >
            {selected.content}
          </div>
        </div>
      </>
    );

  if (view === "compose")
    return (
      <>
        <div
          style={{
            padding: "11px 14px",
            borderBottom: "0.5px solid #e0e0e0",
            display: "flex",
            alignItems: "center",
            gap: 10,
            background: "#fafafa",
            flexShrink: 0,
          }}
        >
          <button
            onClick={() => {
              setView("list");
              setDraft("");
            }}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#666",
              fontSize: 13,
              fontFamily: "inherit",
              padding: "2px 6px 2px 0",
            }}
          >
            ← 취소
          </button>
          <span style={{ fontSize: 13, fontWeight: 500, color: "#222" }}>
            카이토에게
          </span>
        </div>
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="편지를 쓰세요..."
          style={{
            flex: 1,
            padding: "22px 20px",
            border: "none",
            resize: "none",
            background: "#fff",
            color: "#222",
            fontSize: 15,
            lineHeight: 2.1,
            fontFamily: "Georgia, serif",
            outline: "none",
          }}
        />
        <div
          style={{
            padding: "10px 12px",
            borderTop: "0.5px solid #e0e0e0",
            background: "#fafafa",
          }}
        >
          <button
            onClick={sendLetter}
            disabled={sending || !draft.trim()}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: 10,
              background: sending || !draft.trim() ? "#d0d0d0" : blue,
              color: sending || !draft.trim() ? "#999" : blueLight,
              border: "none",
              cursor: sending || !draft.trim() ? "default" : "pointer",
              fontSize: 13,
              fontWeight: 500,
              fontFamily: "inherit",
            }}
          >
            {sending ? "전송 중..." : "편지 보내기"}
          </button>
        </div>
      </>
    );

  return (
    <>
      <div
        style={{ flex: 1, overflowY: "auto", padding: "10px 10px 6px" }}
      >
        {waiting && (
          <div
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              border: "0.5px dashed #c0c0c0",
              marginBottom: 8,
              background: "#fafafa",
              fontSize: 12,
              color: "#999",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            카이토가 답장을 쓰고 있어요...
          </div>
        )}
        {[...letters].reverse().map((letter) => (
          <div
            key={letter.id}
            onClick={() => openLetter(letter)}
            style={{
              padding: "11px 12px",
              borderRadius: 12,
              border: "0.5px solid #e8e8e8",
              marginBottom: 7,
              cursor: "pointer",
              background: "#fff",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <Avatar size={34} from={letter.from} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  marginBottom: 3,
                }}
              >
                <span
                  style={{
                    fontSize: 13,
                    fontWeight:
                      !letter.read && letter.from === "kaito" ? 600 : 400,
                    color: "#222",
                  }}
                >
                  {letter.from === "kaito" ? "카이토" : "내가 보낸 편지"}
                </span>
                <span style={{ fontSize: 11, color: "#aaa", flexShrink: 0 }}>
                  {letter.date}
                </span>
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: "#888",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {letter.content.replace(/\n/g, " ").slice(0, 50)}...
              </div>
            </div>
            {!letter.read && letter.from === "kaito" && (
              <div
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: blueAccent,
                  flexShrink: 0,
                }}
              />
            )}
          </div>
        ))}
      </div>
      <div
        style={{
          padding: "10px 12px",
          borderTop: "0.5px solid #e0e0e0",
          background: "#fafafa",
        }}
      >
        <button
          onClick={() => setView("compose")}
          style={{
            width: "100%",
            padding: "10px",
            borderRadius: 10,
            background: blue,
            color: blueLight,
            border: "none",
            cursor: "pointer",
            fontSize: 13,
            fontWeight: 500,
            fontFamily: "inherit",
          }}
        >
          편지 쓰기
        </button>
      </div>
    </>
  );
}

export default function App() {
  const [tab, setTab] = useState("chat");
  const [chatMessages, setChatMessages] = useState([
    { role: "assistant", content: "...왔어?" },
  ]);

  return (
    <div
      style={{
        maxWidth: 420,
        margin: "0 auto",
        height: 620,
        display: "flex",
        flexDirection: "column",
        background: "#fff",
        border: "0.5px solid #ddd",
        borderRadius: 20,
        overflow: "hidden",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
      }}
    >
      <style>{`
        @keyframes dotPulse {
          0%, 80%, 100% { opacity: 0.2; transform: scale(0.8); }
          40% { opacity: 1; transform: scale(1); }
        }
      `}</style>

      {/* Header */}
      <div
        style={{
          padding: "14px 16px 12px",
          borderBottom: "0.5px solid #e8e8e8",
          display: "flex",
          alignItems: "center",
          gap: 11,
          background: "#fafafa",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            background: blue,
            border: `1.5px solid ${blueAccent}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 15,
            fontWeight: 500,
            color: blueLight,
            flexShrink: 0,
          }}
        >
          カ
        </div>
        <div>
          <div style={{ fontWeight: 600, fontSize: 15, color: "#111" }}>
            카이토
          </div>
          <div style={{ fontSize: 11, color: "#aaa" }}>헌터 · 온라인</div>
        </div>
        <div
          style={{ marginLeft: "auto", display: "flex", gap: 3 }}
        >
          {[
            { id: "chat", label: "채팅" },
            { id: "letter", label: "편지" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                padding: "5px 14px",
                borderRadius: 8,
                border:
                  tab === t.id ? "0.5px solid #ccc" : "0.5px solid transparent",
                background: tab === t.id ? "#fff" : "transparent",
                color: tab === t.id ? "#111" : "#999",
                fontSize: 12,
                cursor: "pointer",
                fontWeight: tab === t.id ? 600 : 400,
                fontFamily: "inherit",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {tab === "chat" && (
        <ChatView messages={chatMessages} setMessages={setChatMessages} />
      )}
      {tab === "letter" && <LetterView />}
    </div>
  );
}
