<p align="center">
  <img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" />
</p>

# Ikaze App

**Ikaze** is a tourism platform that helps travelers discover places to visit and hotels to stay in Rwanda.  
It provides a seamless experience for both tourists (via a mobile app) and administrators (via an admin dashboard).

---

## Features

- 🏨 **Find Hotels & Places:** Browse and search for hotels and tourist attractions.
- 📱 **Mobile App Support:** Tourists can use the mobile app to explore, book, and review places.
- 🛡️ **Admin Dashboard:** Admins can manage listings, bookings, users, and view analytics.
- 💳 **Booking & Payment:** Secure booking and payment integration.
- 📝 **Reviews & Ratings:** Users can leave reviews and ratings for places and hotels.
- 🔔 **Real-time Notifications:** Instant notifications for admins and users via WebSocket.
- 📦 **Cloudinary Integration:** Upload and manage images for places and hotels.
- ✉️ **Email Notifications:** Automated emails for bookings and system alerts.

---

## Tech Stack

- **Backend:** [NestJS](https://nestjs.com/) (Node.js, TypeScript)
- **Database:** MongoDB (Mongoose)
- **Authentication:** JWT
- **File Uploads:** Cloudinary
- **Payments:** Stripe
- **Real-time:** Socket.IO (WebSocket)
- **Email:** Nodemailer (SMTP)
- **Frontend:** (Not included here) Mobile app (Flutter/React Native) & Admin dashboard (React/Vue)

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/your-org/ikaze-app-bn.git
cd ikaze-app-bn
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy `.env.example` to `.env` and fill in your credentials:

```env
MONGODB_URL=your_mongodb_url
PORT=5550
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
STRIPE_SECRET_KEY=your_stripe_secret
MAIL_HOST=smtp.example.com
MAIL_USER=your_email@example.com
MAIL_PASS=your_email_password
...
```

### 4. Run the project

```bash
# development
npm run start

# watch mode
npm run start:dev

# production
npm run start:prod
```

---

## API Documentation

- Swagger docs available at: `http://localhost:5550/api` (when running)

---

## Project Structure

- `src/modules/places` — Place & hotel management
- `src/modules/booking` — Booking logic
- `src/modules/payment` — Payment integration
- `src/modules/review` — Reviews & ratings
- `src/modules/users` — User management
- `src/modules/webSocket` — Real-time notifications
- `src/schemas` — Mongoose schemas

---

## Mobile & Admin Dashboard

- **Mobile App:** Connects to this backend via REST and WebSocket for real-time updates.
- **Admin Dashboard:** Manage listings, bookings, users, and view analytics.

---

## Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

---

## License

MIT

---

**Ikaze App — Making Rwandan tourism easy, modern, and accessible.**
