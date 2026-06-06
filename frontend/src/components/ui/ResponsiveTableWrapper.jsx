export default function ResponsiveTableWrapper({
  children,
  minWidth = 900,
  className = "",
}) {
  return (
    <div className={`table-responsive overflow-x-auto ${className}`}>
      <div style={{ minWidth: `${minWidth}px` }}>{children}</div>
    </div>
  );
}
