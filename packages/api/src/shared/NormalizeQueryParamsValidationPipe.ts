import { BadRequestException } from '@nestjs/common';
import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { camelize } from './utils/web-utils';

@Injectable()
export class NormalizeQueryParamsValidationPipe implements PipeTransform {
  async transform(value: any, { metatype }: ArgumentMetadata) {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }
    // * incoming validations are being transformed to camel case
    const camelized = camelize(value);
    const object = plainToClass(metatype, camelized);
    const errors = await validate(object, {
      whitelist: true,
      forbidNonWhitelisted: true,
    });

    if (errors.length > 0) {
      const key = Object.keys(errors[0].constraints)[0];
      throw new BadRequestException(`${errors[0].constraints[key]}`);
    }
    return object;
  }

  private toValidate(metatype) {
    const types = [String, Number, Array, Object, Boolean];
    return !types.includes(metatype);
  }
}
