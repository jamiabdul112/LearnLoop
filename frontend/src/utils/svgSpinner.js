// SvgSpinner.jsx
import React from 'react';

export default function SvgSpinner({ size = 40, color = '#0DF2A6', stroke = 4, ariaLabel = 'Loading' }) {
    const radius = (size - stroke) / 2;
    const circumference = 2 * Math.PI * radius;

    return (
        <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            role="status"
            aria-label={ariaLabel}
            aria-live="polite"
            style={{ display: 'inline-block' }}
        >
            {/* track */}
            <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke={`rgba(0, 209, 126, 0.18)`}
                strokeWidth={stroke}
                fill="none"
            />
            {/* animated arc */}
            <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke={color}
                strokeWidth={stroke}
                strokeLinecap="round"
                fill="none"
                strokeDasharray={`${circumference * 0.25} ${circumference}`}
                style={{
                    transformOrigin: '50% 50%',
                    animation: 'spin 0.8s linear infinite',
                }}
            />
            <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
        </svg>
    );
}
