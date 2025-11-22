const Input = ({
  label,
  type = 'text',
  name,
  value,
  onChange,
  placeholder,
  error,
  required = false,
  disabled = false,
  className = '',
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={name}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        className={`
          w-full px-3 py-2 backdrop-blur-md bg-white/60 border border-white/40 rounded-lg shadow-sm
          placeholder-gray-400 text-gray-900
          focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 focus:bg-white/80
          disabled:bg-gray-100/60 disabled:cursor-not-allowed disabled:backdrop-blur-sm
          transition-all duration-300 hover:bg-white/70 hover:border-primary-400/70
          ${error ? 'border-red-500/60 focus:ring-red-500/50' : 'border-white/40'}
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default Input;

