export interface User {
  id: string;
  name: string;
  online: boolean;
}

export interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
}

export interface Chat {
  id: string;
  type: 'direct' | 'group';
  name?: string; // For group chats
  participants: User[];
  messages: Message[];
  unreadCount: number;
}

export const users: User[] = [
  { id: 'user-1', name: 'Alice', online: true },
  { id: 'user-2', name: 'Bob', online: false },
  { id: 'user-3', name: 'Charlie', online: true },
  { id: 'user-4', name: 'David', online: false },
];

export const currentUser = users[0];

export const chats: Chat[] = [
  {
    id: 'chat-1',
    type: 'direct',
    participants: [users[0], users[1]],
    messages: [
      { id: 'msg-1', senderId: 'user-1', content: 'Hey Bob!', timestamp: '2024-07-29T10:00:00Z', status: 'read' },
      { id: 'msg-2', senderId: 'user-2', content: 'Hey Alice! How are you?', timestamp: '2024-07-29T10:01:00Z', status: 'read' },
      { id: 'msg-3', senderId: 'user-1', content: 'I am good, thanks! How about you? Doing anything fun this weekend? I was thinking of going for a hike.', timestamp: '2024-07-29T10:01:30Z', status: 'delivered' },
    ],
    unreadCount: 1,
  },
  {
    id: 'chat-2',
    type: 'group',
    name: 'Project Team',
    participants: [users[0], users[2], users[3]],
    messages: [
      { id: 'msg-4', senderId: 'user-3', content: 'Team sync tomorrow at 10 AM?', timestamp: '2024-07-29T11:00:00Z', status: 'read' },
      { id: 'msg-5', senderId: 'user-1', content: 'Sounds good to me!', timestamp: '2024-07-29T11:01:00Z', status: 'read' },
    ],
    unreadCount: 0,
  },
  {
    id: 'chat-3',
    type: 'direct',
    participants: [users[0], users[3]],
    messages: [
      { id: 'msg-6', senderId: 'user-3', content: 'Can you review my PR when you have a moment?', timestamp: '2024-07-28T15:30:00Z', status: 'read' },
    ],
    unreadCount: 0,
  },
];