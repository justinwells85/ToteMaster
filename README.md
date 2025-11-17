# Tote Master

**Home Inventory Management System**

[![CI](https://github.com/justinwells85/ToteMaster/actions/workflows/ci.yml/badge.svg)](https://github.com/justinwells85/ToteMaster/actions/workflows/ci.yml)
[![Docker Build](https://github.com/justinwells85/ToteMaster/actions/workflows/docker.yml/badge.svg)](https://github.com/justinwells85/ToteMaster/actions/workflows/docker.yml)

Tote Master is a web-based inventory management system designed to help you keep track of items stored in totes, boxes, and containers. Never lose track of your belongings again!

## Features

- **Item Management**: Add, edit, and delete items with descriptions, categories, and tags
- **Tote Organization**: Create and manage storage totes/containers
- **Quick Search**: Find items instantly by name, category, or tags
- **Location Tracking**: Know exactly which tote contains each item
- **RESTful API**: Clean API architecture for easy integration
- **Modern UI**: React-based frontend with responsive design

## Technology Stack

### Current Implementation
- **Frontend**: React 18 + Vite
- **Backend**: Node.js + Express
- **Database**: PostgreSQL 16
- **Containerization**: Docker + Docker Compose
- **Testing**: Jest (backend), Vitest (frontend)
- **CI/CD**: GitHub Actions

### Future Roadmap
- Migration to Python/Java microservices
- Mobile app (React Native)
- Photo uploads for items
- Barcode/QR code scanning
- User authentication

## Project Structure

```
Tote Master/
├── frontend/              # React application
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API client
│   │   └── ...
│   └── package.json
├── backend/               # Express API
│   ├── src/
│   │   ├── routes/        # API routes
│   │   ├── controllers/   # Request handlers
│   │   ├── services/      # Business logic
│   │   ├── models/        # Data models
│   │   └── utils/         # Utilities
│   └── package.json
├── CLAUDE.md             # AI assistant guide
└── README.md             # This file
```

## Prerequisites

- **Node.js** 18+ and npm
- **PostgreSQL** 14+ (or use Docker)
- **Git**

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/justinwells85/Tote Master.git
cd Tote Master
```

### 2. Set Up PostgreSQL Database

**Option A: Using Docker (Recommended)**

The easiest way is to use the provided Docker Compose setup which includes PostgreSQL:

```bash
# Start PostgreSQL container
docker compose up postgres -d

# Check if database is ready
docker compose logs postgres
```

**Option B: Local PostgreSQL Installation**

If you have PostgreSQL installed locally:

1. Create a database and user:
```sql
CREATE DATABASE totemaster;
CREATE USER totemaster WITH ENCRYPTED PASSWORD 'totemaster';
GRANT ALL PRIVILEGES ON DATABASE totemaster TO totemaster;
```

2. Note your connection details for the `.env` file.

### 3. Set Up Backend

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory (copy from `.env.example`):

```bash
cp .env.example .env
```

Edit `.env` with your database configuration:
```env
PORT=3000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=totemaster
DB_USER=totemaster
DB_PASSWORD=totemaster
```

**Run Database Migrations:**

```bash
# Run migrations to create database tables
npm run migrate

# Check migration status
npm run migrate:status
```

**Optional: Import Existing Data**

If you have existing data in `data.json`:

```bash
# Import JSON data to PostgreSQL
npm run migrate:data
```

This will import your totes and items into the database. The original `data.json` will be backed up automatically.

### 4. Set Up Frontend

```bash
cd ../frontend
npm install
```

## Running the Application

**Important:** Make sure PostgreSQL is running before starting the backend server.

If using Docker for PostgreSQL:
```bash
docker compose up postgres -d
```

You'll need two terminal windows to run both the backend and frontend.

### Terminal 1: Start Backend Server

```bash
cd backend
npm run dev
```

The backend will:
1. Connect to PostgreSQL
2. Run any pending migrations automatically
3. Start the API server at `http://localhost:3000`

### Terminal 2: Start Frontend Development Server

```bash
cd frontend
npm run dev
```

The React app will be available at `http://localhost:5173`

## Docker Deployment

Tote Master includes Docker support for easy deployment to any environment.

### Prerequisites for Docker

- **Docker** 20.10+
- **Docker Compose** 2.0+

### Quick Start with Docker

#### Development Mode

Run both frontend and backend with hot-reload enabled:

```bash
# Start all services
docker-compose up

# Or run in detached mode
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

Services will be available at:
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3000`

#### Production Mode

```bash
# Build and start production services
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Stop services
docker-compose -f docker-compose.prod.yml down
```

Services will be available at:
- Frontend: `http://localhost` (port 80)
- Backend: `http://localhost:3000`

### Environment Configuration

#### For Development
Docker Compose uses inline environment variables. No additional configuration needed.

#### For Production

1. **Backend**: Create `backend/.env.production`
   ```bash
   cp backend/.env.production.example backend/.env.production
   ```

   Edit the file with your production settings:
   ```env
   NODE_ENV=production
   PORT=3000
   LOG_LEVEL=INFO
   # Add your production variables here
   ```

2. **Frontend**: Create `.env` in the project root
   ```bash
   cp .env.example .env
   ```

   Configure the API URL:
   ```env
   VITE_API_URL=http://localhost:3000/api
   # Or use your production API URL
   ```

### Individual Service Deployment

You can deploy frontend and backend independently:

#### Backend Only
```bash
# Development
docker build -t totemaster-backend --target development ./backend
docker run -p 3000:3000 -v $(pwd)/backend:/app totemaster-backend

# Production
docker build -t totemaster-backend --target production ./backend
docker run -p 3000:3000 --env-file ./backend/.env.production totemaster-backend
```

#### Frontend Only
```bash
# Development
docker build -t totemaster-frontend --target development ./frontend
docker run -p 5173:5173 -v $(pwd)/frontend:/app totemaster-frontend

# Production
docker build -t totemaster-frontend --target production --build-arg VITE_API_URL=http://your-api-url/api ./frontend
docker run -p 80:80 totemaster-frontend
```

### Health Checks

Production containers include health checks:

```bash
# Check service health
docker-compose -f docker-compose.prod.yml ps

# Inspect health status
docker inspect totemaster-backend | grep -A 10 Health
docker inspect totemaster-frontend | grep -A 10 Health
```

### Cloud Deployment

The Docker setup is ready for deployment to:
- **AWS**: ECS, EKS, or EC2
- **Azure**: Container Instances, AKS, or App Service
- **GCP**: Cloud Run, GKE, or Compute Engine
- **DigitalOcean**: App Platform or Droplets
- Any other Docker-compatible platform

### Docker Commands Reference

```bash
# Rebuild containers after code changes
docker-compose build

# Rebuild without cache
docker-compose build --no-cache

# View running containers
docker-compose ps

# Execute commands in running container
docker-compose exec backend sh
docker-compose exec frontend sh

# Remove all containers and volumes
docker-compose down -v

# View resource usage
docker stats
```

## API Endpoints

### Items

- `GET /api/items` - Get all items
- `GET /api/items/:id` - Get item by ID
- `POST /api/items` - Create new item
- `PUT /api/items/:id` - Update item
- `DELETE /api/items/:id` - Delete item
- `GET /api/items/tote/:toteId` - Get items in a specific tote
- `GET /api/items/search/:query` - Search items

### Totes

- `GET /api/totes` - Get all totes
- `GET /api/totes/:id` - Get tote by ID
- `POST /api/totes` - Create new tote
- `PUT /api/totes/:id` - Update tote
- `DELETE /api/totes/:id` - Delete tote

## Data Models

### Item
```json
{
  "id": "unique-id",
  "name": "Item name",
  "description": "Item description",
  "category": "Category name",
  "toteId": "tote-id",
  "quantity": 1,
  "condition": "good",
  "tags": ["tag1", "tag2"],
  "createdAt": "ISO-8601 timestamp",
  "updatedAt": "ISO-8601 timestamp"
}
```

### Tote
```json
{
  "id": "unique-id",
  "name": "Tote name",
  "location": "Storage location",
  "description": "Description",
  "color": "blue",
  "createdAt": "ISO-8601 timestamp",
  "updatedAt": "ISO-8601 timestamp"
}
```

## Development

### Backend Development

```bash
# Run with auto-reload
npm run dev

# Run production mode
npm start

# Run tests
npm test
```

### Frontend Development

```bash
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm test
```

## CI/CD

Tote Master uses GitHub Actions for continuous integration and deployment automation.

### Automated Workflows

**CI Workflow** (`.github/workflows/ci.yml`)
- Runs on every push to `main` and all pull requests
- Tests backend and frontend on Node.js 18.x and 20.x
- Generates code coverage reports
- Runs ESLint for code quality
- Validates production builds
- Uploads build artifacts

**Docker Build Workflow** (`.github/workflows/docker.yml`)
- Validates Docker images build successfully
- Tests both development and production targets
- Validates docker-compose configurations
- Uses build caching for faster builds

### Workflow Status

Check the status badges at the top of this README or visit:
- [CI Workflow Runs](https://github.com/justinwells85/ToteMaster/actions/workflows/ci.yml)
- [Docker Build Runs](https://github.com/justinwells85/ToteMaster/actions/workflows/docker.yml)

### Pull Request Checks

All pull requests must pass:
- ✅ Backend tests (Node 18.x and 20.x)
- ✅ Frontend tests (Node 18.x and 20.x)
- ✅ Frontend build
- ✅ Docker image builds
- ✅ Linting (informational)

### Local Pre-Push Validation

Before pushing code, you can run the same checks locally:

```bash
# Run all backend tests
cd backend && npm test

# Run all frontend tests
cd frontend && npm test

# Lint frontend code
cd frontend && npm run lint

# Build frontend
cd frontend && npm run build

# Test Docker builds
docker compose -f docker-compose.yml config
docker compose build
```

## Testing

Tote Master includes comprehensive testing frameworks for both frontend and backend with PostgreSQL test database support.

### Backend Testing

The backend uses **Jest** with **Supertest** for API testing and includes a test database infrastructure.

```bash
cd backend

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

**Test Infrastructure:**
- **Test Database Helper** (`tests/helpers/testDb.js`) - Utilities for setting up/tearing down test database
- **Automatic Schema Setup** - Runs migrations automatically for test database
- **Test Data Fixtures** - Helper functions to create test totes and items
- **Clean Slate Testing** - Each test runs with a fresh database state

**Test Coverage:**
- ✅ **Model Validation** (`tests/models.test.js`) - Comprehensive validation logic tests
- ✅ **Repository Layer** (`tests/repositories/`) - Database operations and queries
  - `ItemRepository.test.js` - Full CRUD, search, pagination, and filtering tests
  - `ToteRepository.test.js` - Tote operations, item counting, and relationships
- ✅ **Service Layer** (`tests/services/`) - Business logic with mocked repositories
  - `itemsService.test.js` - Item business logic, validation, and tote reference checks
  - `totesService.test.js` - Tote business logic, cascade protection, and validation
- ✅ **API Integration** (`tests/items.test.js`, `tests/totes.test.js`) - End-to-end API tests with real database

**Test Organization:**
```
backend/tests/
├── helpers/
│   └── testDb.js              # Test database utilities
├── repositories/
│   ├── ItemRepository.test.js # Repository layer tests
│   └── ToteRepository.test.js
├── services/
│   ├── itemsService.test.js   # Service layer tests (mocked)
│   └── totesService.test.js
├── models.test.js             # Model validation tests
├── items.test.js              # Items API integration tests
└── totes.test.js              # Totes API integration tests
```

**Key Testing Features:**
- **Test Database Isolation** - Tests run against a real PostgreSQL database with automatic cleanup
- **Mocked Unit Tests** - Service layer tests use mocked repositories for fast execution
- **Integration Tests** - API tests validate full request/response cycle with database
- **Referential Integrity** - Tests validate foreign key constraints and cascade behavior
- **Edge Cases** - Comprehensive coverage of validation errors, not found scenarios, and business rules

### Frontend Testing

The frontend uses **Vitest** with **React Testing Library** for component and API testing.

```bash
cd frontend

# Run all tests
npm test

# Run tests in watch mode (interactive)
npm run test

# Run tests with UI
npm run test:ui

# Run tests with coverage report
npm run test:coverage
```

**Test Coverage:**
- ✅ **Component Tests** (`src/components/*.test.jsx`) - UI component behavior
  - `Modal.test.jsx` - Modal visibility, open/close, and callbacks
  - `Pagination.test.jsx` - Page navigation, boundaries, and display
  - `SearchBar.test.jsx` - Search input and debouncing
- ✅ **API Service Tests** (`src/services/api.test.js`) - Mocked fetch calls
  - Items API - CRUD operations, search, and error handling
  - Containers API - Tote management operations
  - Locations API - Location management

**Test Organization:**
```
frontend/src/
├── components/
│   ├── Modal.test.jsx
│   ├── Pagination.test.jsx
│   └── SearchBar.test.jsx
├── services/
│   └── api.test.js           # API client tests with mocked fetch
└── test/
    └── setup.js              # Vitest configuration and global setup
```

**Testing Best Practices:**
- Write tests alongside new features
- Aim for 70%+ test coverage on critical paths
- Use React Testing Library's user-centric queries
- Mock API calls with vitest mocking utilities
- Test user interactions and accessibility

### Running Tests in CI/CD

Tests are automatically run in GitHub Actions on every push and pull request:
- Backend tests run on Node.js 18.x and 20.x
- Frontend tests run on Node.js 18.x and 20.x
- Coverage reports generated for code quality monitoring

### Future Testing Enhancements

- [ ] E2E testing with Playwright or Cypress
- [ ] Frontend page component tests
- [ ] Visual regression testing
- [ ] Performance testing
- [ ] Load testing for API endpoints

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes using conventional commits (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Commit Message Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting)
- `refactor:` - Code refactoring
- `test:` - Adding tests
- `chore:` - Maintenance tasks

## Roadmap

### Phase 1 (MVP - Complete)
- [x] Project setup
- [x] Basic backend API
- [x] Basic frontend structure
- [x] Item CRUD operations UI
- [x] Tote CRUD operations UI
- [x] Search functionality UI
- [x] Basic styling
- [x] PostgreSQL database integration
- [x] Database migrations system
- [x] Comprehensive testing framework
- [x] CI/CD with GitHub Actions
- [x] Docker containerization

### Phase 2 (In Progress)
- [ ] User authentication
- [ ] Photo uploads for items
- [ ] Advanced search and filtering
- [ ] Data export (CSV/PDF)

### Phase 3
- [ ] Mobile app (React Native)
- [ ] Barcode/QR code scanning
- [ ] Multi-user support
- [ ] Cloud deployment
- [ ] Microservices architecture

## License

MIT

## Support

For issues, questions, or contributions, please open an issue on GitHub.

---

**Made with ❤️ for better home organization**
