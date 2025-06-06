# Flight Management App Structure

## Main Layout (page.tsx)

### Screen Division
- **Left Side (60%)**: Primary display area for flight information
  - Toggleable between three different display modes
  - Houses content from `/displays` folder components
- **Right Side (40%)**:
  - **Upper Half**: Interactive controls and forms
    - Flight editing/adding options
    - Warning displays
    - Weather forecasts
  - **Lower Half**: AI chatbot interface
    - LLM with full flight data access
    - Function calling capabilities

---

### data.tsx (Primary Data Store)
**Role**: Ground truth data repository

**Flight Data Structure**:
- Departure airport
- Arrival airport
- Aircraft assignment
- Departure time
- Arrival time (automatically calculated)

**Additional Tracking**:
- Current aircraft locations (3 planes)

**Functions**: Complete CRUD operations for all flight data
- Used by UI components
- Accessible to AI system

---

## Display Components (`/displays`)

### List.tsx
**Purpose**: Clean list view of all flights

**Features**:
- Complete flight roster display
- Per-flight action buttons:
  - Edit (opens form in right upper panel)
  - Add (opens form in right upper panel) 
  - Delete
- Additional view options:
  - Warnings display
  - Weather data integration

### Week.tsx
**Purpose**: Weekly calendar view of flights
- Calendar widget displaying flights by week
- Visual scheduling overview

### Month.tsx
**Purpose**: Monthly calendar view of flights
- Calendar widget displaying flights by month
- Long-term scheduling perspective

---

## Interactive Components (`/components`)

### editFlight.tsx
- **Location**: Right upper panel
- **Function**: Form interface for modifying existing flights
- **Integration**: Connects to backend data functions

### addFlight.tsx
- **Location**: Right upper panel
- **Function**: Form interface for creating new flights
- **Integration**: Connects to backend data functions

### showWarnings.tsx
- **Location**: Right upper panel
- **Function**: Display flight conflict alerts and warnings
- **Data Source**: collectWarnings.tsx backend

### weatherForecast.tsx
- **Location**: Right upper panel
- **Function**: Show weather data for specific flights
- **Data Source**: weather.tsx backend

### chatInterface.tsx
- **Location**: Right lower panel
- **Function**: AI chatbot interface
- **Features**: Full flight data access and modification capabilities

---

## Backend Systems (`/backend`)

### collectWarnings.tsx
**Purpose**: Conflict detection and validation

**Conflict Types Monitored**:
- Double-booked aircraft (same plane, overlapping times)
- Time/distance mismatches (unrealistic travel times)

**Integration**: 
- Powers showWarnings.tsx component
- Available to AI system for analysis

### weather.tsx
**Purpose**: Weather data integration
- External weather API integration
- Flight-specific forecast retrieval
- Feeds weatherForecast.tsx component

### AIManager.tsx
**Purpose**: LLM system controller

**Capabilities**:
- Full flight data access
- Function calling for data modification
- Conversation flow management
- User interaction handling

**Location**: Displays in right lower panel via chatInterface.tsx