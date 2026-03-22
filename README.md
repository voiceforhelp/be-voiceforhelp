# VoiceForHelp - Backend API

Transparency donation platform REST API built with Node.js, Express and MongoDB.

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (Mongoose ODM)
- **Auth:** JWT (JSON Web Tokens)
- **File Storage:** Cloudinary
- **Automation:** n8n webhook integration

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB Atlas account or local MongoDB
- Cloudinary account

### Installation

```bash
cd backend
npm install
```

### Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default: 5000) |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret key for JWT signing |
| `JWT_EXPIRE` | Token expiry (e.g., 30d) |
| `CLOUDINARY_NAME` | Cloudinary cloud name |
| `CLOUDINARY_KEY` | Cloudinary API key |
| `CLOUDINARY_SECRET` | Cloudinary API secret |
| `PHONEPE_MERCHANT_ID` | PhonePe merchant ID (future) |
| `PHONEPE_SECRET` | PhonePe secret key (future) |
| `CLIENT_URL` | Frontend URL for CORS |
| `N8N_WEBHOOK_URL` | n8n webhook endpoint |

### Development

```bash
npm run dev
```

### Production

```bash
npm start
```

## API Endpoints

### Auth
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register user | Public |
| POST | `/api/auth/login` | Login | Public |
| GET | `/api/auth/me` | Get profile | User |
| PUT | `/api/auth/profile` | Update profile | User |

### Donations
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/donations` | Create donation | Public |
| POST | `/api/donations/fast` | Fast/anonymous donation | Public |
| GET | `/api/donations/recent` | Recent donors | Public |
| GET | `/api/donations/my` | My donations | User |
| GET | `/api/donations` | All donations | Admin |
| GET | `/api/donations/stats` | Donation stats | Admin |
| GET | `/api/donations/group/:date` | Donors by group date | Admin |
| PUT | `/api/donations/:id/status` | Update status | Admin |

### Videos
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/videos` | List videos (7 days) | Public |
| GET | `/api/videos/:id` | Single video | Public |
| GET | `/api/videos/group/:date` | Videos by donor group | Public |
| GET | `/api/videos/user/my` | My impact videos | User |
| POST | `/api/videos` | Upload video | Admin |
| PUT | `/api/videos/:id` | Update video | Admin |
| DELETE | `/api/videos/:id` | Delete video | Admin |

### Categories
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/categories` | Active categories | Public |
| GET | `/api/categories/all` | All categories | Admin |
| POST | `/api/categories` | Create category | Admin |
| PUT | `/api/categories/:id` | Update category | Admin |
| DELETE | `/api/categories/:id` | Delete category | Admin |

### Volunteers
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/volunteers` | Apply as volunteer | Public |
| GET | `/api/volunteers` | List volunteers | Admin |
| PUT | `/api/volunteers/:id/status` | Update status | Admin |

### Analytics (Admin)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analytics/dashboard` | Dashboard stats |
| GET | `/api/analytics/daily` | Daily donations (30 days) |
| GET | `/api/analytics/monthly` | Monthly donations (12 months) |
| GET | `/api/analytics/categories` | Category-wise stats |

### Upload (Admin)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/upload/image` | Upload image to Cloudinary |
| POST | `/api/upload/video` | Upload video to Cloudinary |

## Deployment to Render

1. Push code to GitHub
2. Create a new **Web Service** on Render
3. Connect your GitHub repository
4. Set build command: `npm install`
5. Set start command: `npm start`
6. Add all environment variables from `.env.example`
7. Deploy

## Architecture

```
backend/
├── config/          # Database & Cloudinary configuration
├── controllers/     # Route handlers / business logic
├── middleware/       # Auth, error handling, validation
├── models/          # Mongoose schemas
├── routes/          # Express route definitions
├── services/        # External service integrations (n8n, payments)
├── utils/           # Helpers and utilities
└── server.js        # Entry point
```
