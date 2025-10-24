import React from 'react';
import { DayPicker } from 'react-day-picker';
import { format, addDays } from 'date-fns';
import 'react-day-picker/src/style.css';
import '../styles/DatePicker.css';

interface DatePickerProps {
  selectedDate?: Date;
  onDateSelect: (date: Date | undefined) => void;
  minDaysFromNow?: number;
  maxDaysFromNow?: number;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  selectedDate,
  onDateSelect,
  minDaysFromNow = 1, // Tomorrow by default
  maxDaysFromNow = 90, // 3 months out by default
}) => {
  const today = new Date();
  const minDate = addDays(today, minDaysFromNow);
  const maxDate = addDays(today, maxDaysFromNow);

  const handleSelect = (date: Date | undefined) => {
    onDateSelect(date);
  };

  return (
    <div className="date-picker-wrapper">
      <DayPicker
        mode="single"
        selected={selectedDate}
        onSelect={handleSelect}
        disabled={[
          { before: minDate },
          { after: maxDate }
        ]}
        fromDate={minDate}
        toDate={maxDate}
        defaultMonth={minDate}
        showOutsideDays={false}
        weekStartsOn={1} // Monday
        footer={
          selectedDate ? (
            <p className="date-picker-footer">
              Selected: {format(selectedDate, 'PPPP')}
            </p>
          ) : (
            <p className="date-picker-footer">
              Please select a delivery date
            </p>
          )
        }
      />
    </div>
  );
};

export default DatePicker;
