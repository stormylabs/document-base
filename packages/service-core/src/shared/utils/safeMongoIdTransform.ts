import { BadRequestException } from '@nestjs/common';
import { Types } from 'mongoose';

export const SafeMongoIdTransform = ({ value }) => {
  try {
    if (
      Types.ObjectId.isValid(value) &&
      new Types.ObjectId(value).toString() === value
    ) {
      return value;
    }
    throw new BadRequestException('Invalidation format ID');
  } catch (error) {
    throw new BadRequestException('Invalidation format ID');
  }
};
