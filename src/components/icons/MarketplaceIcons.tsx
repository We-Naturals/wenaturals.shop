import React from "react";

// Amazon Icon (FontAwesome 'amazon' style - standard 'a' with smile)
export const AmazonLogo = ({ className }: { className?: string }) => (
    <svg
        viewBox="0 0 448 512"
        fill="currentColor"
        className={className}
        xmlns="http://www.w3.org/2000/svg"
    >
        {/* FontAwesome Amazon Path */}
        <path d="M257.2 162.7c-48.7 1.8-106.7 34.6-106.7 104.9 0 46.2 30.7 75.3 76.5 75.3 49.6 0 83.2-38.3 83.2-38.3v-12.7c1.3-88.7-27.4-129.2-53-129.2zm-46.1 133.9c-10.3 0-21.8-5.3-21.8-23.8 0-24.8 28.3-43.1 61.2-45.7v10.9c0 42.1-15.6 58.6-39.4 58.6zM289 123c58.9 0 94.7 32.5 94.7 114.3v150.1h-57.7v-21.6c-17.6 19.3-49.4 29.6-77.9 29.6-67.6 0-111.4-44.1-111.4-106.3 0-77.9 61.5-127.3 151.7-130.4 4.3-.2 8.4-.2 12.3-.4v-5.6c0-30.8-13.6-50.5-49.1-50.5-30.1 0-59.5 10.9-88.7 26.5l-21.6-43.9c33.5-20.7 79.8-31.8 127.7-31.8zM420.9 396.4c-22.6-11.4-66.3-2.8-82.7 2.1l-10-27.4c7.6-2.5 61.2-19.1 106.1 2.9 6.7 3.3 11.2 9 12.4 16.4 1.2 7.5-1.7 15.1-7.8 19.6l-18 13.5v-7.1zM183.8 459c27.1 15.3 75 19.3 107.5 13.7l11.4 39.7c-36.5 8.9-95.2 5.5-132.5-16.7-6.2-3.7-9.5-10.7-8.3-17.7 1.2-7 6.4-12.6 13.4-14.7l8.5-4.3z" />
    </svg>
);

// Flipkart Icon (Distinctive 'f')
export const FlipkartLogo = ({ className }: { className?: string }) => (
    <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className={className}
        xmlns="http://www.w3.org/2000/svg"
    >
        {/* Simple 'f' shape typically associated with the brand icon */}
        <path d="M16.5 6h-2.5c-.6 0-1 .4-1 1v2h3.5l-.5 3h-3v10h-4v-10h-2v-3h2v-2.5c0-2.5 1.5-4 4.5-4h3v3.5z" />
    </svg>
);

// Meesho Icon (Distinctive small 'm')
export const MeeshoLogo = ({ className }: { className?: string }) => (
    <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className={className}
        xmlns="http://www.w3.org/2000/svg"
    >
        {/* Rounded 'm' shape */}
        <path d="M17.5 7A4.5 4.5 0 0 0 13 11.5A4.5 4.5 0 0 0 8.5 7a4.5 4.5 0 0 0-4.5 4.5v8h3v-8a1.5 1.5 0 0 1 1.5-1.5 1.5 1.5 0 0 1 1.5 1.5v8h3v-8a1.5 1.5 0 0 1 3 0v8h3v-8A4.5 4.5 0 0 0 17.5 7z" />
    </svg>
);
