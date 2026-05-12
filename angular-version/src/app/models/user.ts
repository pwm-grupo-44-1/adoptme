export interface User {
  id?: string;
  name: string;
  email: string;
  type: 'admin' | 'user';
  phone?: string;
  banned?: boolean;
  bannedAt?: string;
}
