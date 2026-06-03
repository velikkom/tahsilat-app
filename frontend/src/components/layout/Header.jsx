'use client';

import { useEffect, useState } from 'react';

import {
    FaMoon,
    FaSun
} from 'react-icons/fa';

export default function Header() {

    const [darkMode, setDarkMode] =
        useState(false);

    useEffect(() => {

        if (darkMode) {

            document.body.classList.add(
                'dark-mode'
            );

        } else {

            document.body.classList.remove(
                'dark-mode'
            );
        }

    }, [darkMode]);

    return (

        <div
            className="
                d-flex
                justify-content-between
                align-items-center
                mb-4
            "
        >

            <h4 className="mb-0">
                Dashboard
            </h4>

            <button
                className="btn btn-outline-secondary"
                onClick={() =>
                    setDarkMode(!darkMode)
                }
            >

                {
                    darkMode
                        ? <FaSun />
                        : <FaMoon />
                }

            </button>

        </div>
    );
}