export interface SocialLink {
  name: string;
  url: string;
  icon: string;
}

export interface NavLink {
  name: string;
  url: string;
}

export interface HeaderData {
  logo: string;
  title: string;
  socialLinks: SocialLink[];
  navLinks: NavLink[];
}

export interface FooterData {
  navLinks: NavLink[];
  copyright: string;
}

export interface HomeData {
  text: string;
  images: string[];
}

export interface TeamMember {
  name: string;
  role: string;
  description: string;
  image: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface StoryItem {
  name: string;
  image: string;
  text: string;
}

export interface LegalItem {
  title: string;
  content: string;
}

export interface ContactReason {
  icon: string;
  title: string;
  text: string;
}

export interface ContactUsData {
  title: string;
  reasons: ContactReason[];
  mapUrl: string;
  info: string[];
}

export interface ScheduleData {
  slots: string[];
}

export interface User {
  id: number;
  name: string;
  type: string;
  email: string;
  user: string;
  password: string;
  telefono?: number;
}
