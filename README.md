# WhatsApp Invoice Generator SaaS

A comprehensive SaaS application for generating invoices and sending them via WhatsApp. This project consists of a **NestJS** backend and a **React (Vite)** frontend.

## 🚀 Features

*   **Invoice Generation**: Create professional invoices easily.
*   **WhatsApp Integration**: Send invoices directly to customers via WhatsApp (using Twilio).
*   **Payment Gateway**: Integrated Razorpay for handling payments.
*   **Authentication**: Secure login and registration using JWT and Google OAuth.
*   **PDF Generation**: Generate PDF invoices using Puppeteer.
*   **Dashboard**: Real-time dashboard for tracking invoices and payments.

## 🛠️ Tech Stack

### Backend
*   **Framework**: [NestJS](https://nestjs.com/)
*   **Language**: TypeScript
*   **Database ORM**: [Prisma](https://www.prisma.io/)
*   **Authentication**: Passport (JWT, Google OAuth)
*   **Payments**: Razorpay
*   **Utilities**: Puppeteer (PDF), Twilio (Messaging)

### Frontend
*   **Framework**: [React](https://react.dev/)
*   **Build Tool**: [Vite](https://vitejs.dev/)
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
*   **State Management**: React Query
*   **Routing**: React Router DOM
*   **Icons**: Lucide React

## 📋 Prerequisites

Ensure you have the following installed on your local machine:
*   [Node.js](https://nodejs.org/) (v18 or higher recommended)
*   [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
*   PostgreSQL (or your preferred database supported by Prisma)

## ⚙️ Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/drashti181094/whatsapp_invoice_generator.git
cd whatsapp-invoice-saas
```

### 2. Backend Setup

Navigate to the backend directory and install dependencies:

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory and add the following variables:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/mydb?schema=public"

# Authentication
JWT_SECRET="your_jwt_secret_key"
GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"

# Payments (Razorpay)
RAZORPAY_KEY_ID="your_razorpay_key_id"
RAZORPAY_KEY_SECRET="your_razorpay_key_secret"

# Twilio (WhatsApp)
TWILIO_ACCOUNT_SID="your_twilio_account_sid"
TWILIO_AUTH_TOKEN="your_twilio_auth_token"
TWILIO_PHONE_NUMBER="your_twilio_phone_number"
```

Run database migrations:

```bash
npx prisma generate
npx prisma migrate dev
```

Start the backend server:

```bash
npm run start:dev
```
The backend server will typically run on `http://localhost:3000`.

### 3. Frontend Setup

Navigate to the frontend directory and install dependencies:

```bash
cd ../frontend
npm install
```

Create a `.env` file in the `frontend` directory (if needed):

```env
VITE_API_URL="http://localhost:3000"
```

Start the frontend development server:

```bash
npm run dev
```
The frontend will typically run on `http://localhost:5173`.

## 🏃‍♂️ Running the Project

1.  Ensure your database is running.
2.  Start the backend: `cd backend && npm run start:dev`
3.  Start the frontend: `cd frontend && npm run dev`
4.  Open your browser and navigate to the frontend URL (e.g., `http://localhost:5173`).

## 📄 License

This project is licensed under the terms specified in the repository.
