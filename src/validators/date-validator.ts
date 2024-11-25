import { Injectable } from '@nestjs/common';
import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { DateTime } from 'luxon';

@ValidatorConstraint({ name: 'IsValidDate', async: true })
@Injectable()
export class IsValidDate implements ValidatorConstraintInterface {
  constructor() {}
  async validate(value: any): Promise<boolean> {
    return DateTime.fromISO(value).isValid;
  }

  defaultMessage(validationArguments?: ValidationArguments): string {
    const field: string = validationArguments.property;
    return `${field} is is not a valid date.`;
  }
}
