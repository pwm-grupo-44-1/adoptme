export interface Animal {
  id: number;
  name: string;
  breed: string;
  gender: 'Male' | 'Female';
  description: string;
  age: number;
  mood: string;
  weight: string;
  'hair type': string;
  clicks: number;
  images: string[];
}
