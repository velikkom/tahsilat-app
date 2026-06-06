import { API_V1 } from "@/config/api";

const BASE_URL = API_V1;

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