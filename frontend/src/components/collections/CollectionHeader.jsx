"use client";

import { Button }
from "primereact/button";

export default function CollectionHeader({

    onCreate

}) {

    return (

        <div
            className="
                d-flex
                justify-content-between
                align-items-center
                mb-4
            "
        >

            <div>

                <h2 className="fw-bold">

                    Collections

                </h2>

                <p className="text-muted mb-0">

                    Financial collection management

                </p>

            </div>

     

        </div>
    );
}