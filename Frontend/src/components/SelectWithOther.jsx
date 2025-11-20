// 



import { useState, useEffect, useRef } from 'react';
import { FiCheck, FiChevronDown } from 'react-icons/fi';
import { createPortal } from 'react-dom';
import React from 'react';

export const SelectWithOther = ({
    customValue,
    setCustomValue,
    showCustomInput,
    formData,
    customFieldName,
    inputLabel = "Specify",
    icon,
    ...selectProps
  }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [customInputValue, setCustomInputValue] = useState(customValue || formData?.[customFieldName || ''] || '');
    const dropdownRef = useRef(null);
    const triggerRef = useRef(null);
    const customInputRef = useRef(null);
    const [menuStyle, setMenuStyle] = useState({ top: 0, left: 0, width: 0 });
  
    // Check if "others" or "other" is selected
    const isOthersSelected = selectProps.value === 'others' || selectProps.value === 'other';
    // Auto-detect if custom input should be shown (if showCustomInput is not explicitly provided)
    const shouldShowCustomInput = showCustomInput !== undefined ? showCustomInput : isOthersSelected;
  
    // Update custom input value when customValue changes
    useEffect(() => {
      setCustomInputValue(customValue || formData?.[customFieldName || ''] || '');
    }, [customValue, formData, customFieldName]);
  
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
        if (!triggerRef.current) return;
        const rect = triggerRef.current.getBoundingClientRect();
        setMenuStyle({
          top: rect.bottom + 8,
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
  
    // Focus custom input when "Others" is selected and dropdown opens
    useEffect(() => {
      if (isOpen && shouldShowCustomInput && customInputRef.current) {
        setTimeout(() => {
          customInputRef.current?.focus();
        }, 100);
      }
    }, [isOpen, shouldShowCustomInput]);
  
    const selectedOption = selectProps.options.find(opt => opt.value === selectProps.value);
  
    const handleSelect = (optionValue) => {
      const event = {
        target: {
          name: selectProps.name,
          value: optionValue
        }
      };
      selectProps.onChange(event);

      if (optionValue !== 'others' && optionValue !== 'other') {
        setIsOpen(false);
      }
    };

    const handleCustomInputChange = (e) => {
      const value = e.target.value;
      setCustomInputValue(value);
      if (setCustomValue) {
        setCustomValue(value);
      }

      // Update form data
      const event = {
        target: {
          name: customFieldName || '',
          value: value
        }
      };
      selectProps.onChange(event);
    };

    const handleCustomInputKeyDown = (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        setIsOpen(false);
      }
    };
  
    const Menu = (
      <div
        className="bg-white border-2 border-primary-200 rounded-xl shadow-2xl overflow-hidden"
        style={{
          maxHeight: '300px',
          zIndex: selectProps.dropdownZIndex || 999999,
        }}
      >
        <div className="overflow-y-auto py-1" style={{ maxHeight: shouldShowCustomInput ? '200px' : '280px' }}>
          {selectProps.options
            .filter(opt => opt.value !== 'others' && opt.value !== 'other')
            .map((option, index) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                className={`
                  w-full px-4 py-3 text-left
                  flex items-center justify-between
                  transition-colors duration-150
                  ${selectProps.value === option.value
                    ? 'bg-primary-50 text-primary-700 font-semibold'
                    : 'text-gray-700 hover:bg-gray-50'}
                  ${index !== 0 ? 'border-t border-gray-100' : ''}
                `}
              >
                <span className="flex-1">{option.label}</span>
                {selectProps.value === option.value && (
                  <FiCheck className="h-5 w-5 text-primary-600 flex-shrink-0 ml-2" />
                )}
              </button>
            ))}
  
          {/* "Others" or "Other" option(s) */}
          {selectProps.options
            .filter(opt => opt.value === 'others' || opt.value === 'other')
            .map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                className={`
                  w-full px-4 py-3 text-left
                  flex items-center justify-between
                  transition-colors duration-150
                  ${isOthersSelected
                    ? 'bg-primary-50 text-primary-700 font-semibold'
                    : 'text-gray-700 hover:bg-gray-50'}
                  border-t border-gray-100
                `}
              >
                <span className="flex-1">{option.label}</span>
                {isOthersSelected && (
                  <FiCheck className="h-5 w-5 text-primary-600 flex-shrink-0 ml-2" />
                )}
              </button>
            ))}
  
          {/* Custom input field when "Others" is selected */}
          {isOthersSelected && (
            <div className="p-3 border-t border-gray-200 bg-gray-50">
              <label className="block text-xs font-medium text-gray-700 mb-2">
                {inputLabel}
              </label>
              <input
                ref={customInputRef}
                type="text"
                value={customInputValue}
                onChange={handleCustomInputChange}
                onKeyDown={handleCustomInputKeyDown}
                placeholder={`Enter ${inputLabel.toLowerCase()}`}
                className="w-full px-3 py-2 text-sm border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}
        </div>
      </div>
    );
  
    return (
      <div className={`w-full relative overflow-visible ${selectProps.containerClassName || ''}`}>
        {selectProps.label && (
          <label
            htmlFor={selectProps.name}
            className="flex items-center gap-2 text-sm font-semibold text-gray-800 mb-2"
          >
            {icon && <span className="text-primary-600">{icon}</span>}
            {selectProps.label}
            {selectProps.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
  
        <div className="relative">
          {/* Hidden native select for form submission */}
          <select
            id={selectProps.name}
            name={selectProps.name}
            value={selectProps.value}
            onChange={selectProps.onChange}
            required={selectProps.required}
            disabled={selectProps.disabled}
            className="sr-only"
            tabIndex={-1}
          >
            <option value="">{selectProps.placeholder}</option>
            {selectProps.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
  
          {/* Custom dropdown trigger */}
          <button
            ref={triggerRef}
            type="button"
            onClick={() => !selectProps.disabled && setIsOpen(!isOpen)}
            disabled={selectProps.disabled}
            className={`
              w-full px-4 py-3 pr-10
              bg-white border-2 rounded-xl
              text-left font-medium
              transition-all duration-200 ease-in-out
              focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500
              hover:border-primary-400
              disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed disabled:hover:border-gray-300
              ${selectProps.error ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-300'}
              ${!selectProps.value ? 'text-gray-500' : 'text-gray-900'}
              ${isOpen ? 'border-primary-500 ring-2 ring-primary-500/20' : ''}
              ${selectProps.className}
            `}
          >
            {isOthersSelected && customInputValue
              ? customInputValue
              : selectedOption
                ? selectedOption.label
                : selectProps.placeholder}
          </button>
  
          {/* Custom dropdown arrow */}
          <div className={`
            absolute right-3 top-1/2 -translate-y-1/2
            pointer-events-none
            transition-all duration-200
            ${isOpen ? 'rotate-180' : 'rotate-0'}
            ${selectProps.disabled ? 'text-gray-400' : selectProps.error ? 'text-red-500' : 'text-primary-600'}
          `}>
            <FiChevronDown className="h-5 w-5" />
          </div>
  
          {/* Dropdown menu */}
          {isOpen && !selectProps.disabled && (
            (selectProps.usePortal !== false)
              ? createPortal(
                <div
                  ref={dropdownRef}
                  style={{
                    position: 'fixed',
                    top: menuStyle.top,
                    left: menuStyle.left,
                    width: menuStyle.width,
                    zIndex: selectProps.dropdownZIndex || 999999,
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
                    zIndex: selectProps.dropdownZIndex || 999999,
                  }}
                >
                  {Menu}
                </div>
              )
          )}
        </div>
  
        {selectProps.error && (
          <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
            <span className="inline-block w-1 h-1 rounded-full bg-red-600"></span>
            {selectProps.error}
          </p>
        )}
      </div>
    );
  };



  