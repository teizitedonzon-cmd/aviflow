"use client";

import { InputHTMLAttributes, useState } from "react";

interface PasswordFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export function PasswordField({ label, id, value, onChange, required, minLength, ...props }: PasswordFieldProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="passwordField">
      {label && <label htmlFor={id}>{label}</label>}
      <div className="passwordWrap">
        <input
          {...props}
          id={id}
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={onChange}
          required={required}
          minLength={minLength}
          className="passwordInput"
        />
        <button
          type="button"
          className="passwordToggle"
          aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
          onClick={() => setShowPassword((prev) => !prev)}
        >
          {showPassword ? "🙈" : "👁️"}
        </button>
      </div>
    </div>
  );
}
