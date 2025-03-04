import { type NextRequest } from 'next/server'
import { updateSession } from './src/app/utils/middleware'

export async function middleware(request: NextRequest) {
  console.log("middleware");
  console.log(request);
  console.log(request.cookies);
  console.log(request.headers);
  console.log(request.url);
  console.log(request.nextUrl);
  console.log(request.nextUrl.pathname);
  console.log(request.nextUrl.searchParams);
  console.log(request.nextUrl.search);
  console.log(request.nextUrl.hash);
  console.log(request.nextUrl.origin);
  console.log(request.nextUrl.port);
  console.log(request.nextUrl.protocol);
  console.log(request.nextUrl.toString());

  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}