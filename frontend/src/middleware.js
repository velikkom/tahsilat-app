import {

    NextResponse

} from 'next/server';

/**
 * Structural-only check: does this cookie look like an unexpired JWT?
 * This does NOT verify the signature (the secret must never reach the
 * frontend bundle) - it only lets the middleware avoid redirect decisions
 * based on an empty/garbage cookie value. The backend's own JwtAuthenticationFilter
 * remains the actual security boundary; every API call still requires a
 * signature-verified, session-matched token regardless of what this returns.
 */
function looksLikeUnexpiredJwt(token) {

    if (!token) {
        return false;
    }

    const parts = token.split('.');

    if (parts.length !== 3) {
        return false;
    }

    try {
        const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(atob(base64));

        return typeof payload.exp === 'number'
            && payload.exp * 1000 > Date.now();
    } catch {
        return false;
    }
}

export function middleware(
    request
) {

    const tokenCookie =
        request.cookies.get(
            'token'
        );

    const hasValidLookingSession =
        looksLikeUnexpiredJwt(
            tokenCookie?.value
        );

    const pathname =
        request.nextUrl.pathname;

    const publicRoutes = [
        '/login',
        '/register',
        '/forgot-password'
    ];

    if (
        !hasValidLookingSession
        &&
        !publicRoutes.includes(
            pathname
        )
    ) {

        return NextResponse.redirect(

            new URL(
                '/login',
                request.url
            )
        );
    }

    if (

        hasValidLookingSession
        &&
        publicRoutes.includes(
            pathname
        )
    ) {

        return NextResponse.redirect(

            new URL(
                '/dashboard',
                request.url
            )
        );
    }

    return NextResponse.next();
}

export const config = {

    matcher: [

        '/dashboard/:path*',

        '/customers/:path*',

        '/collections/:path*',

        '/trips/:path*',

        '/admin/:path*',

        '/profile',

        '/profile/:path*',

        '/login',

        '/register',

        '/forgot-password'
    ]
};
