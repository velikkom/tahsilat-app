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

    /*
     * PUBLIC ROUTES
     */

    const publicRoutes = [

        '/login',
        '/register'
    ];

    /*
     * IF USER NOT LOGGED IN
     */

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

    /*
     * IF USER LOGGED IN
     * AND GOES LOGIN PAGE
     */

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

        '/login',

        '/register'
    ]
};