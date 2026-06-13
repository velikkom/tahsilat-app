"use client";

import { Button } from "react-bootstrap";
import { FaPhone, FaWhatsapp } from "react-icons/fa";
import {
  formatPhoneNumber,
  getTelHref,
  getWhatsAppHref,
} from "@/utils/customerUtils";

export default function CustomerPhoneActions({ phone }) {
  if (!phone) {
    return null;
  }

  const telHref = getTelHref(phone);
  const whatsAppHref = getWhatsAppHref(phone);

  return (
    <div className="customer-detail-phone d-flex flex-column gap-2">
      <a
        href={telHref}
        className="customer-detail-phone__number"
      >
        {formatPhoneNumber(phone)}
      </a>

      <div className="customer-detail-phone__actions d-flex flex-column flex-sm-row gap-2">
        <Button
          as="a"
          href={telHref}
          variant="outline-primary"
          className="customer-detail-phone__btn customer-detail-phone__btn--call touch-target flex-fill"
        >
          <FaPhone className="me-2" aria-hidden="true" />
          Ara
        </Button>

        <Button
          as="a"
          href={whatsAppHref}
          target="_blank"
          rel="noopener noreferrer"
          variant="success"
          className="customer-detail-phone__btn customer-detail-phone__btn--whatsapp customer-detail-phone__btn--whatsapp-solid touch-target flex-fill d-sm-none"
        >
          <FaWhatsapp className="me-2" aria-hidden="true" />
          WhatsApp
        </Button>

        <Button
          as="a"
          href={whatsAppHref}
          target="_blank"
          rel="noopener noreferrer"
          variant="outline-success"
          className="customer-detail-phone__btn customer-detail-phone__btn--whatsapp customer-detail-phone__btn--whatsapp-outline touch-target flex-fill d-none d-sm-inline-flex"
        >
          <FaWhatsapp className="me-2" aria-hidden="true" />
          WhatsApp
        </Button>
      </div>
    </div>
  );
}
