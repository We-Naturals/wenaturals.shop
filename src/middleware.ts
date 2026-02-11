import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase-middleware'

export async function middleware(request: NextRequest) {
    const response = await updateSession(request)

    // Add pathname to headers so it can be accessed in server components
    response.headers.set('x-pathname', request.nextUrl.pathname)

    // Check for admin preview mode
    const isAdminPreview = request.nextUrl.searchParams.get('admin_preview') === 'true'
    if (isAdminPreview) {
        response.headers.set('x-admin-preview', 'true')
    }

    return response
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
