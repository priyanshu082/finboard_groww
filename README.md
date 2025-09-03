# FinBoard 

**FinBoard** is a customizable, real-time finance dashboard builder that lets you create beautiful data visualizations by connecting to any JSON API. Build your own financial monitoring dashboard with drag-and-drop widgets, real-time data updates, and seamless API integration.

![FinBoard Dashboard](public/groww_img.png)

## ✨ Features

### Core Functionality
- **Dashboard Builder**: Create, customize, and manage multiple widgets with an intuitive drag-and-drop interface.
- **Real-time Data**: Automatic data refresh with configurable intervals (10s to 1 hour).
- **API Integration**: Connect to any JSON API endpoint using a secure server-side proxy.
- **Field Selection**: Smart field detection and selection for optimal data visualization.

### 📊 Widget Types
- **📈 Cards**: Display key metrics, prices, and KPIs in beautiful card layouts.
- **📋 Tables**: Sortable, searchable data tables with pagination and filtering.
- **📊 Charts**: Interactive line, bar, and area charts with real-time updates.

### 🛡️ Security, Performance & Data Handling
- **Secure Proxy Server**: All API requests are routed through a server-side proxy. This protects your API keys, avoids CORS issues, and keeps sensitive credentials out of the browser. The proxy also enables you to connect to third-party APIs securely from the frontend.
- **Caching**: The proxy server implements in-memory caching for API responses, reducing redundant requests and improving dashboard performance. Cached data is served for a short period (e.g., 30 seconds) to ensure both speed and freshness.
- **Rate Limiting**: Built-in rate limiting on the proxy server helps prevent API abuse and keeps your usage within safe limits.
- **Data Persistence**: Widget configurations and dashboard layouts are persisted locally (e.g., in localStorage or IndexedDB), so your customizations remain intact even after refreshing or closing the browser.
- **State Management with Zustand**: FinBoard uses [Zustand](https://github.com/pmndrs/zustand) for lightweight, fast, and scalable state management. All widget states, dashboard layouts, and user preferences are managed efficiently and can be easily persisted.
- **Error Handling**: Comprehensive error states and loading indicators for robust user experience.
- **Data Validation**: Smart data parsing and field type detection for reliable visualizations.

### 🎨 User Experience
- **Dark/Light Theme**: Seamless theme switching with system preference detection.
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices.
- **Drag & Drop**: Intuitive widget reordering and layout management.
- **Search & Filter**: Advanced filtering and search capabilities for tables.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
