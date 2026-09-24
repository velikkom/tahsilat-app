"use client";

import { forwardRef } from "react";

const NavbarProfileTrigger = forwardRef(function NavbarProfileTrigger(
  { children, onClick, className = "", variant: _variant, ...props },
  ref
) {
  return (
    <button
      type="button"
      ref={ref}
      onClick={onClick}
      className={`app-profile-trigger touch-target ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
});

export default NavbarProfileTrigger;
