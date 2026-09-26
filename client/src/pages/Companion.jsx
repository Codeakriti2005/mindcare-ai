import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../utils/api";

const MAX_MESSAGE_LENGTH = 3000;

const WELCOME_MESSAGE = {
  role: "ai",
  content:
    "Hi! I'm MindCare AI. I'm here to listen and support you. How are you feeling today?",
  safety: false,
};

const formatAIMessage = (text) => {
  if (!text) return null;

  const lines = text.split("\n");

  return lines.map((line, index) => (
    <span key={index}>
      {line}
      {index < lines.length - 1 && <br />}
    </span>
  ));
};

function Companion() {
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [conversationId, setConversationId] = useState(null);
  const [conversations, setConversations] = useState([]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [error, setError] = useState("");

  // Voice
  const [isListening, setIsListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(true);
  const [speakingMessage, setSpeakingMessage] = useState(null);
  const [voiceLanguage, setVoiceLanguage] = useState("en-US");

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const speechTimeoutRef = useRef(null);

  // =====================================================
  // VOICE RECOGNITION
  // =====================================================

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      setError("");
    };

    recognition.onresult = (event) => {
      let transcript = "";

      for (
        let i = event.resultIndex;
        i < event.results.length;
        i++
      ) {
        transcript += event.results[i][0].transcript;
      }

      setInput(transcript.trim());
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);

      setIsListening(false);

      if (event.error === "not-allowed") {
        setError(
          "Microphone permission was denied. Please allow microphone access."
        );
      } else if (event.error === "no-speech") {
        setError(
          "I couldn't hear anything. Please try again."
        );
      } else if (event.error === "network") {
        setError(
          "Voice recognition needs a supported browser/network connection."
        );
      } else {
        setError(
          "Voice input is temporarily unavailable. Please try again."
        );
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      try {
        recognition.stop();
      } catch {
        // Recognition may already be stopped.
      }
    };
  }, []);

  // Update recognition language
  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = voiceLanguage;
    }
  }, [voiceLanguage]);

  // =====================================================
  // VOICE INPUT
  // =====================================================

  const toggleVoiceInput = () => {
    if (!voiceSupported) {
      setError(
        "Voice input is not supported by this browser."
      );
      return;
    }

    if (!recognitionRef.current) {
      setError("Voice input is unavailable right now.");
      return;
    }

    if (isListening) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Ignore stop errors.
      }

      setIsListening(false);
      return;
    }

    setError("");

    try {
      recognitionRef.current.lang = voiceLanguage;
      recognitionRef.current.start();
    } catch (error) {
      console.error("Voice start error:", error);

      setError(
        "Voice input could not start. Please try again."
      );
    }
  };

  // =====================================================
  // STOP AI SPEECH
  // =====================================================

  const stopSpeaking = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    if (speechTimeoutRef.current) {
      clearTimeout(speechTimeoutRef.current);
      speechTimeoutRef.current = null;
    }

    setSpeakingMessage(null);
  };

  // =====================================================
  // AI VOICE OUTPUT
  // =====================================================

  const speakMessage = (text, messageIndex) => {
    if (!text || !("speechSynthesis" in window)) {
      setError(
        "Voice output is not supported by this browser."
      );
      return;
    }

    const synth = window.speechSynthesis;

    // If same message is currently speaking -> stop
    if (speakingMessage === messageIndex) {
      stopSpeaking();
      return;
    }

    synth.cancel();
    setSpeakingMessage(null);

    const speak = () => {
      const speech =
        new SpeechSynthesisUtterance(text);

      speech.lang = voiceLanguage;
      speech.rate = 0.9;
      speech.pitch = 1;
      speech.volume = 1;

      const voices = synth.getVoices();

      const preferredVoice =
        voices.find(
          (voice) =>
            voice.lang.toLowerCase() ===
            voiceLanguage.toLowerCase()
        ) ||
        voices.find((voice) =>
          voice.lang
            .toLowerCase()
            .startsWith(
              voiceLanguage.split("-")[0].toLowerCase()
            )
        ) ||
        voices.find((voice) =>
          voice.lang.toLowerCase().startsWith("en")
        );

      if (preferredVoice) {
        speech.voice = preferredVoice;
      }

      speech.onstart = () => {
        setSpeakingMessage(messageIndex);
        setError("");
      };

      speech.onend = () => {
        setSpeakingMessage(null);
      };

      speech.onerror = (event) => {
        console.error(
          "Speech synthesis error:",
          event
        );

        setSpeakingMessage(null);

        setError(
          "Unable to play AI voice. Please try again."
        );
      };

      synth.speak(speech);
    };

    const voices = synth.getVoices();

    if (voices.length === 0) {
      synth.onvoiceschanged = () => {
        synth.onvoiceschanged = null;
        speak();
      };
    } else {
      speak();
    }
  };

  // Stop speech when leaving page
  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, []);

  // =====================================================
  // FETCH CONVERSATIONS
  // =====================================================

  const fetchConversations = async () => {
    try {
      setHistoryLoading(true);

      const data = await apiRequest("/conversations");

      if (data) {
        setConversations(data.conversations || []);
      }
    } catch (error) {
      console.error(
        "Conversation history error:",
        error
      );

      setError(
        "Unable to load conversation history."
      );
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  // =====================================================
  // AUTO SCROLL
  // =====================================================

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);

  // =====================================================
  // DATE FORMAT
  // =====================================================

  const formatConversationDate = (date) => {
    const conversationDate = new Date(date);
    const today = new Date();

    const startOfToday = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );

    const startOfConversationDay = new Date(
      conversationDate.getFullYear(),
      conversationDate.getMonth(),
      conversationDate.getDate()
    );

    const difference =
      (startOfToday - startOfConversationDay) /
      (1000 * 60 * 60 * 24);

    if (difference === 0) {
      return "Today";
    }

    if (difference === 1) {
      return "Yesterday";
    }

    if (difference < 7) {
      return `${difference} days ago`;
    }

    return conversationDate.toLocaleDateString(
      "en-US",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  };

  // =====================================================
  // NEW CHAT
  // =====================================================

  const startNewChat = () => {
    stopSpeaking();

    if (isListening && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Ignore.
      }
    }

    setIsListening(false);
    setConversationId(null);
    setMessages([{ ...WELCOME_MESSAGE }]);
    setInput("");
    setError("");
  };

  // =====================================================
  // OPEN CONVERSATION
  // =====================================================

  const openConversation = async (id) => {
    try {
      stopSpeaking();

      setError("");

      const data = await apiRequest(
        `/conversations/${id}`
      );

      if (!data || !data.conversation) {
        throw new Error(
          "Unable to open conversation"
        );
      }

      setConversationId(data.conversation._id);

      const formattedMessages =
        data.conversation.messages.map(
          (message) => ({
            role:
              message.role === "assistant"
                ? "ai"
                : "user",
            content: message.content,
            safety: false,
          })
        );

      setMessages(
        formattedMessages.length > 0
          ? formattedMessages
          : [{ ...WELCOME_MESSAGE }]
      );
    } catch (error) {
      console.error(
        "Open conversation error:",
        error
      );

      setError(
        error.message ||
          "Unable to open this conversation."
      );
    }
  };

  // =====================================================
  // DELETE CONVERSATION
  // =====================================================

  const deleteConversation = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this conversation?"
    );

    if (!confirmed) return;

    try {
      setError("");

      await apiRequest(
        `/conversations/${id}`,
        {
          method: "DELETE",
        }
      );

      setConversations((prev) =>
        prev.filter(
          (conversation) =>
            conversation._id !== id
        )
      );

      if (conversationId === id) {
        startNewChat();
      }
    } catch (error) {
      console.error(
        "Delete conversation error:",
        error
      );

      setError(
        error.message ||
          "Unable to delete conversation."
      );
    }
  };

  // =====================================================
  // SEND MESSAGE
  // =====================================================

  const sendMessage = async (e) => {
    e.preventDefault();

    const userMessage = input.trim();

    if (!userMessage || loading) {
      return;
    }

    if (userMessage.length > MAX_MESSAGE_LENGTH) {
      setError(
        `Message cannot exceed ${MAX_MESSAGE_LENGTH} characters.`
      );
      return;
    }

    stopSpeaking();

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: userMessage,
        safety: false,
      },
    ]);

    setInput("");
    setError("");
    setLoading(true);

    try {
      const data = await apiRequest("/ai/chat", {
        method: "POST",
        body: JSON.stringify({
          message: userMessage,
          conversationId: conversationId,
        }),
      });

      if (!data) {
        return;
      }

      const aiReply =
        data.reply ||
        "I'm here to listen and support you.";

      // Update conversation ID
      if (data.conversationId) {
        setConversationId(data.conversationId);
      }

      // Safety response
      if (data.safety) {
        setMessages((prev) => [
          ...prev,
          {
            role: "ai",
            content: aiReply,
            safety: true,
          },
        ]);
      } else {
        // Add empty AI message first
        setMessages((prev) => [
          ...prev,
          {
            role: "ai",
            content: "",
            safety: false,
          },
        ]);

        let currentText = "";

        for (const character of aiReply) {
          currentText += character;

          await new Promise((resolve) =>
            setTimeout(resolve, 10)
          );

          setMessages((prev) => {
            const updated = [...prev];

            updated[updated.length - 1] = {
              role: "ai",
              content: currentText,
              safety: false,
            };

            return updated;
          });
        }
      }

      await fetchConversations();
    } catch (error) {
      console.error(
        "AI Companion Error:",
        error
      );

      setError(
        error.message ||
          "MindCare AI is temporarily unavailable. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // QUICK PROMPT
  // =====================================================

  const usePrompt = (prompt) => {
    setInput(prompt);
    setError("");

    setTimeout(() => {
      document
        .getElementById("companion-input")
        ?.focus();
    }, 50);
  };

  // =====================================================
  // CHARACTER COUNT
  // =====================================================

  const characterCount = input.length;

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* =================================================
          NAVBAR
      ================================================= */}

      <nav className="border-b border-white/10 bg-slate-950/90 backdrop-blur-xl">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-5">

          <Link
            to="/dashboard"
            className="text-lg font-bold tracking-tight sm:text-xl"
          >
            🧠 MindCare{" "}
            <span className="text-cyan-400">
              AI
            </span>
          </Link>

          <Link
            to="/dashboard"
            className="rounded-xl border border-white/10 px-3 py-2 text-xs text-slate-300 transition hover:bg-white/10 sm:px-4 sm:text-sm"
          >
            ← Dashboard
          </Link>

        </div>

      </nav>

      {/* =================================================
          MAIN
      ================================================= */}

      <main className="mx-auto max-w-7xl px-2 py-3 sm:px-4 sm:py-6">

        <div className="grid min-h-[calc(100vh-100px)] overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] shadow-2xl sm:rounded-3xl lg:min-h-[calc(100vh-130px)] lg:grid-cols-[280px_1fr]">

          {/* =================================================
              SIDEBAR
          ================================================= */}

          <aside className="border-b border-white/10 bg-slate-900/50 lg:border-b-0 lg:border-r">

            <div className="p-3 sm:p-4">

              <button
                onClick={startNewChat}
                className="w-full rounded-xl bg-cyan-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 active:scale-[0.98]"
              >
                + New Chat
              </button>

            </div>

            <div className="px-3 pb-3 sm:px-4">

              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Conversations
              </p>

            </div>

            <div className="max-h-[220px] space-y-2 overflow-y-auto px-3 pb-4 lg:max-h-[500px]">

              {historyLoading ? (
                <div className="space-y-2 px-2 py-4">
                  <div className="h-3 w-3/4 animate-pulse rounded bg-white/10"></div>
                  <div className="h-3 w-1/2 animate-pulse rounded bg-white/5"></div>
                </div>
              ) : conversations.length === 0 ? (
                <p className="px-2 py-4 text-sm text-slate-500">
                  No previous conversations yet.
                </p>
              ) : (
                conversations.map(
                  (conversation) => (
                    <div
                      key={conversation._id}
                      className={`group flex items-center gap-2 rounded-xl border p-2 transition ${
                        conversationId ===
                        conversation._id
                          ? "border-cyan-400/30 bg-cyan-400/10"
                          : "border-transparent hover:border-white/10 hover:bg-white/5"
                      }`}
                    >

                      <button
                        onClick={() =>
                          openConversation(
                            conversation._id
                          )
                        }
                        className="min-w-0 flex-1 text-left"
                      >

                        <p className="truncate text-sm text-slate-200">
                          {conversation.title ||
                            "New Conversation"}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {formatConversationDate(
                            conversation.updatedAt
                          )}
                        </p>

                      </button>

                      <button
                        onClick={() =>
                          deleteConversation(
                            conversation._id
                          )
                        }
                        className="rounded-lg px-2 py-1 text-slate-500 transition hover:bg-red-500/10 hover:text-red-400 lg:opacity-0 lg:group-hover:opacity-100"
                        title="Delete conversation"
                      >
                        🗑️
                      </button>

                    </div>
                  )
                )
              )}

            </div>

          </aside>

          {/* =================================================
              CHAT AREA
          ================================================= */}

          <section className="flex min-h-[calc(100vh-100px)] flex-col lg:min-h-[calc(100vh-130px)]">

            {/* HEADER */}

            <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3 sm:px-5 sm:py-4">

              <div className="flex items-center gap-3">

                <div className="relative">

                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-500/10 text-lg sm:h-11 sm:w-11 sm:text-xl">
                    🤖
                  </div>

                  <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-slate-950 bg-green-400"></span>

                </div>

                <div>

                  <h1 className="text-sm font-semibold sm:text-base">
                    MindCare AI Companion
                  </h1>

                  <p className="text-xs text-green-400">
                    ● Online • Wellness Support
                  </p>

                </div>

              </div>

              {/* Voice language */}

              <div className="hidden sm:block">

                <select
                  value={voiceLanguage}
                  onChange={(e) =>
                    setVoiceLanguage(
                      e.target.value
                    )
                  }
                  className="rounded-lg border border-white/10 bg-slate-900 px-2 py-1.5 text-xs text-slate-300 outline-none focus:border-cyan-400"
                  title="Voice language"
                >
                  <option value="en-US">
                    English
                  </option>

                  <option value="en-IN">
                    English India
                  </option>

                  <option value="hi-IN">
                    Hindi
                  </option>
                </select>

              </div>

            </div>

            {/* =================================================
                SAFETY NOTICE
            ================================================= */}

            <div className="mx-3 mt-3 rounded-2xl border border-cyan-400/10 bg-cyan-400/5 px-3 py-3 sm:mx-5 sm:mt-4 sm:px-4">

              <div className="flex items-start gap-3">

                <div className="text-lg">
                  💙
                </div>

                <div>

                  <p className="text-sm font-semibold text-cyan-300">
                    A safe space to share
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-400">
                    MindCare AI offers supportive
                    wellness conversations. It does
                    not diagnose conditions or replace
                    professional care.
                  </p>

                </div>

              </div>

            </div>

            {/* =================================================
                MOBILE VOICE LANGUAGE
            ================================================= */}

            <div className="px-3 pt-3 sm:hidden">

              <select
                value={voiceLanguage}
                onChange={(e) =>
                  setVoiceLanguage(
                    e.target.value
                  )
                }
                className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-xs text-slate-300 outline-none focus:border-cyan-400"
              >
                <option value="en-US">
                  🎤 English
                </option>

                <option value="en-IN">
                  🎤 English India
                </option>

                <option value="hi-IN">
                  🎤 Hindi
                </option>
              </select>

            </div>

            {/* =================================================
                QUICK PROMPTS
            ================================================= */}

            {messages.length === 1 &&
              !loading && (
                <div className="px-3 pt-4 sm:px-5">

                  <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Try asking
                  </p>

                  <div className="grid gap-2 sm:grid-cols-2">

                    {[
                      "I'm feeling stressed today.",
                      "I'm feeling low. Can we talk?",
                      "Help me build a positive daily routine.",
                      "Give me a simple calming exercise.",
                    ].map((prompt) => (
                      <button
                        key={prompt}
                        type="button"
                        onClick={() =>
                          usePrompt(prompt)
                        }
                        className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-left text-sm text-slate-300 transition hover:border-cyan-400/30 hover:bg-cyan-400/5 hover:text-cyan-300 active:scale-[0.99]"
                      >
                        {prompt}
                      </button>
                    ))}

                  </div>

                </div>
              )}

            {/* =================================================
                MESSAGES
            ================================================= */}

            <div className="flex-1 space-y-5 overflow-y-auto p-3 sm:p-5">

              {messages.map(
                (message, index) => (

                  <div
                    key={index}
                    className={`flex ${
                      message.role === "user"
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >

                    <div
                      className={`max-w-[92%] rounded-2xl px-4 py-3 text-sm leading-6 sm:max-w-[85%] ${
                        message.role === "user"
                          ? "rounded-br-md bg-cyan-500 text-slate-950"
                          : message.safety
                          ? "rounded-bl-md border border-red-400/30 bg-red-500/10 text-red-100"
                          : "rounded-bl-md border border-white/10 bg-slate-900 text-slate-200"
                      }`}
                    >

                      {/* Safety label */}

                      {message.role ===
                        "ai" &&
                        message.safety && (
                          <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-400/20 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-300">
                            🚨 Safety Support
                          </div>
                        )}

                      <div className="break-words">
                        {message.role === "ai"
                          ? formatAIMessage(
                              message.content
                            )
                          : message.content}
                      </div>

                      {/* Voice */}

                      {message.role ===
                        "ai" &&
                        message.content && (
                          <button
                            type="button"
                            onClick={() =>
                              speakMessage(
                                message.content,
                                index
                              )
                            }
                            className={`mt-3 rounded-lg border px-3 py-1.5 text-xs transition ${
                              speakingMessage ===
                              index
                                ? "border-cyan-400/40 bg-cyan-400/10 text-cyan-300"
                                : "border-white/10 text-slate-400 hover:border-cyan-400/30 hover:text-cyan-300"
                            }`}
                          >
                            {speakingMessage ===
                            index
                              ? "⏹ Stop Voice"
                              : "🔊 Listen"}
                          </button>
                        )}

                    </div>

                  </div>

                )
              )}

              <div ref={messagesEndRef} />

              {/* =================================================
                  QUICK ACTIONS
              ================================================= */}

              {messages.length > 1 &&
                !loading && (
                  <div className="mt-2 flex flex-wrap gap-2">

                    {[
                      "Give me a simple wellness tip.",
                      "Help me calm down.",
                      "Suggest a positive activity.",
                      "Help me start a healthy routine.",
                    ].map((action) => (
                      <button
                        key={action}
                        type="button"
                        onClick={() =>
                          usePrompt(action)
                        }
                        className="rounded-full border border-cyan-400/20 bg-cyan-400/5 px-3 py-2 text-xs text-cyan-300 transition hover:border-cyan-400/40 hover:bg-cyan-400/10"
                      >
                        {action}
                      </button>
                    ))}

                  </div>
                )}

              {/* =================================================
                  TYPING INDICATOR
              ================================================= */}

              {loading && (
                <div className="flex justify-start">

                  <div className="rounded-2xl rounded-bl-md border border-white/10 bg-slate-900 px-5 py-4">

                    <div className="flex gap-1">

                      <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400"></span>

                      <span
                        className="h-2 w-2 animate-bounce rounded-full bg-slate-400"
                        style={{
                          animationDelay:
                            "150ms",
                        }}
                      ></span>

                      <span
                        className="h-2 w-2 animate-bounce rounded-full bg-slate-400"
                        style={{
                          animationDelay:
                            "300ms",
                        }}
                      ></span>

                    </div>

                  </div>

                </div>
              )}

            </div>

            {/* =================================================
                ERROR
            ================================================= */}

            {error && (
              <div className="mx-3 mb-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300 sm:mx-5">
                {error}
              </div>
            )}

            {/* =================================================
                INPUT
            ================================================= */}

            <form
              onSubmit={sendMessage}
              className="border-t border-white/10 p-3 sm:p-4"
            >

              <div className="flex gap-2 sm:gap-3">

                {/* TEXT INPUT */}

                <input
                  id="companion-input"
                  type="text"
                  value={input}
                  maxLength={MAX_MESSAGE_LENGTH}
                  onChange={(e) =>
                    setInput(e.target.value)
                  }
                  placeholder={
                    isListening
                      ? "Listening..."
                      : "Share what's on your mind..."
                  }
                  className={`min-w-0 flex-1 rounded-2xl border bg-slate-900 px-3 py-3 text-sm text-white outline-none placeholder:text-slate-500 sm:px-4 ${
                    isListening
                      ? "border-red-400/50"
                      : "border-white/10 focus:border-cyan-400"
                  }`}
                  disabled={loading}
                />

                {/* MICROPHONE */}

                <button
                  type="button"
                  onClick={toggleVoiceInput}
                  disabled={
                    loading ||
                    !voiceSupported
                  }
                  title={
                    !voiceSupported
                      ? "Voice input is not supported"
                      : isListening
                      ? "Stop listening"
                      : "Voice input"
                  }
                  className={`flex items-center justify-center rounded-2xl px-3 py-3 text-lg transition sm:px-4 ${
                    isListening
                      ? "animate-pulse bg-red-500 text-white"
                      : "border border-white/10 bg-slate-900 text-slate-300 hover:border-cyan-400/30 hover:text-cyan-300"
                  } disabled:cursor-not-allowed disabled:opacity-40`}
                >
                  {isListening
                    ? "⏹️"
                    : "🎤"}
                </button>

                {/* SEND */}

                <button
                  type="submit"
                  disabled={
                    loading ||
                    !input.trim()
                  }
                  className="rounded-2xl bg-cyan-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-40 sm:px-6"
                >
                  {loading ? "..." : "Send"}
                </button>

              </div>

              {/* INPUT INFO */}

              <div className="mt-2 flex items-center justify-between px-1">

                <div>

                  {isListening && (
                    <p className="text-xs text-red-300">
                      🎤 Listening... speak clearly
                    </p>
                  )}

                </div>

                <p
                  className={`text-xs ${
                    characterCount >
                    MAX_MESSAGE_LENGTH *
                      0.9
                      ? "text-amber-400"
                      : "text-slate-600"
                  }`}
                >
                  {characterCount}/
                  {MAX_MESSAGE_LENGTH}
                </p>

              </div>

              <p className="mt-2 text-center text-xs leading-5 text-slate-500">
                MindCare AI provides wellness
                support and is not a replacement
                for professional or emergency care.
              </p>

            </form>

          </section>

        </div>

      </main>

    </div>
  );
}

export default Companion;