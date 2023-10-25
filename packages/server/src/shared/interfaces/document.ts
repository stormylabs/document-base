import { OrganizationData } from './organization';

export enum DocumentType {
  Url = 'url',
  Pdf = 'pdf',
  Word = 'word',
  Image = 'image',
}

export const DocumentExtToType = {
  '.pdf': 'pdf',
  '.doc': 'word',
  '.docx': 'word',
  '.jpeg': 'image',
  '.png': 'image',
  '.jpg': 'image',
} as const;

export interface DocumentData {
  _id: string;
  type: DocumentType;
  sourceName: string;
  title?: string;
  organization?: OrganizationData;
  content?: string;
  tokens?: number;
  characters?: number;
  createdAt: Date;
  deletedAt?: Date;
}
