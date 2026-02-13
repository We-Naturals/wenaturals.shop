import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    if (!supabaseUrl || !supabaseKey) {
        console.error("Middleware Error: Missing Supabase URL or Key");
        return supabaseResponse;
    }

    const supabase = createServerClient(
        supabaseUrl,
        supabaseKey,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // IMPORTANT: Avoid writing any logic between createServerClient and
    // supabase.auth.getUser(). A simple mistake could make it very hard to debug
    // issues with users being randomly logged out.

    const {
        data: { user },
    } = await supabase.auth.getUser()

    // PROTECTED ADMIN ROUTES
    if (request.nextUrl.pathname.startsWith('/admin') && !request.nextUrl.pathname.startsWith('/admin-login')) {
        // 1. Check if user is logged in
        if (!user) {
            console.log("Middleware: No user for admin route. Redirecting to login.");
            const url = request.nextUrl.clone()
            url.pathname = '/admin-login'
            return NextResponse.redirect(url)
        }

        // 2. Check if user is actually an admin
        const { data: profile, error } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        console.log(`Middleware Debug: Path=${request.nextUrl.pathname}, UserID=${user.id}, Role=${profile?.role}, Error=${error?.message}`);

        if (profile?.role !== 'admin') {
            console.log("Middleware: User is not admin. Redirecting to home.");
            // If customer tries to access admin, kick them out
            const url = request.nextUrl.clone()
            url.pathname = '/'
            return NextResponse.redirect(url)
        }
    }

    // OPTIONAL: Protect other routes if needed (e.g. account)

    return supabaseResponse
}
