import React from "react";
export default function Rating({ value = 0, onChange, readOnly = false }) {
  return (
    <div className="stars" aria-label={`Rating ${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          type="button"
          key={n}
          className={`star ${n <= value ? "active" : ""}`}
          disabled={readOnly}
          onClick={() => onChange?.(n)}
        >
          ★
        </button>
      ))}
    </div>
  );
}
