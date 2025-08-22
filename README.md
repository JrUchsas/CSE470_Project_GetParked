# GetParked

A smart parking solution that allows users to find and reserve parking spots in advance.

## Features

*   **Slot Booking:** View available slots based on location and time, and book a slot for a specific time duration.
*   **Real-Time Slot Management:** Admin panel to add, edit, and remove parking slots, and view the status of each slot (occupied/free) with color-coded indicators.
*   **Vehicle Registration:** Register a new vehicle to a user account, and update or delete vehicle information.
*   **Entry/Exit Logging:** Log the check-in and check-out times of vehicles, and automatically calculate the duration of stay.
*   **Payment System:** Automatically calculate the parking fee based on the duration of stay, and provide an online payment gateway (with a mock/pay-later option).
*   **Reservation History:** View past reservations with details, and download invoices or receipts.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

*   Node.js
*   npm
*   Prisma

### Installation

1.  Clone the repo
    ```sh
    git clone https://github.com/your_username_/GetParked.git
    ```
2.  Install NPM packages for the backend
    ```sh
    cd backend
    npm install
    ```
3.  Install NPM packages for the frontend
    ```sh
    cd ../frontend
    npm install
    ```
4.  Set up the database
    ```sh
    cd ../backend
    npx prisma db push
    ```
5.  Start the backend server
    ```sh
    npm start
    ```
6.  Start the frontend development server
    ```sh
    cd ../frontend
    npm start
    ```

## Usage

*   The application will be available at `http://localhost:3000`.
*   The backend server will be running at `http://localhost:5000`.

## API Reference

The API is documented in the backend's `routes` directory. Each file in this directory corresponds to a different resource, and defines the API endpoints for that resource.

## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request
