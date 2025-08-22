# GetParked Frontend

This is the frontend for the GetParked application, a smart parking solution. This application is built with React and uses a modern, responsive design.

## Features

*   **User Authentication:** Users can sign up, log in, and log out.
*   **Dashboard:** An overview of the user's current parking status and reservation history.
*   **Slot Booking:** A user-friendly interface for finding and booking parking slots.
*   **Vehicle Management:** Users can add, edit, and delete their vehicles.
*   **Payment System:** A secure payment gateway for paying for parking reservations.
*   **Admin Panel:** A separate interface for administrators to manage users, slots, and payments.

## Technologies

*   **React:** A JavaScript library for building user interfaces.
*   **React Router:** A library for handling routing in a React application.
*   **Axios:** A promise-based HTTP client for the browser and Node.js.
*   **Tailwind CSS:** A utility-first CSS framework for rapidly building custom designs.

## Getting Started

These instructions will get you a copy of the frontend up and running on your local machine for development and testing purposes.

### Prerequisites

*   Node.js
*   npm

### Installation

1.  Clone the repo
    ```sh
    git clone https://github.com/your_username_/GetParked.git
    ```
2.  Navigate to the frontend directory
    ```sh
    cd GetParked/frontend
    ```
3.  Install NPM packages
    ```sh
    npm install
    ```
4.  Start the development server
    ```sh
    npm start
    ```

## Usage

The application will be available at `http://localhost:3000`. The frontend will connect to the backend API, which should be running on `http://localhost:5000`.

## Project Structure

*   **`src/`**: This directory contains all the source code for the application.
*   **`src/assets/`**: This directory contains all the static assets, such as images and logos.
*   **`src/components/`**: This directory contains all the reusable components.
*   **`src/pages/`**: This directory contains all the pages of the application.
*   **`src/services/`**: This directory contains all the services that interact with the backend API.
*   **`src/styles/`**: This directory contains all the custom CSS styles.