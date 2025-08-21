import React, { useState, useEffect, useRef, useCallback } from 'react';
import '../DateTimePicker.css';

const DateTimePicker = ({ 
  value, 
  onChange, 
  label, 
  icon, 
  minDateTime = null,
  maxDateTime = null,
  placeholder = "Select date and time",
  disabled = false 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isMobile, setIsMobile] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState('bottom');
  const [horizontalPosition, setHorizontalPosition] = useState('left');
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // Helper function to format date without timezone issues
  const formatDateString = useCallback((year, month, day) => {
    const yearStr = year.toString();
    const monthStr = (month + 1).toString().padStart(2, '0'); // month is 0-indexed
    const dayStr = day.toString().padStart(2, '0');
    return `${yearStr}-${monthStr}-${dayStr}`;
  }, []);

  // Helper function to get date string from Date object without timezone issues
  const getLocalDateString = useCallback((date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();
    return formatDateString(year, month, day);
  }, [formatDateString]);

  // Check if mobile device and handle body scroll
  useEffect(() => {
    const checkMobile = () => {
      // Force mobile mode for smaller screens or when viewport height is limited
      const isMobileScreen = window.innerWidth <= 768 || window.innerHeight <= 600;

      // Also check if we're in a modal context which should use modal-style behavior
      const modalOverlay = document.querySelector('.slot-modal-overlay') ||
                           document.querySelector('.modern-modal-overlay');
      const isInModal = modalOverlay !== null;

      // Check if any modal-like element exists
      const hasModalElements = document.querySelector('[class*="modal"]') !== null;

      setIsMobile(isMobileScreen || isInModal || hasModalElements);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    // Also check when DOM changes (modals open/close)
    const observer = new MutationObserver(checkMobile);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener('resize', checkMobile);
      observer.disconnect();
    };
  }, []);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if ((isMobile || dropdownPosition === 'fixed') && isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.classList.add('datetime-picker-modal-open');
    } else {
      document.body.style.overflow = '';
      document.body.classList.remove('datetime-picker-modal-open');
    }

    return () => {
      document.body.style.overflow = '';
      document.body.classList.remove('datetime-picker-modal-open');
    };
  }, [isMobile, isOpen, dropdownPosition]);

  // Initialize from value prop
  useEffect(() => {
    if (value) {
      const date = new Date(value);
      setSelectedDate(getLocalDateString(date));
      setSelectedTime(date.toTimeString().slice(0, 5));
    } else {
      setSelectedDate('');
      setSelectedTime('');
    }
  }, [value, getLocalDateString]);

  // Close dropdown when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
          inputRef.current && !inputRef.current.contains(event.target)) {
        setIsOpen(false);
      }

      // Also close if clicking on modal overlay (for fixed positioning)
      if (dropdownPosition === 'fixed' &&
          (event.target.classList.contains('slot-modal-overlay') ||
           event.target.classList.contains('modern-modal-overlay'))) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);

      // Check dropdown position for better visibility
      if (inputRef.current) {
        setTimeout(() => {
          const rect = inputRef.current.getBoundingClientRect();
          const viewportHeight = window.innerHeight;
          const viewportWidth = window.innerWidth;

          // Check if we're inside a modal by looking for modal overlay
          const modalOverlay = document.querySelector('.slot-modal-overlay') ||
                               document.querySelector('.modern-modal-overlay');
          const isInModal = modalOverlay && modalOverlay.contains(inputRef.current);

          // Also check for any element with modal-like characteristics
          let currentElement = inputRef.current;
          let isInModalContext = false;
          while (currentElement && currentElement !== document.body) {
            const classList = Array.from(currentElement.classList || []);
            const hasModalClass = classList.some(className =>
              className.includes('modal') ||
              className.includes('Modal')
            );

            if (hasModalClass ||
                currentElement.classList.contains('slot-modal-overlay') ||
                currentElement.classList.contains('modern-modal-overlay') ||
                currentElement.classList.contains('modal-overlay') ||
                currentElement.classList.contains('slot-modal-card') ||
                currentElement.style.position === 'fixed' ||
                (currentElement.style.zIndex && parseInt(currentElement.style.zIndex) > 1000)) {
              isInModalContext = true;
              break;
            }
            currentElement = currentElement.parentElement;
          }

          // Also check if viewport is constrained (likely in a modal)
          const isConstrainedViewport = viewportHeight < 700 || viewportWidth < 500;

          // Check if there's limited space around the input (modal context)
          const hasLimitedSpace = rect.bottom > viewportHeight - 200 || rect.top < 200;

          const dropdownHeight = 500; // Estimated dropdown height
          const dropdownWidth = 380;

          // Use fixed positioning if in modal, constrained viewport, or limited space
          if (isInModal || isInModalContext || isConstrainedViewport || hasLimitedSpace || isMobile) {
            // For modals or constrained viewports, use fixed positioning to center the dropdown
            setDropdownPosition('fixed');
            setHorizontalPosition('center');
          } else {
            // Original positioning logic for non-modal contexts
            const spaceBelow = viewportHeight - rect.bottom - 20; // 20px safety margin
            const spaceAbove = rect.top - 20; // 20px safety margin
            const spaceRight = viewportWidth - rect.right - 20;
            const spaceLeft = rect.left - 20;

            // Vertical positioning - prioritize showing above if not enough space below
            if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
              setDropdownPosition('top');
            } else if (spaceBelow < dropdownHeight && spaceAbove < dropdownHeight) {
              // If neither has enough space, use the one with more space
              setDropdownPosition(spaceAbove > spaceBelow ? 'top' : 'bottom');
            } else {
              setDropdownPosition('bottom');
            }

            // Horizontal positioning
            if (spaceRight < dropdownWidth && spaceLeft > dropdownWidth) {
              setHorizontalPosition('right');
            } else if (spaceLeft < dropdownWidth/2 && spaceRight > dropdownWidth/2) {
              setHorizontalPosition('left');
            } else if (spaceLeft > dropdownWidth/2 && spaceRight > dropdownWidth/2) {
              setHorizontalPosition('center');
            } else {
              setHorizontalPosition('left');
            }
          }
        }, 10);
      }
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, isMobile, dropdownPosition]);

  const formatDisplayValue = () => {
    if (!selectedDate || !selectedTime) return '';
    try {
      // Create date using local timezone to avoid timezone shifts
      const [year, month, day] = selectedDate.split('-').map(Number);
      const [hours, minutes] = selectedTime.split(':').map(Number);
      const date = new Date(year, month - 1, day, hours, minutes); // month is 0-indexed in Date constructor

      if (isNaN(date.getTime())) return '';
      return date.toLocaleString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      // Error handling for date formatting
      return '';
    }
  };

  const handleDateSelect = (day) => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const dateStr = formatDateString(year, month, day);

    // Check if date is within allowed range
    if (minDateTime) {
      const minDate = getLocalDateString(new Date(minDateTime));
      if (dateStr < minDate) return;
    }
    if (maxDateTime) {
      const maxDate = getLocalDateString(new Date(maxDateTime));
      if (dateStr > maxDate) return;
    }

    setSelectedDate(dateStr);

    // If time is already selected, update the full value
    if (selectedTime) {
      const fullDateTime = `${dateStr}T${selectedTime}`;
      onChange(fullDateTime);
    }
  };

  const handleTimeChange = (time) => {
    setSelectedTime(time);

    // If date is already selected, update the full value
    if (selectedDate) {
      const fullDateTime = `${selectedDate}T${time}`;
      onChange(fullDateTime);
    }
  };

  const handleQuickTime = (hours, minutes = 0) => {
    const time = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    handleTimeChange(time);
  };

  const handleTodayClick = () => {
    const today = new Date();
    const dateStr = getLocalDateString(today);
    // Round to next 15-minute interval
    const minutes = today.getMinutes();
    const roundedMinutes = Math.ceil(minutes / 15) * 15;
    const roundedTime = new Date(today);
    roundedTime.setMinutes(roundedMinutes, 0, 0);
    const timeStr = roundedTime.toTimeString().slice(0, 5);

    setSelectedDate(dateStr);
    setSelectedTime(timeStr);
    onChange(`${dateStr}T${timeStr}`);
    setCurrentMonth(today);
  };

  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  };

  const isDateDisabled = (day) => {
    if (!day) return true;

    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const dateStr = formatDateString(year, month, day);

    if (minDateTime) {
      const minDate = getLocalDateString(new Date(minDateTime));
      if (dateStr < minDate) return true;
    }
    if (maxDateTime) {
      const maxDate = getLocalDateString(new Date(maxDateTime));
      if (dateStr > maxDate) return true;
    }

    return false;
  };

  const isToday = (day) => {
    if (!day) return false;
    const today = new Date();
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    return (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    );
  };

  const isSelected = (day) => {
    if (!day || !selectedDate) return false;
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const dateStr = formatDateString(year, month, day);
    return dateStr === selectedDate;
  };

  const navigateMonth = (direction) => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      newMonth.setMonth(prev.getMonth() + direction);
      return newMonth;
    });
  };

  return (
    <div className="datetime-picker-container" ref={dropdownRef}>
      <label className="datetime-picker-label">
        {icon && <span className="datetime-picker-icon">{icon}</span>}
        {label}
      </label>

      <div className="datetime-picker-input-wrapper" ref={inputRef}>
        <input
          type="text"
          className="datetime-picker-input"
          value={formatDisplayValue()}
          placeholder={placeholder}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          readOnly
          disabled={disabled}
          aria-label={label}
          aria-haspopup="dialog"
        />
        <button
          type="button"
          className="datetime-picker-toggle"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          aria-label="Open date and time picker"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
        </button>
      </div>

      {isOpen && (
        <>
          {(isMobile || dropdownPosition === 'fixed') && <div className="datetime-picker-backdrop" onClick={() => setIsOpen(false)} />}
          <div
            className={`datetime-picker-dropdown ${
              dropdownPosition === 'fixed' ? 'dropdown-fixed' :
              dropdownPosition === 'top' ? 'dropdown-top' : ''
            } ${
              horizontalPosition === 'right' ? 'dropdown-right' :
              horizontalPosition === 'center' ? 'dropdown-center' : ''
            }`}
            role="dialog"
            aria-modal="true"
            aria-label="Date and time picker"
          >
            <div className="datetime-picker-content">
            {/* Calendar Section */}
            <div className="calendar-section">
              <div className="calendar-header">
                <button
                  type="button"
                  className="nav-button"
                  onClick={() => navigateMonth(-1)}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="15,18 9,12 15,6"/>
                  </svg>
                </button>
                
                <h3 className="month-year">
                  {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h3>
                
                <button
                  type="button"
                  className="nav-button"
                  onClick={() => navigateMonth(1)}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9,18 15,12 9,6"/>
                  </svg>
                </button>
              </div>

              <div className="calendar-grid">
                <div className="weekdays">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="weekday">{day}</div>
                  ))}
                </div>
                
                <div className="days-grid">
                  {getDaysInMonth().map((day, index) => (
                    <button
                      key={index}
                      type="button"
                      className={`day-button ${
                        isSelected(day) ? 'selected' : ''
                      } ${isToday(day) ? 'today' : ''} ${
                        isDateDisabled(day) ? 'disabled' : ''
                      }`}
                      onClick={() => day && !isDateDisabled(day) && handleDateSelect(day)}
                      disabled={isDateDisabled(day)}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                className="today-button"
                onClick={handleTodayClick}
              >
                Today
              </button>
            </div>

            {/* Time Section */}
            <div className="time-section">
              <h4 className="time-header">Select Time</h4>

              {/* Quick Time Buttons */}
              <div className="quick-times">
                <button
                  type="button"
                  className="quick-time-btn now-btn"
                  onClick={() => {
                    const now = new Date();
                    const roundedMinutes = Math.ceil(now.getMinutes() / 15) * 15;
                    const roundedTime = new Date(now);
                    roundedTime.setMinutes(roundedMinutes, 0, 0);
                    handleTimeChange(roundedTime.toTimeString().slice(0, 5));
                  }}
                >
                  Now
                </button>
                <button
                  type="button"
                  className="quick-time-btn"
                  onClick={() => handleQuickTime(9, 0)}
                >
                  9:00 AM
                </button>
                <button
                  type="button"
                  className="quick-time-btn"
                  onClick={() => handleQuickTime(12, 0)}
                >
                  12:00 PM
                </button>
                <button
                  type="button"
                  className="quick-time-btn"
                  onClick={() => handleQuickTime(17, 0)}
                >
                  5:00 PM
                </button>
                <button
                  type="button"
                  className="quick-time-btn"
                  onClick={() => handleQuickTime(18, 0)}
                >
                  6:00 PM
                </button>
                <button
                  type="button"
                  className="quick-time-btn"
                  onClick={() => handleQuickTime(20, 0)}
                >
                  8:00 PM
                </button>
              </div>

              {/* Time Input */}
              <div className="time-input-section">
                <input
                  type="time"
                  className="time-input"
                  value={selectedTime}
                  onChange={(e) => handleTimeChange(e.target.value)}
                />
              </div>

              {/* Action Buttons */}
              <div className="datetime-actions">
                <button
                  type="button"
                  className="action-btn clear"
                  onClick={() => {
                    setSelectedDate('');
                    setSelectedTime('');
                    onChange('');
                    setIsOpen(false);
                  }}
                >
                  Clear
                </button>
                <button
                  type="button"
                  className="action-btn confirm"
                  onClick={() => setIsOpen(false)}
                  disabled={!selectedDate || !selectedTime}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
        </>
      )}
    </div>
  );
};

export default DateTimePicker;
