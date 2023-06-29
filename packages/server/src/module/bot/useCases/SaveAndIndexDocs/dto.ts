import {
  ArrayMaxSize,
  ArrayMinSize,
  ArrayNotEmpty,
  IsArray,
  IsString,
} from 'class-validator';

export default class SaveAndIndexDocsDTO {
  @IsString({ each: true })
  @IsArray()
  @ArrayNotEmpty()
  @ArrayMaxSize(2000)
  @ArrayMinSize(1)
  documentIds: string[];
}
