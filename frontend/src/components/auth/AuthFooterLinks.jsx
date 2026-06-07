import Link from "next/link";

export default function AuthFooterLinks({ text, linkText, href }) {
  return (
    <p className="auth-footer">
      {text}
      <Link href={href} className="auth-footer__link">
        {linkText}
      </Link>
    </p>
  );
}
