import { Injectable } from '@nestjs/common';
import { DocumentRepository } from '../repositories/document.repository';
import { DocumentData } from '@/shared/interfaces/document';

@Injectable()
export class DocumentService {
  constructor(private documentRepository: DocumentRepository) {}

  async create(
    documentData: Partial<
      Omit<DocumentData, '_id' | 'createdAt' | 'deletedAt'>
    >,
  ): Promise<DocumentData> {
    const createdDocument = await this.documentRepository.create(documentData);
    return createdDocument;
  }

  async findById(documentId: string): Promise<DocumentData | null> {
    const document = await this.documentRepository.findById(documentId);
    return document;
  }

  async findBySourceName(sourceName: string): Promise<DocumentData | null> {
    const document = await this.documentRepository.findOne({ sourceName });
    return document;
  }

  async delete(documentId: string): Promise<DocumentData> {
    const exists = await this.exists([documentId]);
    if (!exists) throw new Error('Document does not exist.');
    const updatedDocument = await this.documentRepository.update(documentId, {
      deletedAt: new Date(),
    });
    return updatedDocument;
  }

  async exists(documentIds: string[]): Promise<boolean> {
    return this.documentRepository.exists(documentIds);
  }

  async updateContent({
    documentId,
    content,
    title,
  }: { documentId: string } & Partial<
    Omit<DocumentData, '_id' | 'createdAt'>
  >): Promise<DocumentData> {
    const updatedDocument = await this.documentRepository.update(documentId, {
      content,
      title,
    });
    return updatedDocument;
  }

  async restore(documentId: string): Promise<DocumentData> {
    const updatedDocument = await this.documentRepository.update(documentId, {
      deletedAt: null,
    });
    return updatedDocument;
  }
}
