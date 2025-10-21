# Dagboek

Dagboek is a developer hub and collaboration platform designed to streamline your workflow. It includes a notebook for jotting down ideas, a kanban-style board for managing tasks, progress reports for tracking your project's status, and much more.

## About The Project

This project was created to provide a centralized hub for developers to manage their projects, from brainstorming to deployment. It's designed to be a flexible and extensible platform that can be adapted to fit your needs.

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

*   **Node.js and npm:** Make sure you have Node.js and npm installed. You can download them from [nodejs.org](https://nodejs.org/).
*   **MongoDB:** A running instance of MongoDB is required. You can use a local installation or a cloud service like MongoDB Atlas.

### Frontend Setup

1.  **Navigate to the frontend directory:**
    ```sh
    cd frontend
    ```
2.  **Install dependencies:**
    ```sh
    npm install
    ```
3.  **Start the development server:**
    ```sh
    npm run dev
    ```

### Backend Setup

1.  **Navigate to the backend directory:**
    ```sh
    cd backend
    ```
2.  **Install dependencies:**
    ```sh
    npm install
    ```
3.  **Set up environment variables:**
    Create a `.env` file in the `backend` directory by copying the template file:
    ```sh
    cp env.template .env
    ```
    Update the `.env` file with your database connection string and a secure JWT secret.

4.  **Run the development server:**
    ```sh
    npm run dev
    ```
    The server will be running on `http://localhost:5000`.

## Roadmap

- [x] Add a backend to persist data
- [x] Implement user authentication
- [ ] Add more features to the notebook and boards
- [ ] Add a CI/CD pipeline
- [ ] Add a testing suite
- [ ] Add a documentation site
