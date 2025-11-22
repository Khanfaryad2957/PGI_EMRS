import { useState, useRef, useEffect } from 'react';
import { FiChevronDown, FiCheck, FiSearch } from 'react-icons/fi';
import { createPortal } from 'react-dom';

const Select = ({
  label,
  name,
  value,
  onChange,
  options = [],
  placeholder = 'Select an option',
  error,
  required = false,
  disabled = false,
  className = '',
  containerClassName = '',
  dropdownZIndex = 999999,
  usePortal = true,
  searchable = false,
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const triggerRef = useRef(null);
  const searchInputRef = useRef(null);
  const [menuStyle, setMenuStyle] = useState({ top: 0, left: 0, width: 0 });
  const [searchQuery, setSearchQuery] = useState('');

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current && !dropdownRef.current.contains(event.target) && 
        triggerRef.current && !triggerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update portal menu position when open/resize/scroll
  useEffect(() => {
    if (!isOpen || !triggerRef.current) return;
    const updatePosition = () => {
      const rect = triggerRef.current.getBoundingClientRect();
      setMenuStyle({
        top: rect.bottom + 8, // 8px gap
        left: rect.left,
        width: rect.width,
      });
    };
    updatePosition();
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isOpen]);

  const selectedOption = options.find(opt => opt.value === value);

  // Filter options based on search query
  const filteredOptions = searchable && searchQuery
    ? options.filter(option =>
        option.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        option.value.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : options;

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, searchable]);

  // Reset search when dropdown closes
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
    }
  }, [isOpen]);

  const handleSelect = (optionValue) => {
    const event = {
      target: {
        name,
        value: optionValue
      }
    };
    onChange(event);
    setIsOpen(false);
    setSearchQuery('');
  };

  const Menu = (
    <div
      ref={dropdownRef}
      className="backdrop-blur-2xl bg-white/90 border border-white/40 rounded-xl shadow-2xl overflow-hidden"
      style={{
        maxHeight: '240px',
        zIndex: dropdownZIndex,
      }}
    >
      {searchable && (
        <div className="p-2 border-b border-gray-200">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
      <div className="overflow-y-auto py-1" style={{ maxHeight: searchable ? '180px' : '232px' }}>
        {filteredOptions.length === 0 ? (
          <div className="px-4 py-3 text-sm text-gray-500 text-center">
            {searchQuery ? 'No matching options' : 'No options available'}
          </div>
        ) : (
          filteredOptions.map((option, index) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleSelect(option.value)}
              className={`
                w-full px-4 py-3 text-left
                flex items-center justify-between
                transition-colors duration-150
                ${value === option.value
                  ? 'bg-primary-50 text-primary-700 font-semibold'
                  : 'text-gray-700 hover:bg-gray-50'}
                ${index !== 0 ? 'border-t border-gray-100' : ''}
              `}
            >
              <span className="flex-1">{option.label}</span>
              {value === option.value && (
                <FiCheck className="h-5 w-5 text-primary-600 flex-shrink-0 ml-2" />
              )}
            </button>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className={`w-full relative overflow-visible ${containerClassName}`}>
      {label && (
        <label
          htmlFor={name}
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        {/* Hidden native select for form submission */}
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
          className="sr-only"
          tabIndex={-1}
          {...props}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {/* Custom dropdown trigger */}
        <button
          ref={triggerRef}
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`
            w-full px-3 py-2 pr-10
            backdrop-blur-md bg-white/60 border border-white/40 rounded-lg shadow-sm
            text-left font-medium
            transition-all duration-300 ease-in-out
            focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 focus:bg-white/80
            hover:bg-white/70 hover:border-primary-400/70
            disabled:bg-gray-100/60 disabled:text-gray-400 disabled:cursor-not-allowed disabled:backdrop-blur-sm disabled:hover:border-white/40
            ${error ? 'border-red-500/60 focus:border-red-500 focus:ring-red-500/50' : 'border-white/40'}
            ${!value ? 'text-gray-500' : 'text-gray-900'}
            ${isOpen ? 'border-primary-500 ring-2 ring-primary-500/50 bg-white/80' : ''}
            ${className}
          `}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </button>

        {/* Custom dropdown arrow */}
        <div className={`
          absolute right-3 top-1/2 -translate-y-1/2
          pointer-events-none
          transition-all duration-200
          ${isOpen ? 'rotate-180' : 'rotate-0'}
          ${disabled ? 'text-gray-400' : error ? 'text-red-500' : 'text-primary-600'}
        `}>
          <FiChevronDown className="h-5 w-5" />
        </div>

        {/* Dropdown menu */}
        {isOpen && !disabled && (
          usePortal
            ? createPortal(
                <div
                  style={{
                    position: 'fixed',
                    top: menuStyle.top,
                    left: menuStyle.left,
                    width: menuStyle.width,
                    zIndex: dropdownZIndex,
                  }}
                >
                  {Menu}
                </div>,
                document.body
              )
            : (
              <div
                ref={dropdownRef}
                className="absolute"
                style={{
                  top: 'calc(100% + 8px)',
                  left: 0,
                  right: 0,
                  zIndex: dropdownZIndex,
                }}
              >
                {Menu}
              </div>
            )
        )}
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
          <span className="inline-block w-1 h-1 rounded-full bg-red-600"></span>
          {error}
        </p>
      )}
    </div>
  );
};

export default Select;

