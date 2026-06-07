import {

    NextResponse

} from 'next/server';

export function middleware(
    request
) {

    const token =
        request.cookies.get(
            'token'
        );

    const pathname =
        request.nextUrl.pathname;

    const publicRoutes = [
        '/login',
        '/register',
        '/forgot-password'
    ];

    if (
        !token
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

        token
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

        '/admin/:path*',

        '/login',

        '/register',

        '/forgot-password'
    ]
};
