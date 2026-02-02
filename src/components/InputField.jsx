import React from "react";

const InputField = ({
  label,
  type = "text",
  name,
  value,
  onChange,
  placeholder,
  className = "",
  ...rest
}) => (
  <div className="mb-4">
    <label className="block text-sm font-semibold text-slate-800 mb-1.5">
      {label}
    </label>

    <div className="relative">
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required
        {...rest}
        className={`w-full px-4 py-3 rounded-2xl bg-white/80 border border-slate-200 shadow-sm outline-none transition
          placeholder:text-slate-400
          hover:border-slate-300
          focus:ring-2 focus:ring-slate-300 focus:border-slate-500
          disabled:opacity-60 disabled:cursor-not-allowed
          ${className}`}
      />

      {/* subtle inner highlight -> premium "glass input" feel (matches your pages) */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/40" />
    </div>
  </div>
);

export default InputField;
