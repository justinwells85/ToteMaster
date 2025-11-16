# ToteMaster

A comprehensive home inventory management system that helps you organize and track items stored in containers throughout your house. Built with ASP.NET Core and React, designed to run on Windows machines and be accessible over your home network.

![ToteMaster Home](https://github.com/user-attachments/assets/bbf44f73-8a75-42ac-967b-6654bbae95f0)

## Features

- **📍 Locations Management**: Create and manage designated storage areas in your home (e.g., Garage, Basement, Attic)
- **📦 Container Tracking**: Organize your storage by associating containers (totes, boxes) with specific locations
- **📝 Item Inventory**: Keep detailed records of items stored in each container with descriptions and quantities
- **🔍 Visual Organization**: Clean, intuitive interface with card-based layouts for easy browsing
- **🔗 Hierarchical Structure**: Items → Containers → Locations for logical organization
- **✨ Real-time Updates**: Instant feedback on all CRUD operations

## Technology Stack

### Backend
- **ASP.NET Core 10.0** - Web API framework
- **Entity Framework Core** - ORM for database operations
- **SQLite** - Lightweight, file-based database (no separate server needed)

### Frontend
- **React 18** - UI framework
- **React Router** - Client-side routing
- **Vite** - Fast build tool and dev server
- **Modern CSS** - Responsive design with custom styling

## Prerequisites

- **.NET 10.0 SDK** - [Download here](https://dotnet.microsoft.com/download)
- **Node.js 18+** - [Download here](https://nodejs.org/)
- **Windows OS** - Recommended for hosting

## Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/justinwells85/ToteMaster.git
cd ToteMaster
```

### 2. Set Up the Backend API

```bash
cd ToteMasterAPI
dotnet restore
dotnet build
```

### 3. Set Up the Frontend

```bash
cd ../frontend
npm install
```

## Running the Application

### Development Mode

You'll need to run both the backend API and frontend development server.

**Terminal 1 - Start the API:**
```bash
cd ToteMasterAPI
dotnet run
```
The API will be available at `http://localhost:5000`

**Terminal 2 - Start the Frontend:**
```bash
cd frontend
npm run dev
```
The frontend will be available at `http://localhost:5173`

### Production Build

**Build the Frontend:**
```bash
cd frontend
npm run build
```

The production build will be created in `frontend/dist/` directory.

**Run the API in Production:**
```bash
cd ToteMasterAPI
dotnet run --configuration Release
```

## Accessing Over Home Network

To access ToteMaster from other devices on your home network:

### 1. Find Your Computer's Local IP Address

**Windows:**
```bash
ipconfig
```
Look for "IPv4 Address" under your active network connection (e.g., `192.168.1.100`)

### 2. Configure the Backend

Update `ToteMasterAPI/Properties/launchSettings.json` to listen on all interfaces:

```json
"applicationUrl": "http://0.0.0.0:5000"
```

Or run with the URL parameter:
```bash
dotnet run --urls "http://0.0.0.0:5000"
```

### 3. Configure Windows Firewall

Allow incoming connections on port 5000:
```powershell
netsh advfirewall firewall add rule name="ToteMaster API" dir=in action=allow protocol=TCP localport=5000
```

### 4. Access from Other Devices

From any device on your home network, navigate to:
```
http://[YOUR_IP_ADDRESS]:5173
```

For example: `http://192.168.1.100:5173`

## Project Structure

```
ToteMaster/
├── ToteMasterAPI/              # Backend ASP.NET Core API
│   ├── Controllers/            # API endpoints
│   │   ├── LocationsController.cs
│   │   ├── ContainersController.cs
│   │   └── ItemsController.cs
│   ├── Models/                 # Data models
│   │   ├── Location.cs
│   │   ├── Container.cs
│   │   └── Item.cs
│   ├── Data/                   # Database context
│   │   └── ToteMasterContext.cs
│   ├── Program.cs              # Application entry point
│   └── appsettings.json        # Configuration
│
├── frontend/                   # React frontend application
│   ├── src/
│   │   ├── pages/              # Page components
│   │   │   ├── Home.jsx
│   │   │   ├── Locations.jsx
│   │   │   ├── Containers.jsx
│   │   │   └── Items.jsx
│   │   ├── services/           # API integration
│   │   │   └── api.js
│   │   ├── styles/             # CSS styling
│   │   │   └── pages.css
│   │   ├── App.jsx             # Main application component
│   │   └── main.jsx            # Application entry point
│   └── package.json
│
└── README.md
```

## API Endpoints

### Locations
- `GET /api/locations` - Get all locations
- `GET /api/locations/{id}` - Get location by ID
- `POST /api/locations` - Create new location
- `PUT /api/locations/{id}` - Update location
- `DELETE /api/locations/{id}` - Delete location

### Containers
- `GET /api/containers` - Get all containers
- `GET /api/containers/{id}` - Get container by ID
- `POST /api/containers` - Create new container
- `PUT /api/containers/{id}` - Update container
- `DELETE /api/containers/{id}` - Delete container

### Items
- `GET /api/items` - Get all items
- `GET /api/items/{id}` - Get item by ID
- `POST /api/items` - Create new item
- `PUT /api/items/{id}` - Update item
- `DELETE /api/items/{id}` - Delete item

## Database

ToteMaster uses SQLite for data storage. The database file (`totemaster.db`) is automatically created in the `ToteMasterAPI` directory when the application first runs.

### Schema

**Locations**
- Id (Primary Key)
- Name
- Description
- CreatedAt
- UpdatedAt

**Containers**
- Id (Primary Key)
- Name
- Description
- LocationId (Foreign Key)
- CreatedAt
- UpdatedAt

**Items**
- Id (Primary Key)
- Name
- Description
- Quantity
- ContainerId (Foreign Key)
- CreatedAt
- UpdatedAt

## Usage Guide

### Getting Started

1. **Create Locations**: Start by defining areas in your home where you store items
   - Example: Garage, Basement, Attic, Closet

2. **Add Containers**: Create containers (totes, boxes) and assign them to locations
   - Example: "Blue Tote #1" in "Garage"

3. **Track Items**: Add items to containers with descriptions and quantities
   - Example: "Christmas Decorations" in "Blue Tote #1"

### Screenshots

**Home Page**
![Home Page](https://github.com/user-attachments/assets/bbf44f73-8a75-42ac-967b-6654bbae95f0)

**Locations Management**
![Locations](https://github.com/user-attachments/assets/ddb376ae-c054-4ca6-ae01-5c06aa009050)

**Containers Management**
![Containers](https://github.com/user-attachments/assets/3217f62e-ba12-481b-a30e-25d18e8eece5)

**Items Management**
![Items](https://github.com/user-attachments/assets/827e797e-e96d-4995-998a-9991abb8b1e5)

## Troubleshooting

### Backend Issues

**Database locked error:**
- Close any database browser tools that may have the database open
- Restart the API

**Port already in use:**
- Change the port in `appsettings.json` or use `--urls` parameter
```bash
dotnet run --urls "http://localhost:5001"
```

### Frontend Issues

**API connection errors:**
- Verify the backend is running
- Check the proxy configuration in `vite.config.js`
- Ensure CORS is properly configured

**Build errors:**
- Delete `node_modules` and reinstall: `npm install`
- Clear the build cache: `npm run build -- --force`

## Future Enhancements

- 🔍 Search and filter functionality
- 📸 Photo upload for items
- 🏷️ Tags and categories
- 📊 Statistics and reports
- 📱 Mobile-responsive design improvements
- 🔐 User authentication (multi-user support)
- 💾 Backup and restore functionality
- 📤 Export to CSV/Excel

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the MIT License.

## Support

For issues, questions, or suggestions, please open an issue on GitHub.