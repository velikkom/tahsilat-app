"use client";

import { useEffect, useState } from "react";
import { getCollections }
from "@/services/collectionService";

export default function useCollections() {
    const [
        collections,
        setCollections
    ] = useState([]);

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchCollections();
    }, []);

    async function fetchCollections() {
        try {
            setLoading(true);
            const data =
                await getCollections({
                    size: 500
                });

            setCollections(data.content);

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    return {
        collections,
        loading,
        refresh:
            fetchCollections
    };
}