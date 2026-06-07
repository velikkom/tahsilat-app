import { FaChartLine } from "react-icons/fa";

export default function AuthHeader({ title, subtitle }) {
  return (
    <header className="auth-header">
      <div className="auth-header__brand">
        <span className="auth-header__brand-icon">
          <FaChartLine />
        </span>
        Tahsilat ERP
      </div>
      <h1 className="auth-header__title">{title}</h1>
      {subtitle && <p className="auth-header__subtitle">{subtitle}</p>}
    </header>
  );
}
