"use client";

import { Button } from "primereact/button";

export default function CollectionActions() {

    return (

        <div
            className="
                d-flex
                gap-2
            "
        >

            <Button
                icon="pi pi-eye"
                severity="info"
                rounded
                outlined
            />

            <Button
                icon="pi pi-pencil"
                severity="warning"
                rounded
                outlined
            />

            <Button
                icon="pi pi-trash"
                severity="danger"
                rounded
                outlined
            />

        </div>

    );
}