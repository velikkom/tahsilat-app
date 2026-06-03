"use client";

export default function Navbar() {
  return (
    <header
      className="
                bg-white
                border-bottom
                px-4
                py-3
                d-flex
                justify-content-between
                align-items-center
            "
    >
      <h5 className="mb-0">Financial Management System</h5>

      <div
        className="
                    d-flex
                    align-items-center
                    gap-3
                "
      >
        <span
          className="
                        text-muted
                    "
        >
          Welcome Admin
        </span>
      </div>
    </header>
  );
}
