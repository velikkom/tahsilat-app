export default function ResponsiveTableWrapper({
  children,
  minWidth = 900,
  className = "",
}) {
  return (
    <div
      className={`table-responsive overflow-x-auto responsive-table-wrapper ${className}`.trim()}
      style={{ "--table-min-width": `${minWidth}px` }}
    >
      <div className="responsive-table-wrapper__inner">{children}</div>
    </div>
  );
}
