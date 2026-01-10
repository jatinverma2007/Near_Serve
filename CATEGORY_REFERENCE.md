# Service Categories - Quick Reference

## Complete Category List (15 Total)

| Category Value | Display Name | Description |
|----------------|--------------|-------------|
| `plumber` | Plumber | Plumbing services, pipe repairs, installations |
| `electrician` | Electrician | Electrical work, wiring, installations |
| `carpenter` | Carpenter | Woodwork, furniture making, repairs |
| `painter` | Painter | Interior/exterior painting services |
| `cleaner` | Cleaner | House cleaning, office cleaning services |
| `gardener` | Gardener | Gardening, landscaping, lawn care |
| `mechanic` | Mechanic | Vehicle repairs, maintenance |
| `tutor` | Tutor | Private tutoring, educational services |
| `photographer` | Photographer | Photography services, events |
| `chef` | Chef | Cooking services, catering |
| `ac-repair` | **AC Repair** ⭐ NEW | Air conditioning installation, repair, maintenance |
| `salon` | **Salon** ⭐ NEW | Hair styling, beauty services, grooming |
| `pest-control` | **Pest Control** ⭐ NEW | Pest extermination, prevention services |
| `appliance-repair` | **Appliance Repair** ⭐ NEW | Washing machine, refrigerator, microwave repair |
| `other` | Other | Other miscellaneous services |

## Category Usage Examples

### AC Repair Services
- AC installation
- AC repair and servicing
- AC gas refilling
- Duct cleaning
- Preventive maintenance

### Salon Services
- Haircuts and styling
- Hair coloring
- Facials and skincare
- Manicure/pedicure
- Bridal makeup
- Spa services

### Pest Control Services
- Termite treatment
- Rodent control
- Mosquito control
- Cockroach extermination
- Bed bug treatment
- General pest prevention

### Appliance Repair Services
- Washing machine repair
- Refrigerator repair
- Microwave repair
- Dishwasher repair
- Oven/stove repair
- Water purifier repair

## Code Usage

### In Provider Setup Form:
```javascript
const categoryOptions = [
  'plumber', 'electrician', 'carpenter', 'painter', 'cleaner',
  'gardener', 'mechanic', 'tutor', 'photographer', 'chef',
  'ac-repair', 'salon', 'pest-control', 'appliance-repair', 'other'
];
```

### In Search Dropdown:
```javascript
{ name: 'AC Repair', value: 'ac-repair' }
{ name: 'Salon', value: 'salon' }
{ name: 'Pest Control', value: 'pest-control' }
{ name: 'Appliance Repair', value: 'appliance-repair' }
```

### In Database Models:
```javascript
enum: [
  'plumber', 'electrician', 'mechanic', 'carpenter', 'painter', 
  'cleaner', 'gardener', 'tutor', 'photographer', 'chef', 
  'ac-repair', 'salon', 'pest-control', 'appliance-repair', 'other'
]
```

## Display Formatting

The system automatically converts:
- `ac-repair` → "AC Repair"
- `pest-control` → "Pest Control"
- `appliance-repair` → "Appliance Repair"

Using this logic:
```javascript
category.split('-').map(word => 
  word.charAt(0).toUpperCase() + word.slice(1)
).join(' ')
```

## API Endpoints Affected

✅ **POST /api/providers** - Create provider profile
✅ **PUT /api/providers/:id** - Update provider profile
✅ **POST /api/services** - Create service
✅ **PUT /api/services/:id** - Update service
✅ **GET /api/services/search** - Search services by category
✅ **GET /api/services?category=ac-repair** - Filter by category

## Validation

Both frontend and backend validate that categories match the allowed list. Invalid categories will be rejected with an error message.

**Backend Error:**
```json
{
  "success": false,
  "message": "invalid-category is not a valid category"
}
```

## Migration Notes

✅ **No database migration required**
✅ **Existing data remains valid**
✅ **New categories immediately available**
✅ **Backward compatible**

Simply restart the backend server to apply the changes!
