import { Command } from './types';

export const commands: Command[] = [
  { 
    name: '/ping', 
    description: 'Cek koneksi ke bot.', 
    value: '/ping', 
    category: 'Umum' 
  },
  { 
    name: '/ip', 
    description: 'Tampilkan alamat IP publik Anda.', 
    value: '/ip', 
    category: 'Informasi' 
  },
  { 
    name: '/ai [pertanyaan]', 
    description: 'Ajukan pertanyaan ke AI.', 
    value: '/ai', 
    requiresParam: true, 
    category: 'AI' 
  },
];

// Group commands by category for easier rendering in the menu
export const commandCategories = [
    { 
      name: 'Umum', 
      commands: commands.filter(c => c.category === 'Umum') 
    },
    { 
      name: 'Informasi', 
      commands: commands.filter(c => c.category === 'Informasi') 
    },
    { 
      name: 'AI', 
      commands: commands.filter(c => c.category === 'AI') 
    },
];
