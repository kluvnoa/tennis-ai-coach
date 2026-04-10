import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

type SchemaParser<T> = {
  parse: (value: unknown) => T;
};

@Injectable()
export class ZodValidationPipe<T> implements PipeTransform<unknown, T> {
  constructor(private readonly schema: SchemaParser<T>) {}

  transform(value: unknown): T {
    try {
      return this.schema.parse(value);
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Invalid request payload',
      );
    }
  }
}
