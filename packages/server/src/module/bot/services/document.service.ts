import { Injectable } from '@nestjs/common';
import { DocumentRepository } from '../repositories/document.repository';
import { DocumentData, DocumentType } from '@/shared/interfaces/document';

@Injectable()
export class DocumentService {
  constructor(private documentRepository: DocumentRepository) {}

  async create(documentData: {
    name: string;
    type: DocumentType;
    content: string;
  }): Promise<DocumentData> {
    const createdDocument = await this.documentRepository.create(documentData);
    return createdDocument;
  }

  async findById(documentId: string): Promise<DocumentData | null> {
    const document = await this.documentRepository.findById(documentId);
    return document;
  }

  async findByName(name: string): Promise<DocumentData | null> {
    const document = await this.documentRepository.findOne({ name });
    return document;
  }

  async update(
    documentId: string,
    data: Partial<Omit<DocumentData, '_id' | 'createdAt'>>,
  ): Promise<DocumentData> {
    const exists = await this.exists(documentId);
    if (!exists) throw new Error('Document does not exist.');
    const updatedDocument = await this.documentRepository.update(
      documentId,
      data,
    );
    return updatedDocument;
  }

  async delete(documentId: string): Promise<DocumentData> {
    const exists = await this.exists(documentId);
    if (!exists) throw new Error('Document does not exist.');
    const updatedDocument = await this.documentRepository.update(documentId, {
      deletedAt: new Date(),
    });
    return updatedDocument;
  }

  async exists(documentId: string): Promise<boolean> {
    const document = await this.documentRepository.findById(documentId);
    return !!document;
  }
}
