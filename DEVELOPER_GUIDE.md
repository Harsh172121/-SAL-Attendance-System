# Quick Start Guide: Using 12-Hour Time Format in SAL

## 🚀 For Developers

### 1. Display a Time in 12-Hour Format

```javascript
import { formatTo12Hour } from '../utils/timeFormat';

// Convert and display
const time24 = '14:30';
const time12 = formatTo12Hour(time24);
console.log(time12); // Output: "2:30 PM"

// In JSX
<p>Lecture starts at {formatTo12Hour('09:00')}</p>
// Renders: "Lecture starts at 9:00 AM"
```

### 2. Use TimeInput Component in Forms

```javascript
import { TimeInput } from '../components';
import { useState } from 'react';

function MyForm() {
  const [startTime, setStartTime] = useState('09:00');
  
  return (
    <TimeInput
      label="Start Time"
      required
      value={startTime}
      onChange={(e) => setStartTime(e.target.value)}
    />
  );
}
```

**User sees**:
```
Start Time *
[09:00]
Displays as: 9:00 AM
```

### 3. Convert 12-Hour Back to 24-Hour

```javascript
import { convertFrom12To24 } from '../utils/timeFormat';

const time12 = '2:30 PM';
const time24 = convertFrom12To24(time12);
console.log(time24); // Output: "14:30"
```

### 4. Display Time Ranges

```javascript
import { formatTo12Hour } from '../utils/timeFormat';

<p>
  Class from {formatTo12Hour('14:30')} to {formatTo12Hour('15:30')}
</p>
// Renders: "Class from 2:30 PM to 3:30 PM"
```

### 5. Check Time Format

```javascript
import { is24HourFormat, is12HourFormat } from '../utils/timeFormat';

is24HourFormat('14:30');      // true
is24HourFormat('2:30 PM');    // false
is12HourFormat('14:30');      // false
is12HourFormat('2:30 PM');    // true
```

---

## 📋 Common Patterns

### Pattern 1: Time Input with Submission
```javascript
const [time, setTime] = useState('');

const handleSubmit = (e) => {
  e.preventDefault();
  // time is in 24-hour format (HH:MM)
  // Send directly to API
  api.saveTime(time);
};

return (
  <form onSubmit={handleSubmit}>
    <TimeInput
      label="Set Time"
      value={time}
      onChange={(e) => setTime(e.target.value)}
    />
    <button type="submit">Save</button>
  </form>
);
```

### Pattern 2: Display Table with Times
```javascript
import { formatTo12Hour } from '../utils/timeFormat';

const slots = [
  { id: 1, subject: 'Math', start: '09:00', end: '10:30' },
  { id: 2, subject: 'Physics', start: '14:00', end: '15:30' }
];

return (
  <table>
    <thead>
      <tr><th>Subject</th><th>Time</th></tr>
    </thead>
    <tbody>
      {slots.map(slot => (
        <tr key={slot.id}>
          <td>{slot.subject}</td>
          <td>{formatTo12Hour(slot.start)} - {formatTo12Hour(slot.end)}</td>
        </tr>
      ))}
    </tbody>
  </table>
);
```

### Pattern 3: Conditional Display by Time
```javascript
import { formatTo12Hour } from '../utils/timeFormat';

function TimeAlert({ slot }) {
  const isNight = slot.start >= '18:00';
  
  return (
    <div className={isNight ? 'evening' : 'daytime'}>
      {formatTo12Hour(slot.start)}
      {isNight && ' (Evening Lecture)'}
    </div>
  );
}
```

---

## 🔄 Data Flow

### Receiving Data from API
```javascript
// API returns 24-hour format
const response = { startTime: '14:30', endTime: '15:30' };

// Display in UI
<p>
  Time: {formatTo12Hour(response.startTime)} - {formatTo12Hour(response.endTime)}
</p>
// Shows: "Time: 2:30 PM - 3:30 PM"
```

### Sending Data to API
```javascript
// Form stores in 24-hour format (HTML native)
const formData = { startTime: '14:30' };

// Send directly - no conversion needed
await api.saveSlot(formData);
```

---

## ⚠️ Important Notes

### ✓ DO
- Use `formatTo12Hour()` for display only
- Store times in database as 24-hour format
- Send APIs 24-hour format
- Use `<TimeInput>` component for forms
- Keep conversion functions pure (no side effects)

### ✗ DON'T
- Store times as 12-hour strings in database
- Change API response format
- Modify stored data format
- Use formatted strings for calculations
- Display times without calling `formatTo12Hour()`

---

## 🧪 Testing Examples

```javascript
import { formatTo12Hour } from '../utils/timeFormat';

// Edge cases
console.log(formatTo12Hour('00:00')); // "12:00 AM" ✓
console.log(formatTo12Hour('12:00')); // "12:00 PM" ✓
console.log(formatTo12Hour('23:59')); // "11:59 PM" ✓

// Morning
console.log(formatTo12Hour('09:00')); // "9:00 AM" ✓

// Afternoon
console.log(formatTo12Hour('14:30')); // "2:30 PM" ✓

// Empty
console.log(formatTo12Hour(''));      // "" ✓
```

---

## 📚 API Reference

### `formatTo12Hour(time24: string): string`
Converts 24-hour format to 12-hour with AM/PM

**Input**: `'14:30'`, `'09:00'`, `'00:15'`, `'12:45'`
**Output**: `'2:30 PM'`, `'9:00 AM'`, `'12:15 AM'`, `'12:45 PM'`

### `convertFrom12To24(time12: string): string`
Converts 12-hour with AM/PM to 24-hour format

**Input**: `'2:30 PM'`, `'9:00 AM'`, `'12:15 AM'`
**Output**: `'14:30'`, `'09:00'`, `'00:15'`

### `is24HourFormat(time: string): boolean`
Checks if string is in 24-hour format

**Input**: `'14:30'` | `'2:30 PM'`
**Output**: `true` | `false`

### `is12HourFormat(time: string): boolean`
Checks if string is in 12-hour format

**Input**: `'2:30 PM'` | `'14:30'`
**Output**: `true` | `false`

---

## 🛠️ Troubleshooting

### Issue: Time not showing in 12-hour format
**Solution**: Make sure you imported and called `formatTo12Hour()`
```javascript
import { formatTo12Hour } from '../utils/timeFormat';
<p>{formatTo12Hour(time24)}</p> // ✓ Correct
<p>{time24}</p>                  // ✗ Wrong (shows 24-hour)
```

### Issue: TimeInput not showing preview
**Solution**: Check that `value` prop is in HH:MM format
```javascript
<TimeInput value="14:30" />      // ✓ Shows preview
<TimeInput value="" />           // ✗ No preview (empty)
```

### Issue: Build error - module not found
**Solution**: Check import path (components folder needs ../)
```javascript
import { TimeInput } from '../components';  // ✓ Correct
import { TimeInput } from '../../components'; // ✗ Wrong path
```

### Issue: Midnight displaying incorrectly
**Solution**: `formatTo12Hour('00:00')` correctly returns `'12:00 AM'`
- This is correct per 12-hour convention
- Not a bug, it's the expected behavior

---

## 📞 Support

For questions about time formatting:
1. Check the test file: `src/utils/timeFormat.test.js`
2. Review examples: `BEFORE_AFTER_EXAMPLES.md`
3. Read full docs: `TIME_FORMAT_MIGRATION.md`

---

**Last Updated**: April 21, 2026
**Version**: 1.0
