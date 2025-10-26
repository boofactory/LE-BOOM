import { NextResponse } from 'next/server';

export function successResponse<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export function errorResponse(message: string, status = 400, code?: string) {
  return NextResponse.json(
    {
      error: message,
      code,
    },
    { status }
  );
}

export function notFoundResponse(resource = 'Resource') {
  return errorResponse(`${resource} not found`, 404, 'NOT_FOUND');
}

export function unauthorizedResponse() {
  return errorResponse('Unauthorized', 401, 'UNAUTHORIZED');
}

export function validationErrorResponse(errors: Record<string, string>) {
  return NextResponse.json(
    {
      error: 'Validation failed',
      code: 'VALIDATION_ERROR',
      details: errors,
    },
    { status: 422 }
  );
}
