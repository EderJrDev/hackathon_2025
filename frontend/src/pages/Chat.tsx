import { useState, useRef, useEffect } from "react";
import {
  Paperclip,
  ThumbsUp,
  ThumbsDown,
  Copy,
  Bot,
  User,
  Mic,
  Square,
  Plus,
  Minus,
} from "lucide-react";

import {
  startChat,
  uploadExam,
  type AuthorizeResponseDTO,
  startAppointment,
} from "../lib/chatApi";

type Sender = "user" | "bot";

export default function Chat() {
  interface UiMessage {
    sender: Sender;
    text?: string;
    html?: string;
    imageUrl?: string;
  }

  const [messages, setMessages] = useState<UiMessage[]>([]);
  const [input, setInput] = useState("");
  const [loadingAsk, setLoadingAsk] = useState(false);
  const [loadingUpload, setLoadingUpload] = useState(false);
  const loading = loadingAsk || loadingUpload;
  const [appointmentActive, setAppointmentActive] = useState(false);
  const [appointmentSessionId, setAppointmentSessionId] = useState<
    string | null
  >(null);
  const [fontScale, setFontScale] = useState<number>(
    () => Number(localStorage.getItem("chat:fontScale")) || 100
  );
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const textInputRef = useRef<HTMLInputElement | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);
  // Keep input focused on mount and after bot responses/uploads finish
  useEffect(() => {
    textInputRef.current?.focus();
  }, []);
  useEffect(() => {
    if (!loadingAsk && !loadingUpload) {
      textInputRef.current?.focus();
    }
  }, [loadingAsk, loadingUpload, messages.length]);

  // Persist font scale changes
  useEffect(() => {
    localStorage.setItem("chat:fontScale", String(fontScale));
  }, [fontScale]);

  // Voice recognition helpers
  function startRecording() {
    if (loading) return; // avoid conflicts during requests
    const SR =
      (window as any).webkitSpeechRecognition ||
      (window as any).SpeechRecognition;
    if (!SR) {
      // Fallback message if not supported
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text:
            "Seu navegador não suporta ditado por voz. Use o teclado para digitar sua mensagem.",
        },
      ]);
      return;
    }
    const recog = new SR();
    recog.lang = "pt-BR";
    recog.interimResults = true;
    recog.continuous = false;
    recog.onresult = (event: any) => {
      let interim = "";
      let final = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) final += transcript + " ";
        else interim += transcript + " ";
      }
      if (final) {
        setInput((prev) => (prev ? prev + " " : "") + final.trim());
      } else if (interim) {
        // show interim transcript appended (non-destructive)
        setInput((prev) => {
          const base = prev.replace(/\s*\(falando\.{3}.*\)$/u, "").trim();
          return `${base}`;
        });
      }
    };
    recog.onerror = () => {
      setIsRecording(false);
      recognitionRef.current = null;
    };
    recog.onend = () => {
      setIsRecording(false);
      recognitionRef.current = null;
      // Remove any interim marker "(falando...)" e enviar automaticamente
      let cleaned = "";
      setInput((prev) => {
        cleaned = prev.replace(/\s*\(falando\.{3}.*\)$/u, "").trim();
        return cleaned;
      });
      // Aguarda a atualização do estado antes de enviar
      setTimeout(() => {
        if (cleaned && !loading) {
          handleSend();
        }
      }, 50);
    };
    try {
      recognitionRef.current = recog;
      setIsRecording(true);
      recog.start();
    } catch (_) {
      setIsRecording(false);
      recognitionRef.current = null;
    }
  }

  function stopRecording() {
    try {
      recognitionRef.current?.stop?.();
    } finally {
      setIsRecording(false);
    }
  }

  function toggleRecording() {
    if (isRecording) stopRecording();
    else startRecording();
  }

  function increaseFont() {
    setFontScale((s) => Math.min(150, s + 10));
  }
  function decreaseFont() {
    setFontScale((s) => Math.max(90, s - 10));
  }

  // Front não classifica mais; delega ao /ask e reage à diretiva

  // Escapa conteúdo de texto para HTML seguro
  function escapeHtml(s: string): string {
    return s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  // Converte respostas em texto simples em HTML com parágrafos e lista após
  // o marcador "Mas posso orientar com:" quando presente
  function normalizeAskHtml(input: string): string {
    if (!input) return "<p>...</p>";
    // Se já parece HTML, retorna como está
    if (/<[a-z][\s\S]*>/i.test(input)) return input;

    const rawLines = input.split(/\r?\n/).map((l) => l.trim());
    const lines = rawLines.filter((l, idx) => !(l === "" && rawLines[idx - 1] === ""));

    const idxOrient = lines.findIndex((l) => l.toLowerCase().includes("mas posso orientar"));
    const out: string[] = [];

    function pushParagraphBlock(block: string[]) {
      const text = block.join(" ").trim();
      if (text) out.push(`<p>${escapeHtml(text)}</p>`);
    }

    if (idxOrient >= 0) {
      // Parte anterior ao marcador -> parágrafo(s)
      const before = lines.slice(0, idxOrient + 1); // mantém a frase do marcador no parágrafo anterior
      pushParagraphBlock(before);

      // Itens de lista após o marcador até quebra lógica
      let j = idxOrient + 1;
      const lis: string[] = [];
      while (
        j < lines.length &&
        lines[j] !== "" &&
        !/^pode\b/i.test(lines[j]) &&
        !/[.!?]$/.test(lines[j])
      ) {
        lis.push(`<li>${escapeHtml(lines[j])}</li>`);
        j++;
      }
      if (lis.length) out.push(`<ul class="list-disc pl-6">${lis.join("")}</ul>`);

      // Restante -> parágrafos por blocos separados por linha em branco
      let k = j;
      let buffer: string[] = [];
      for (; k < lines.length; k++) {
        const l = lines[k];
        if (l === "") {
          pushParagraphBlock(buffer);
          buffer = [];
        } else {
          buffer.push(l);
        }
      }
      pushParagraphBlock(buffer);
    } else {
      // Sem marcador: converte blocos separados por linha em branco em parágrafos
      let buffer: string[] = [];
      for (const l of lines) {
        if (l === "") {
          pushParagraphBlock(buffer);
          buffer = [];
        } else {
          buffer.push(l);
        }
      }
      pushParagraphBlock(buffer);
    }

    return out.join("");
  }

  // Evita duplicação de números em listas ordenadas quando o conteúdo já inclui "1.", "2.", etc.
  function cleanDuplicateListNumbers(html: string): string {
    if (!html) return html;
    try {
      // Apenas em ambiente de navegador
      if (typeof DOMParser === "undefined") return html;
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");
      const ols = Array.from(doc.querySelectorAll("ol"));
      for (const ol of ols) {
        const lis = Array.from(ol.querySelectorAll(":scope > li"));
        if (!lis.length) continue;
        let withNumberPrefix = 0;
        for (const li of lis) {
          const text = (li.textContent || "").trim();
          if (/^\d+([.)]|º)?\s+/.test(text)) withNumberPrefix++;
        }
        // Se a maioria dos itens já começa com número no texto, ocultamos o marcador do OL
        if (withNumberPrefix >= Math.ceil(lis.length * 0.8)) {
          const style = ol.getAttribute("style") || "";
          const needsSemicolon = style && !style.trim().endsWith(";");
          const newStyle = `${style}${needsSemicolon ? ";" : ""}list-style: none; padding-left: 1rem;`;
          ol.setAttribute("style", newStyle);
        }
      }
      return doc.body.innerHTML;
    } catch {
      return html;
    }
  }

  function sanitizeHtmlOutput(html: string): string {
    if (!html) return html;
    // Podem ser aplicadas outras sanitizações aqui no futuro
    return cleanDuplicateListNumbers(html);
  }

  function ensureAppointmentSession(): string {
    if (appointmentSessionId) return appointmentSessionId;
    const sid = `sess-${Date.now().toString(36)}-${Math.random()
      .toString(36)
      .slice(2, 8)}`;
    setAppointmentSessionId(sid);
    return sid;
  }

  function isAppointmentClosed(text: string): boolean {
    const t = text.toLowerCase();
    return (
      t.includes("encerrado") ||
      t.includes("encerrada") ||
      t.includes("cancelado") ||
      t.includes("cancelada") ||
      t.includes("cancelamento") ||
      t.includes("finalizado") ||
      t.includes("finalizada") ||
      t.includes("protocolo") // muitas vezes o encerramento vem junto com um protocolo
    );
  }

  async function handleSend() {
    if (!input.trim() || loadingAsk) return;
    const text = input.trim();
    setMessages((prev) => [...prev, { sender: "user", text }]);
    setInput("");
    setLoadingAsk(true);
    try {
      // If appointment flow already active, keep using appointment route
      if (appointmentActive && appointmentSessionId) {
        const res = await startAppointment({
          sessionId: appointmentSessionId,
          message: text,
        });
  const reply = res.reply || "...";
  const sanitized = sanitizeHtmlOutput(reply);
  setMessages((prev) => [...prev, { sender: "bot", html: sanitized }]);
        // End flow if backend signaled closure
        if (isAppointmentClosed(reply)) {
          setAppointmentActive(false);
          setAppointmentSessionId(null);
        }
        return;
      }
      // Sempre chama /ask primeiro; ele decide se responde HTML ou direciona rota
      const askRes = await startChat({ message: text });
      if ("route" in askRes) {
        if (askRes.route === "appointment") {
          const sessionId = ensureAppointmentSession();
          setAppointmentActive(true);
          const appRes = await startAppointment({ sessionId, message: text });
          const reply = appRes.reply || "...";
          const sanitized = sanitizeHtmlOutput(reply);
          setMessages((prev) => [...prev, { sender: "bot", html: sanitized }]);
          if (isAppointmentClosed(reply)) {
            setAppointmentActive(false);
            setAppointmentSessionId(null);
          }
          return;
        }
        if (askRes.route === "exams") {
          // Orienta e abre o picker
          setMessages((prev) => [
            ...prev,
            {
              sender: "bot",
              text: "Claro! Para autorizar seu exame, anexe a foto/PDF do pedido (ou guia) clicando no clipe. Assim que o arquivo for enviado, eu faço a análise e retorno o status.",
            },
          ]);
          fileInputRef.current?.click();
          return;
        }
      } else {
  const htmlNormalized = normalizeAskHtml(askRes.html || "");
  const sanitized = sanitizeHtmlOutput(htmlNormalized);
  console.log('htmlNormalized', sanitized)
  setMessages((prev) => [...prev, { sender: "bot", html: sanitized }]);
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Desculpe, ocorreu um erro. Tente novamente." },
      ]);
    } finally {
      setLoadingAsk(false);
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    // Foca no input após clicar na sugestão para facilitar o envio
    textInputRef.current?.focus();
  };

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      if (isRecording) stopRecording();
      handleSend();
    }
  }
  function formatAuthorizeResponse(res: AuthorizeResponseDTO): string {
    const parts: string[] = [];
    if (res.patient) {
      const { name, birthDate, docDate } = res.patient;
      const patientLine = [
        name && `Paciente: ${name}`,
        birthDate && `Nascimento: ${birthDate}`,
        docDate && `Data doc.: ${docDate}`,
      ]
        .filter(Boolean)
        .join(" | ");
      if (patientLine) parts.push(patientLine);
    }
    if (res.procedures?.length) {
      parts.push("Resultado dos procedimentos:");
      for (const p of res.procedures) {
        const base = `• ${p.inputName}`;
        let decision: string;
        switch (p.decision) {
          case "AUTHORIZED":
            decision = "Autorizado ✅";
            break;
          case "DENIED_NO_COVER":
            decision = "Negado (sem cobertura) ❌";
            break;
          case "PENDING_AUDIT_5D":
            decision = `Pendente de auditoria (${p.slaDays ?? 5} dias) ⏳`;
            break;
          case "PENDING_AUDIT_10D":
            decision = `Pendente de auditoria (${p.slaDays ?? 10} dias) ⏳`;
            break;
          default:
            decision = p.decision;
        }
        parts.push(`${base}: ${decision}`);
        parts.push(` - Protocolo: ${res.protocolBatch}`);
        if (p.reason) parts.push(` - Motivo: ${p.reason}`);
      }
    }
    return parts.join("\n");
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const inputEl = e.currentTarget;
    const file = e.target.files?.[0];
    if (!file) return;
    // show local preview or filename immediately
    if (file.type.startsWith("image/")) {
      const imageUrl = URL.createObjectURL(file);
      setMessages((prev) => [...prev, { sender: "user", imageUrl }]);
    } else {
      setMessages((prev) => [
        ...prev,
        { sender: "user", text: `Arquivo enviado: ${file.name}` },
      ]);
    }
    setLoadingUpload(true);
    try {
      const res = await uploadExam(file);
      const text =
        formatAuthorizeResponse(res) ||
        "Recebi o arquivo e processei as informações.";
      setMessages((prev) => [...prev, { sender: "bot", text }]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "Não consegui processar o arquivo. Tente novamente com uma imagem nítida (PNG, JPG, PDF).",
        },
      ]);
    } finally {
      setLoadingUpload(false);
      // reset input so same file can be reselected if needed
      if (inputEl) inputEl.value = "";
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  const suggestionChips = [
    "Agendar consulta",
    "2ª via do boleto",
    "Autorizar de exames",
  ];

  return (
    <div
      className="flex flex-col h-full min-h-0 bg-gray-50 text-gray-800"
      style={{ fontSize: `${fontScale}%` }}
    >
      {/* Área de mensagens */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Acessibilidade: controles de fonte */}
        <div className="sticky top-0 z-10 flex justify-end gap-2 mb-1">
          <div className="bg-white/80 backdrop-blur border border-gray-200 rounded-full px-2 py-1 flex items-center gap-1">
            <button
              type="button"
              onClick={decreaseFont}
              aria-label="Diminuir tamanho da fonte"
              className="p-1 text-gray-600 hover:text-green-700"
              title="Diminuir fonte"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="text-xs text-gray-600 tabular-nums" aria-live="polite">
              {fontScale}%
            </span>
            <button
              type="button"
              onClick={increaseFont}
              aria-label="Aumentar tamanho da fonte"
              className="p-1 text-gray-600 hover:text-green-700"
              title="Aumentar fonte"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
        {messages.length === 0 && !loading ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="bg-green-100 p-4 rounded-full mb-4">
              <Bot className="w-12 h-12 text-green-700" />
            </div>
            <h1 className="text-xl font-bold text-gray-800">
              Olá! Sou a Ana, sua assistente virtual.
            </h1>
            <p className="text-gray-600 mt-1">Como posso te ajudar hoje?</p>
            <div className="flex flex-wrap justify-center gap-2 mt-6">
              {suggestionChips.map((chip) => (
                <button
                  key={chip}
                  onClick={() => handleSuggestionClick(chip)}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-full text-sm text-green-700 hover:bg-green-50 transition-colors"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((m, i) => (
            <div
              key={i}
              className={`flex items-end gap-3 ${
                m.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {m.sender === "bot" && (
                <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-5 h-5 text-white" />
                </div>
              )}
              <div
                className={`flex flex-col w-full max-w-[80%] ${
                  m.sender === "user" ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`p-3 rounded-2xl break-words ${
                    m.sender === "user"
                      ? "bg-green-600 text-white rounded-br-lg"
                      : "bg-white text-gray-800 rounded-bl-lg border border-gray-200"
                  }`}
                >
                  {m.text && <p className="whitespace-pre-wrap">{m.text}</p>}
                  {m.html && (
                    <div
                      className="prose prose-sm max-w-none prose-p:my-2 prose-ul:my-2 prose-ol:my-2"
                      dangerouslySetInnerHTML={{ __html: m.html }}
                    />
                  )}
                  {m.imageUrl && (
                    <img
                      src={m.imageUrl}
                      alt="Uploaded"
                      className="max-w-full rounded-lg mt-2"
                    />
                  )}
                </div>
                {m.sender === "bot" && (
                  <div className="flex space-x-2 mt-2 text-gray-400">
                    <button
                      title="Gostei"
                      className="hover:text-green-600 transition-colors"
                    >
                      <ThumbsUp className="h-4 w-4" />
                    </button>
                    <button
                      title="Não gostei"
                      className="hover:text-red-600 transition-colors"
                    >
                      <ThumbsDown className="h-4 w-4" />
                    </button>
                    <button
                      title="Copiar"
                      onClick={() => {
                        if (m.text) {
                          navigator.clipboard.writeText(m.text);
                        } else if (m.html) {
                          const tmp = document.createElement("div");
                          tmp.innerHTML = m.html;
                          const plain = tmp.innerText;
                          navigator.clipboard.writeText(plain);
                        }
                      }}
                      className="hover:text-blue-600 transition-colors"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
              {m.sender === "user" && (
                <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-gray-600" />
                </div>
              )}
            </div>
          ))
        )}
        {loading && (
          <div className="flex items-end gap-3 justify-start">
            <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="p-3 rounded-2xl bg-white rounded-bl-lg border border-gray-200">
              <div className="flex items-center justify-center gap-1.5">
                <span className="h-2 w-2 bg-green-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="h-2 w-2 bg-green-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="h-2 w-2 bg-green-500 rounded-full animate-bounce"></span>
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-gray-200">
        <div className="relative">
          <input
            id="chat-input"
            ref={textInputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={loading ? "Aguarde..." : "Digite sua mensagem..."}
            disabled={loading}
            className="w-full py-3 pl-4 pr-40 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800 transition-shadow"
            autoFocus
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center">
            <label
              className="p-2 text-gray-500 hover:text-green-600 cursor-pointer"
              aria-label="Anexar arquivo"
              title="Anexar arquivo"
            >
              <Paperclip className="h-5 w-5" />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,application/pdf"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
            <button
              type="button"
              onClick={toggleRecording}
              disabled={loading}
              aria-pressed={isRecording}
              aria-label={isRecording ? "Parar gravação" : "Iniciar gravação por voz"}
              title={isRecording ? "Parar gravação" : "Falar"}
              className={`p-2 rounded-full transition-colors ${
                isRecording
                  ? "bg-red-100 text-red-700 hover:bg-red-200"
                  : "text-gray-500 hover:text-green-600"
              }`}
            >
              {isRecording ? (
                <Square className="h-5 w-5" />
              ) : (
                <Mic className="h-5 w-5" />
              )}
            </button>
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="p-2 bg-green-600 text-white rounded-full hover:bg-green-700 disabled:bg-green-300 disabled:cursor-not-allowed transition-colors"
              title="Enviar"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-6 h-6"
              >
                <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
