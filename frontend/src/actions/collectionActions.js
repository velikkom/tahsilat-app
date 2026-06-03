"use client";

import { createCollection } from "@/services/collectionService";

export async function createCollectionAction(payload) {
    return await createCollection(payload);
}