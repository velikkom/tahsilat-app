'use client';

import { useEffect, useState } from 'react';
import { FaMoon, FaSun } from 'react-icons/fa';

export default function Header() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);

  return (
    <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-2 mb-4">
      <h4 className="mb-0 page-header__title">Dashboard</h4>

      <button
        type="button"
        className="btn btn-outline-secondary touch-target"
        onClick={() => setDarkMode(!darkMode)}
        aria-label="Tema değiştir"
      >
        {darkMode ? <FaSun /> : <FaMoon />}
      </button>
    </div>
  );
}
