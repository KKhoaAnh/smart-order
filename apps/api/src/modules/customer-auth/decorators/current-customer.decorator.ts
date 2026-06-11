import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentCustomer = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    if (data) {
      return request.customer?.[data];
    }
    return request.customer;
  },
);
