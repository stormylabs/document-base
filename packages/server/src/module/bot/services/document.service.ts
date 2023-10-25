import { Injectable } from '@nestjs/common';
import { DocumentRepository } from '../repositories/document.repository';
import { DocumentData } from '@/shared/interfaces/document';
import { encode } from 'gpt-tokenizer';
import { Types } from 'mongoose';

@Injectable()
export class DocumentService {
  constructor(private documentRepository: DocumentRepository) {}

  async create(
    documentData: Partial<
      Omit<DocumentData, '_id' | 'createdAt' | 'deletedAt' | 'organization'> & {
        organizationId?: string;
      }
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
    organizationId,
  }: { documentId: string; organizationId?: string } & Partial<
    Omit<DocumentData, '_id' | 'createdAt'>
  >): Promise<DocumentData> {
    const updatedDocument = await this.documentRepository.update(documentId, {
      content,
      title,
      ...(organizationId ? { organizationId } : {}),
    });
    return updatedDocument;
  }

  async restore(documentId: string): Promise<DocumentData> {
    const updatedDocument = await this.documentRepository.update(documentId, {
      deletedAt: null,
    });
    return updatedDocument;
  }

  async patch() {
    const totalDocuments = await this.documentRepository.count();
    let processed = 0;
    let documents = await this.documentRepository.findBatch();
    while (documents.length > 0) {
      for (const document of documents) {
        console.log('start to patch', document._id);
        await this.documentRepository.update(document._id, {
          tokens: document.content ? encode(document.content).length : 0,
          characters: document.content ? document.content.length : 0,
        });
        console.log(`Processed ${processed} documents.`);
        documents = await this.documentRepository.findBatch();
        console.log(
          `Processed ${((processed / totalDocuments) * 100).toFixed(
            2,
          )}% documents.`,
        );
        processed++;
      }
    }
  }
}
