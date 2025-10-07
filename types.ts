
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
  category: 'Umum' | 'Informasi' | 'AI' | 'Alat';
}

export interface TiktokVideoData {
    type: 'nowatermark' | 'nowatermark_hd' | 'music';
    url: string;
}

export interface TiktokResult {
    title: string;
    cover: string;
    data: TiktokVideoData[];
    music_info: {
        title: string;
        url: string;
    };
    author: {
        nickname: string;
        avatar: string;
    };
}

export interface TiktokApiResponse {
    status: number;
    creator: string;
    result?: TiktokResult;
    message?: string; // For errors
}
