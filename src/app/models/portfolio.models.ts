export interface Profile {
  name: string;
  title: string;
  email: string;
  phone: string;
  linkedin?: string;
  github?: string;
  summary: string;
  resumeUrl?: string;
}

export interface Skills {
  languages: string[];
  frontend: string[];
  backend: string[];
  databases: string[];
  tools: string[];
}

export interface Project {
  name: string;
  url?: string;
  description: string;
  technologies: string[];
  responsibilities: string[];
}

export interface Experience {
  company: string;
  role: string;
  duration: string;
  projects: Project[];
}

export interface Education {
  degree: string;
  institution: string;
  duration: string;
}

export interface ResumeData {
  profile: Profile;
  skills: Skills;
  experience: Experience[];
  education: Education[];
  achievements: string[];
}

export interface ContactMessage {
  _id?: string;
  name: string;
  email: string;
  subject?: string;
  message: string;
  createdAt?: string;
}
