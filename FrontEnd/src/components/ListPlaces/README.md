# ListPlaces Component

This is a unified component that replaces the three separate listing components:
- ListAccommodation
- ListAttractions
- ListFoodServices

## Features

- Single, reusable component for displaying accommodations, attractions, and food services
- Responsive design that works on all screen sizes
- Pagination support
- Filtering capabilities including name search and price range
- Sorting options
- Loading state and skeleton loading UI
- Supports selection mode for trip planning

## Usage

```jsx
import ListPlaces from '../../components/ListPlaces';

const MyComponent = ({ status, setCurDes, city, setListData }) => {
  return (
    <ListPlaces 
      status={status}        // Status can be "Default", "Schedule", or "WishList"
      setCurDes={setCurDes}  // Function to set the current destination
      city={city}            // Current city filter
      setListData={setListData} // Optional callback to update parent component with list data
      type="accommodation"   // Type can be "accommodation", "attraction", or "foodService"
    />
  );
};
```

## Props

| Prop Name    | Type     | Required | Default    | Description                                         |
|--------------|----------|----------|------------|-----------------------------------------------------|
| status       | string   | No       | "Default"  | "Default", "Schedule", or "WishList"                |
| setCurDes    | function | Yes      | -          | Function to set the current selected destination    |
| city         | string   | No       | ""         | City to filter results by                           |
| setListData  | function | No       | -          | Callback to update parent with the current list data|
| type         | string   | Yes      | -          | "accommodation", "attraction", or "foodService"     |

## Sub-Components

The ListPlaces component consists of several subcomponents that can also be used individually:

```jsx
import { List, ListItem, Filters, calculateTotalRate, SelectButton } from '../../components/ListPlaces';
```

### Helpers

For backward compatibility, the following utility functions are also exported:

```jsx
import { calculateTotalRate, SelectButton } from '../../components/ListPlaces';
```

## CSS

The component includes a shared CSS file that consolidates styles from all three previous components: 