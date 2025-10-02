export type User = {
  id: string;
  name: string;
  avatar: string;
  online: boolean;
};

export type Message = {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
};

export type Chat = {
  id: string;
  participants: User[];
  messages: Message[];
  unreadCount: number;
};

export const currentUser: User = {
  id: 'user-0',
  name: 'You',
  avatar: 'https://i.pravatar.cc/150?u=you',
  online: true,
};

export const users: User[] = [
  currentUser,
  { id: 'user-1', name: 'Alice', avatar: 'https://i.pravatar.cc/150?u=Alice', online: true },
  { id: 'user-2', name: 'Bob', avatar: 'https://i.pravatar.cc/150?u=Bob', online: false },
  { id: 'user-3', name: 'Charlie', avatar: 'https://i.pravatar.cc/150?u=Charlie', online: true },
];

export const chats: Chat[] = [
  {
    id: 'chat-1',
    participants: [users[1]],
    messages: [
      { id: 'msg-1', senderId: 'user-1', content: 'Hey, how are you?', timestamp: '10:00 AM' },
      { id: 'msg-2', senderId: 'user-0', content: 'I am good, thanks! How about you?', timestamp: '10:01 AM' },
      { id: 'msg-3', senderId: 'user-1', content: 'Doing great! Just working on the new project.', timestamp: '10:02 AM' },
    ],
    unreadCount: 1,
  },
  {
    id: 'chat-2',
    participants: [users[2]],
    messages: [
      { id: 'msg-4', senderId: 'user-2', content: 'See you tomorrow!', timestamp: 'Yesterday' },
    ],
    unreadCount: 0,
  },
  {
    id: 'chat-3',
    participants: [users[3]],
    messages: [
      { id: 'msg-5', senderId: 'user-3', content: 'Thanks for the help!', timestamp: 'Yesterday' },
      { id: 'msg-6', senderId: 'user-0', content: 'No problem!', timestamp: 'Yesterday' },
    ],
    unreadCount: 2,
  },
];