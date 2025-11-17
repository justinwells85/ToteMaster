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
