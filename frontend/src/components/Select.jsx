import React, { useState, useRef, useEffect } from "react";

export default function Select({ value, onChange, options = [], placeholder = "", className = "", compact = false }) {
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(-1);
  const rootRef = useRef(null);

  const selected = options.find((o) => o.value === value) || options[0] || null;

  useEffect(() => {
    if (!open) setHighlight(-1);
  }, [open]);

  useEffect(() => {
    function onDoc(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  function toggle() {
    setOpen((v) => !v);
  }

  function handleKeyDown(e) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setHighlight((h) => Math.min(h + 1, options.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (open && highlight >= 0) {
        onChange(options[highlight].value);
        setOpen(false);
      } else {
        setOpen((v) => !v);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  function handleSelect(opt, idx) {
    onChange(opt.value);
    setOpen(false);
    setHighlight(idx);
  }

  return (
    <div ref={rootRef} className={`custom-select ${className} ${compact ? "custom-select--compact" : ""}`} tabIndex={0} onKeyDown={handleKeyDown}>
      <button type="button" className="custom-select__control" onClick={toggle} aria-haspopup="listbox" aria-expanded={open}>
        <span className="custom-select__value">{selected ? selected.label : placeholder}</span>
        <span className="custom-select__arrow" aria-hidden>▾</span>
      </button>

      {open && (
        <ul role="listbox" className="custom-select__menu">
          {options.map((opt, idx) => (
            <li
              role="option"
              aria-selected={value === opt.value}
              key={opt.value || idx}
              className={`custom-select__item ${value === opt.value ? "is-selected" : ""} ${highlight === idx ? "is-highlight" : ""}`}
              onMouseEnter={() => setHighlight(idx)}
              onClick={() => handleSelect(opt, idx)}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
