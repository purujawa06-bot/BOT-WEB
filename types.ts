
import type React from 'react';

export enum Sender {
  User = 'user',
  Bot = 'bot',
}

export interface Message {
  id: number;
  text?: string;
  sender: Sender;
  component?: React.ReactNode;
}

export interface Command {
  name: string;
  description: string;
  value: string;
  requiresParam?: boolean;
  category: 'Umum' | 'Informasi' | 'AI';
}
