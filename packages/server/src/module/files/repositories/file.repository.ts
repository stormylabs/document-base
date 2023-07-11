import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { FileData } from 'src/shared/interfaces/file';
import { File } from '../schemas/file.schema';

@Injectable()
export class FileRepository {
  constructor(
    @InjectModel(File.name) private readonly fileModel: Model<File>,
  ) {}

  async create(fileData: Partial<FileData>): Promise<FileData> {
    const file = new this.fileModel(fileData);
    const saved = await file.save();
    return saved.toJSON() as FileData;
  }

  async findById(fileId: string): Promise<FileData | null> {
    const id = new Types.ObjectId(fileId);
    const file = await this.fileModel.findById(id).exec();
    if (!file) return null;
    return file.toJSON() as FileData;
  }

  async findAll(): Promise<FileData[]> {
    const files = await this.fileModel.find().populate('documents').exec();
    return files.map((file) => file.toJSON() as FileData);
  }

  async exists(fileIds: string[]): Promise<boolean> {
    const count = await this.fileModel
      .countDocuments({ _id: { $in: fileIds } })
      .exec();
    return count === fileIds.length;
  }

  async update(
    fileId: string,
    data: Partial<Omit<FileData, 'createdAt' | '_id'>>,
  ): Promise<FileData | null> {
    const id = new Types.ObjectId(fileId);
    const file = await this.fileModel
      .findByIdAndUpdate(id, { $set: data }, { new: true })
      .exec();
    return file.toJSON() as FileData;
  }

  async delete(fileId: string): Promise<FileData> {
    const id = new Types.ObjectId(fileId);
    const file = await this.fileModel.findByIdAndDelete(id).exec();
    return file.toJSON() as FileData;
  }
}
