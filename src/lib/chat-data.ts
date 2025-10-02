export type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

export const initialMessages: Message[] = [
  {
    id: '1',
    role: 'assistant',
    content: 'Hello! How can I help you today?',
  },
  {
    id: '2',
    role: 'user',
    content: 'I want to build a chat interface in Next.js.',
  },
  {
    id: '3',
    role: 'assistant',
    content:
      'Great! Next.js is an excellent choice. Do you want to start with the UI components or set up the backend first?',
  },
];