import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
export const api = axios.create({ baseURL: BASE_URL });

export async function startChat(payload: { text: string }) {
  console.log('Iniciando chat com payload:', payload);
  const { data } = await api.post('/chat/questions/ask', payload);
  return data as { reply: string; }
}

// ====== Exams upload (multipart/form-data) ======
export type ExamDecision =
  | 'AUTHORIZED'
  | 'DENIED_NO_COVER'
  | 'PENDING_AUDIT_5D'
  | 'PENDING_AUDIT_10D';

export interface ProcedureDecisionDTO {
  inputName: string;
  matchedExamId?: string;
  matchedName?: string;
  decision: ExamDecision;
  reason: string;
  slaDays?: number;
}

export interface AuthorizeResponseDTO {
  patient?: { name?: string; birthDate?: string; docDate?: string };
  procedures: ProcedureDecisionDTO[];
  source: 'gpt-json+db';
}

export async function uploadExam(file: File) {
  const form = new FormData();
  form.append('file', file);
  const { data } = await api.post('/chat/exams', form, {
    // Axios will set the correct Content-Type with boundary for FormData automatically.
  });
  return data as AuthorizeResponseDTO;
}
export async function sendMessage(sessionId: string, message: string) {
  const { data } = await api.post('/chat/message', { sessionId, message });
  return data as { reply: string; nameCaptured: string | null; dobCaptured: string | null };
}
export async function getHistory(sessionId: string) {
  const { data } = await api.get(`/chat/${sessionId}/history`);
  return data as {
    session: { id: string; name: string | null; dob: string | null };
    messages: { role: 'user' | 'assistant' | 'system'; content: string }[];
  };
}
