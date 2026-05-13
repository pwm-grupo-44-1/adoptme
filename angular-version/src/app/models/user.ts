export interface User {
  id?: string;
  name: string;
  email: string;
  type: 'admin' | 'user';
  phone?: string;
  favorites?: string[];
  banned?: boolean;
  bannedAt?: string;
}
