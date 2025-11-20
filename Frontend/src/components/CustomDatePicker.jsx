import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FiCalendar, FiX, FiChevronLeft, FiChevronRight, FiChevronUp, FiChevronDown } from 'react-icons/fi';

/**
 * Custom DatePicker Component with Beautiful Calendar UI
 * 
 * @param {string} label - Label for the date picker
 * @param {string} name - Name attribute for the input
 * @param {string} value - Current date value (YYYY-MM-DD format)
 * @param {function} onChange - Change handler function
 * @param {string} placeholder - Placeholder text
 * @param {boolean} required - Whether the field is required
 * @param {object} icon - Icon component to display
 * @param {string} error - Error message to display
 * @param {string} className - Additional CSS classes
 * @param {string} min - Minimum date (YYYY-MM-DD)
 * @param {string} max - Maximum date (YYYY-MM-DD)
 * @param {boolean} disabled - Whether the input is disabled
 * @param {boolean} defaultToday - Whether to default to today's date if no value
 */
const CustomDatePicker = ({
  label,
  name,
  value,
  onChange,
  placeholder = 'Select date',
  required = false,
  icon,
  error,
  className = '',
  min,
  max,
  disabled = false,
  defaultToday = false,
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [displayValue, setDisplayValue] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const pickerRef = useRef(null);
  const containerRef = useRef(null);
  const triggerRef = useRef(null);
  const [menuStyle, setMenuStyle] = useState({ top: 0, left: 0, width: 0 });

  // Get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Format date for display (DD/MM/YYYY)
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString + 'T00:00:00');
      if (isNaN(date.getTime())) return '';
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return '';
    }
  };

  // Initialize selected date from value
  useEffect(() => {
    if (value) {
      const date = new Date(value + 'T00:00:00');
      if (!isNaN(date.getTime())) {
        setSelectedDate(date);
        setCurrentMonth(new Date(date.getFullYear(), date.getMonth(), 1));
      }
    } else if (defaultToday) {
      const today = new Date();
      setSelectedDate(today);
      setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));
      const todayDate = getTodayDate();
      if (onChange) {
        const syntheticEvent = {
          target: { name, value: todayDate },
        };
        onChange(syntheticEvent);
      }
    } else {
      setSelectedDate(null);
    }
  }, [value, defaultToday, name, onChange]);

  // Update display value
  useEffect(() => {
    setDisplayValue(formatDateForDisplay(value));
  }, [value]);

  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current && !containerRef.current.contains(event.target) &&
        pickerRef.current && !pickerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Update calendar position when open/resize/scroll
  useEffect(() => {
    if (!isOpen || !triggerRef.current) return;
    
    const updatePosition = () => {
      if (!triggerRef.current) return;
      const rect = triggerRef.current.getBoundingClientRect();
      // Use fixed positioning for portal (relative to viewport)
      setMenuStyle({
        top: rect.bottom + 8,
        left: rect.left,
        width: rect.width,
      });
    };
    
    updatePosition();
    // Update on scroll and resize
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);
    
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isOpen]);

  // Get days in month
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  // Get first day of month
  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  // Navigate months
  const navigateMonth = (direction) => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + direction, 1));
  };

  // Navigate years
  const navigateYear = (direction) => {
    setCurrentMonth(new Date(currentMonth.getFullYear() + direction, currentMonth.getMonth(), 1));
  };

  // Select date
  const selectDate = (day) => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    setSelectedDate(newDate);
    
    const year = newDate.getFullYear();
    const month = String(newDate.getMonth() + 1).padStart(2, '0');
    const dayStr = String(newDate.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${dayStr}`;

    if (onChange) {
      const syntheticEvent = {
        target: { name, value: dateString },
      };
      onChange(syntheticEvent);
    }

    setIsOpen(false);
  };

  // Select today
  const selectToday = () => {
    const today = new Date();
    setSelectedDate(today);
    setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));
    
    const todayDate = getTodayDate();
    if (onChange) {
      const syntheticEvent = {
        target: { name, value: todayDate },
      };
      onChange(syntheticEvent);
    }
    setIsOpen(false);
  };

  // Clear date
  const clearDate = () => {
    setSelectedDate(null);
    if (onChange) {
      const syntheticEvent = {
        target: { name, value: '' },
      };
      onChange(syntheticEvent);
    }
    setIsOpen(false);
  };

  // Check if date is today
  const isToday = (day) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentMonth.getMonth() === today.getMonth() &&
      currentMonth.getFullYear() === today.getFullYear()
    );
  };

  // Check if date is selected
  const isSelected = (day) => {
    if (!selectedDate) return false;
    return (
      day === selectedDate.getDate() &&
      currentMonth.getMonth() === selectedDate.getMonth() &&
      currentMonth.getFullYear() === selectedDate.getFullYear()
    );
  };

  // Check if date is disabled
  const isDisabled = (day) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    if (min) {
      const minDate = new Date(min + 'T00:00:00');
      if (date < minDate) return true;
    }
    if (max) {
      const maxDate = new Date(max + 'T00:00:00');
      if (date > maxDate) return true;
    }
    return false;
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days = [];

    // Previous month days
    const prevMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 0);
    const prevMonthDays = prevMonth.getDate();
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({
        day: prevMonthDays - i,
        isCurrentMonth: false,
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        day: i,
        isCurrentMonth: true,
      });
    }

    // Next month days
    const remainingDays = 42 - days.length; // 6 weeks * 7 days
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        day: i,
        isCurrentMonth: false,
      });
    }

    return days;
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  return (
    <div className={`space-y-2 ${className}`} ref={containerRef}>
      {label && (
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-800 mb-1 font-lato">
          {icon && (
            <span className={`transition-colors duration-200 ${
              isOpen 
                ? 'text-primary-600' 
                : error 
                  ? 'text-red-500' 
                  : 'text-primary-500'
            }`}>
              {icon}
            </span>
          )}
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {/* Animated glow effect on open */}
        {isOpen && (
          <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-400 via-indigo-400 to-blue-400 rounded-xl opacity-20 blur-sm animate-pulse"></div>
        )}
        
        {/* Animated background gradient */}
        <div className={`absolute inset-0 rounded-xl transition-all duration-300 ${
          isOpen 
            ? 'opacity-100 bg-gradient-to-r from-primary-500/10 via-indigo-500/10 to-blue-500/10' 
            : 'opacity-0 hover:opacity-100 bg-gradient-to-r from-primary-400/5 via-indigo-400/5 to-blue-400/5'
        }`}></div>

        {/* Calendar Icon */}
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
          <div className={`p-1.5 rounded-lg transition-all duration-300 ${
            isOpen 
              ? 'bg-primary-500/20 text-primary-600 shadow-sm' 
              : error 
                ? 'bg-red-500/10 text-red-500' 
                : 'bg-gray-100/50 text-gray-500 hover:bg-primary-500/10 hover:text-primary-600'
          }`}>
            <FiCalendar className={`w-5 h-5 transition-transform duration-200 ${
              isOpen ? 'scale-110' : ''
            }`} />
          </div>
        </div>

        {/* Input Display */}
        <div
          ref={triggerRef}
          className={`relative w-full px-4 py-3.5 pl-14 pr-12 bg-white/70 backdrop-blur-xl border-2 rounded-xl shadow-lg transition-all duration-300 cursor-pointer font-lato ${
            error
              ? 'border-red-400/70 bg-red-50/40 shadow-red-200/50'
              : isOpen
              ? 'border-primary-500/80 bg-white/90 ring-4 ring-primary-500/20 shadow-xl shadow-primary-500/20 scale-[1.01]'
              : 'border-gray-300/70 hover:border-primary-400/60 hover:bg-white/80 hover:shadow-xl'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={() => !disabled && setIsOpen(!isOpen)}
        >
          <div className="flex items-center justify-between">
            <span className={`text-sm font-semibold transition-colors duration-200 font-lato ${
              value 
                ? 'text-gray-900' 
                : 'text-gray-400 italic'
            }`}>
              {displayValue || placeholder}
            </span>
            {!value && (
              <span className="text-xs text-gray-400 font-normal ml-2 font-source-sans">
                Click to select
              </span>
            )}
          </div>
        </div>

        {/* Clear button */}
        {value && !disabled && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              clearDate();
            }}
            className="absolute inset-y-0 right-0 pr-3 flex items-center z-30 group/clear"
            aria-label="Clear date"
          >
            <div className="p-1.5 rounded-lg bg-gray-100/60 hover:bg-red-100/80 transition-all duration-200 group-hover/clear:scale-110 group-hover/clear:rotate-90">
              <FiX className="w-4 h-4 text-gray-500 group-hover/clear:text-red-600 transition-colors duration-200" />
            </div>
          </button>
        )}

        {/* Calendar Popup - Rendered via Portal to avoid overflow clipping */}
        {isOpen && !disabled && createPortal(
          <div
            ref={pickerRef}
            style={{
              position: 'fixed',
              top: menuStyle.top,
              left: menuStyle.left,
              width: menuStyle.width || 'auto',
              minWidth: '320px',
              zIndex: 999999,
            }}
            className="bg-white/95 backdrop-blur-xl border-2 border-gray-200/60 rounded-xl shadow-2xl overflow-hidden"
          >
            {/* Calendar Header */}
            <div className="bg-gradient-to-r from-primary-500/10 via-indigo-500/10 to-blue-500/10 px-3 py-2 border-b border-gray-200/60">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => navigateYear(-1)}
                    className="p-1 rounded-md hover:bg-white/50 transition-colors"
                  >
                    <FiChevronUp className="w-3.5 h-3.5 text-gray-600" />
                  </button>
                  <button
                    type="button"
                    onClick={() => navigateMonth(-1)}
                    className="p-1 rounded-md hover:bg-white/50 transition-colors"
                  >
                    <FiChevronLeft className="w-3.5 h-3.5 text-gray-600" />
                  </button>
                </div>
                
                <h3 className="text-sm font-bold text-gray-900 font-montserrat">
                  {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </h3>
                
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => navigateMonth(1)}
                    className="p-1 rounded-md hover:bg-white/50 transition-colors"
                  >
                    <FiChevronRight className="w-3.5 h-3.5 text-gray-600" />
                  </button>
                  <button
                    type="button"
                    onClick={() => navigateYear(1)}
                    className="p-1 rounded-md hover:bg-white/50 transition-colors"
                  >
                    <FiChevronDown className="w-3.5 h-3.5 text-gray-600" />
                  </button>
                </div>
              </div>
            </div>

            {/* Days of Week Header */}
            <div className="grid grid-cols-7 gap-0.5 px-2 pt-2 pb-1 bg-white/50">
              {dayNames.map((day) => (
                <div
                  key={day}
                  className="text-center text-[10px] font-semibold text-gray-600 py-1 font-roboto"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-0.5 p-2">
              {generateCalendarDays().map(({ day, isCurrentMonth }, index) => {
                const disabled = !isCurrentMonth || isDisabled(day);
                const isTodayDate = isCurrentMonth && isToday(day);
                const isSelectedDate = isCurrentMonth && isSelected(day);

                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => !disabled && selectDate(day)}
                    disabled={disabled}
                    className={`
                      aspect-square rounded-md text-xs font-semibold transition-all duration-200 font-roboto
                      ${disabled 
                        ? 'text-gray-300 cursor-not-allowed' 
                        : isSelectedDate
                        ? 'bg-gradient-to-br from-primary-500 to-indigo-600 text-white shadow-md scale-105 z-10'
                        : isTodayDate
                        ? 'bg-primary-100 text-primary-700 border border-primary-300'
                        : 'text-gray-700 hover:bg-primary-50 hover:text-primary-700 hover:scale-105'
                      }
                    `}
                  >
                    {day}
                  </button>
                );
              })}
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-between px-2 py-1.5 border-t border-gray-200/60 bg-white/50">
              <button
                type="button"
                onClick={clearDate}
                className="px-3 py-1 text-xs font-semibold text-gray-600 hover:text-red-600 hover:bg-red-50/50 rounded-md transition-all duration-200 font-roboto"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={selectToday}
                className="px-3 py-1 text-xs font-semibold text-primary-600 hover:text-white hover:bg-gradient-to-r hover:from-primary-500 hover:to-indigo-600 rounded-md transition-all duration-200 font-roboto"
              >
                Today
              </button>
            </div>
          </div>,
          document.body
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="mt-1.5 flex items-center gap-2 px-3 py-2 bg-red-50/80 border border-red-200/60 rounded-lg backdrop-blur-sm">
          <div className="p-1 bg-red-100 rounded-full">
            <FiX className="w-3 h-3 text-red-600" />
          </div>
          <p className="text-red-600 text-xs font-semibold font-raleway">{error}</p>
        </div>
      )}
    </div>
  );
};

export default CustomDatePicker;

