import { registerDecorator, ValidationOptions } from 'class-validator';

export function IsNonPrimitiveArray(validationOptions?: ValidationOptions) {
  return (object: any, propertyName: string) => {
    registerDecorator({
      name: 'IsNonPrimitiveArray',
      target: object.constructor,
      propertyName,
      constraints: [],
      options: validationOptions,
      validator: {
        validate(value: any) {
          return (
            Array.isArray(value) &&
            value.reduce(
              (a, b) => a && typeof b === 'object' && !Array.isArray(b),
              true
            )
          );
        },
      },
    });
  };
}
