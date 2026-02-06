/**
 * Chatbot API — all requests go through centralized API layer.
 */

import { api } from '@/lib/api';

export interface ChatbotMessageResponse {
  data?: { message?: string };
  message?: string;
}

/**
 * Send a message to the chatbot and return the reply text.
 */
export async function sendChatbotMessage(message: string): Promise<string> {
  const response = await api.post<
    ChatbotMessageResponse | { data: { message: string } }
  >('/chatbot/message', { message });
  const data = response as { data?: { message?: string }; message?: string };
  return (
    data?.data?.message ?? data?.message ?? 'Sorry, I could not get a response.'
  );
}
