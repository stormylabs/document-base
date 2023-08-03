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

export const MimeTypeToDocType = {
  'application/msword': 'word',
  'application/pdf': 'pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
    'word',
} as const;

export interface DocumentData {
  _id: string;
  type: DocumentType;
  sourceName: string;
  content?: string;
  createdAt: Date;
  deletedAt?: Date;
}
