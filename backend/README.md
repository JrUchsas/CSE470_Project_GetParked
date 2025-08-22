# GetParked Backend

This is the backend for the GetParked application, a smart parking solution. This API is built with Node.js, Express, and Prisma, and it provides a secure and scalable backend for the GetParked frontend.

## Features

*   **User Authentication:** Secure user authentication using JSON Web Tokens (JWT).
*   **API Endpoints:** A comprehensive set of API endpoints for managing users, vehicles, parking slots, reservations, and payments.
*   **Database:** A robust database schema for storing all the application data.
*   **Error Handling:** A centralized error handling mechanism for handling all the API errors.

## Technologies

*   **Node.js:** A JavaScript runtime built on Chrome's V8 JavaScript engine.
*   **Express:** A fast, unopinionated, minimalist web framework for Node.js.
*   **Prisma:** A next-generation ORM for Node.js and TypeScript.
*   **MongoDB:** A cross-platform document-oriented database program.

## Getting Started

These instructions will get you a copy of the backend up and running on your local machine for development and testing purposes.

### Prerequisites

*   Node.js
*   npm
*   Prisma
*   MongoDB

### Installation

1.  Clone the repo
    ```sh
    git clone https://github.com/your_username_/GetParked.git
    ```
2.  Navigate to the backend directory
    ```sh
    cd GetParked/backend
    ```
3.  Install NPM packages
    ```sh
    npm install
    ```
4.  Create a `.env` file and add your `DATABASE_URL` and `JWT_SECRET`.
    ```
    DATABASE_URL="your_mongodb_connection_string"
    JWT_SECRET="your_jwt_secret"
    ```
5.  Set up the database
    ```sh
    npx prisma db push
    ```
6.  Start the server
    ```sh
    npm start
    ```

## API Endpoints

The API endpoints are defined in the `routes` directory. Each file in this directory corresponds to a different resource, and defines the API endpoints for that resource.

*   **`authRoutes.js`**: `POST /api/auth/signup`, `POST /api/auth/login`
*   **`userRoutes.js`**: `GET /api/users`, `GET /api/users/:id`, `PUT /api/users/:id`, `DELETE /api/users/:id`
*   **`vehicleRoutes.js`**: `GET /api/vehicles`, `GET /api/vehicles/:id`, `POST /api/vehicles`, `PUT /api/vehicles/:id`, `DELETE /api/vehicles/:id`
*   **`slotRoutes.js`**: `GET /api/slots`, `GET /api/slots/:id`, `POST /api/slots`, `PUT /api/slots/:id`, `DELETE /api/slots/:id`
*   **`reservationHistoryRoutes.js`**: `GET /api/reservations`, `GET /api/reservations/:id`
*   **`paymentInvoiceRoutes.js`**: `GET /api/invoices`, `GET /api/invoices/:id`