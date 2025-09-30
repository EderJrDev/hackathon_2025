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
} from "../../lib/chatApi";
import MessagesEmpty from "./Components/MessagesEmpty";
import Messages from "./Components/Messages";
import Loader from "../../components/Loader";
import WrapperInput from "./Components/WrapperInput";

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

  useEffect(() => {
    textInputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!loadingAsk && !loadingUpload) {
      textInputRef.current?.focus();
    }
  }, [loadingAsk, loadingUpload, messages.length]);

  useEffect(() => {
    localStorage.setItem("chat:fontScale", String(fontScale));
  }, [fontScale]);

  function startRecording() {
    if (loading) return;
    const SR =
      (window as any).webkitSpeechRecognition ||
      (window as any).SpeechRecognition;
    if (!SR) {
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
      let cleaned = "";
      setInput((prev) => {
        cleaned = prev.replace(/\s*\(falando\.{3}.*\)$/u, "").trim();
        return cleaned;
      });

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

  function escapeHtml(s: string): string {
    return s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function normalizeAskHtml(input: string): string {
    if (!input) return "<p>...</p>";
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
      const before = lines.slice(0, idxOrient + 1);
      pushParagraphBlock(before);

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

  function cleanDuplicateListNumbers(html: string): string {
    if (!html) return html;
    try {
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
      t.includes("protocolo")
    );
  }

  async function handleSend() {
    if (!input.trim() || loadingAsk) return;
    const text = input.trim();
    setMessages((prev) => [...prev, { sender: "user", text }]);
    setInput("");
    setLoadingAsk(true);
    try {
      if (appointmentActive && appointmentSessionId) {
        const res = await startAppointment({
          sessionId: appointmentSessionId,
          message: text,
        });
        const reply = res.reply || "...";
        const sanitized = sanitizeHtmlOutput(reply);
        setMessages((prev) => [...prev, { sender: "bot", html: sanitized }]);
        if (isAppointmentClosed(reply)) {
          setAppointmentActive(false);
          setAppointmentSessionId(null);
        }
        return;
      }
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
      if (inputEl) inputEl.value = "";
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <div
      className="flex flex-col h-full min-h-0 bg-gray-50 text-gray-800"
      style={{ fontSize: `${fontScale}%` }}
    >
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
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
          <MessagesEmpty handleSuggestionClick={handleSuggestionClick} />
        ) : (
          messages.map((m, i) => (
            <Messages m={m} i={String(i)} key={i} />
          ))
        )}
        {loading && (
          <Loader />
        )}
        <div ref={bottomRef} />
      </div>
      <WrapperInput
        textInputRef={textInputRef}
        handleKeyDown={handleKeyDown}
        setInput={setInput}
        loading={loading}
        toggleRecording={toggleRecording}
        input={input}
        isRecording={isRecording}
        handleSend={handleSend}
        fileInputRef={fileInputRef}
        handleImageUpload={handleImageUpload}
      />
    </div>
  );
}
