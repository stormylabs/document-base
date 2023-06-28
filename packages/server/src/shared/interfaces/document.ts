export enum DocumentType {
  Url = 'url',
  Pdf = 'pdf',
  Word = 'word',
  Image = 'image',
}

export interface DocumentData {
  _id: string;
  type: DocumentType;
  name: string;
  content: string;
  createdAt: Date;
  deletedAt: Date;
}
