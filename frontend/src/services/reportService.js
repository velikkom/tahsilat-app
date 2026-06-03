const BASE_URL =
    'http://localhost:8080/api/v1';

export async function getDashboardSummary() {

    const token =
        localStorage.getItem('token');

    const response = await fetch(

        `${BASE_URL}/reports/dashboard-summary`,

        {

            method: 'GET',

            headers: {

                'Content-Type':
                    'application/json',

                Authorization:
                    `Bearer ${token}`
            }
        }
    );

    if (!response.ok) {

        throw new Error(
            'Dashboard summary fetch failed'
        );
    }

    return response.json();
}