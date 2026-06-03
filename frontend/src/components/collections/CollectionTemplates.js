import { Tag } from "primereact/tag";

export function amountBodyTemplate(
    rowData
) {

    return new Intl.NumberFormat(

        "tr-TR",

        {

            style: "currency",

            currency: "TRY"

        }

    ).format(
        rowData.amount
    );
}

export function paymentTypeBodyTemplate(
    rowData
) {

    return (

        <Tag

            value={
                rowData.paymentType
            }

            severity={

                rowData.paymentType === "CASH"

                    ? "success"

                    : rowData.paymentType === "CHECK"

                    ? "warning"

                    : rowData.paymentType === "BANK_TRANSFER"

                    ? "info"

                    : "secondary"
            }
        />

    );
}

export function statusBodyTemplate(
    rowData
) {

    return (

        <Tag

            value={
                rowData.status
            }

            severity={

                rowData.status === "PAID"

                    ? "success"

                    : "warning"
            }
        />

    );
}