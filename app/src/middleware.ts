export { default } from 'next-auth/middleware';

export const config = {
  matcher: ['/dashboard/:path*', '/api/photomatons/:path*', '/api/events/:path*', '/api/stats/:path*'],
};
