# Tote Master

**Home Inventory Management System**

Tote Master is a web-based inventory management system designed to help you keep track of items stored in totes, boxes, and containers. Never lose track of your belongings again!

## Features

- **Item Management**: Add, edit, and delete items with descriptions, categories, and tags
- **Tote Organization**: Create and manage storage totes/containers
- **Quick Search**: Find items instantly by name, category, or tags
- **Location Tracking**: Know exactly which tote contains each item
- **RESTful API**: Clean API architecture for easy integration
- **Modern UI**: React-based frontend with responsive design

## Technology Stack

### MVP Phase
- **Frontend**: React 18 + Vite
- **Backend**: Node.js + Express
- **Data Storage**: JSON file-based (will migrate to database later)

### Future Roadmap
- Migration to Python/Java microservices
- PostgreSQL or MongoDB database
- Mobile app (React Native)
- Photo uploads for items
- Barcode/QR code scanning

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
- **Git**

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/justinwells85/Tote Master.git
cd Tote Master
```

### 2. Set Up Backend

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory (copy from `.env.example`):

```bash
cp .env.example .env
```

Edit `.env` if needed:
```
PORT=3000
NODE_ENV=development
```

### 3. Set Up Frontend

```bash
cd ../frontend
npm install
```

## Running the Application

You'll need two terminal windows to run both the backend and frontend.

### Terminal 1: Start Backend Server

```bash
cd backend
npm run dev
```

The API will be available at `http://localhost:3000`

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

# Run tests (when implemented)
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

# Run tests (when implemented)
npm test
```

## Testing

Testing frameworks will be added in future iterations:
- **Backend**: Jest + Supertest
- **Frontend**: Jest + React Testing Library
- **E2E**: Playwright or Cypress

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

### Phase 1 (MVP - Current)
- [x] Project setup
- [x] Basic backend API
- [x] Basic frontend structure
- [ ] Item CRUD operations UI
- [ ] Tote CRUD operations UI
- [ ] Search functionality UI
- [ ] Basic styling

### Phase 2
- [ ] Database integration (PostgreSQL/MongoDB)
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
