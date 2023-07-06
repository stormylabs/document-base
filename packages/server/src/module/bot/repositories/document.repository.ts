/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Document } from '../schemas/document.schema';
import { DocumentData } from '@/shared/interfaces/document';

@Injectable()
export class DocumentRepository {
  constructor(
    @InjectModel(Document.name) private readonly documentModel: Model<Document>,
  ) {}

  async create(documentData: Partial<DocumentData>): Promise<DocumentData> {
    const document = new this.documentModel(documentData);
    const saved = await document.save();
    return saved.toJSON() as DocumentData;
  }

  async findById(documentId: string): Promise<DocumentData | null> {
    const id = new Types.ObjectId(documentId);
    const document = await this.documentModel.findById(id).exec();
    if (!document) return null;
    return document.toJSON() as DocumentData;
  }

  async findOne(filter: Partial<DocumentData>): Promise<DocumentData | null> {
    const document = await this.documentModel.findOne(filter).exec();
    if (!document) return null;
    return document.toJSON() as DocumentData;
  }

  async findAll(): Promise<DocumentData[]> {
    const documents = await this.documentModel.find().exec();
    return documents.map((document) => document.toJSON() as DocumentData);
  }

  async exists(documentIds: string[]): Promise<boolean> {
    const count = await this.documentModel
      .countDocuments({ _id: { $in: documentIds } })
      .exec();
    return count === documentIds.length;
  }

  async update(
    documentId: string,
    data: Partial<Omit<DocumentData, '_id' | 'createdAt'>>,
  ): Promise<DocumentData | null> {
    const id = new Types.ObjectId(documentId);
    const document = await this.documentModel
      .findByIdAndUpdate(id, { $set: data }, { new: true })
      .exec();

    return document.toJSON() as DocumentData;
  }

  async delete(documentId: string): Promise<DocumentData> {
    const id = new Types.ObjectId(documentId);
    const document = await this.documentModel.findByIdAndDelete(id).exec();
    return document.toJSON() as DocumentData;
  }
}
