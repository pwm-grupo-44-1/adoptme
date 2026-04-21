export interface User {
  name: string;
  email: string;
  type: 'admin' | 'user';
  phone?: string;
  password: string;
}
