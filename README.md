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

    > **Note:** The first time you run the backend server, it will automatically create a default admin account with the following credentials:
    > - **Email:** `admin@dagboek.com`
    > - **Password:** `password`

## Status

Currently this app is not working the frontend shows and the authentication is setup but i have not implemented all the features yet.
I am currently working on.

    > Board enhancement
    > List enchancement
    > task enhancement
    
## Features (currently implemented)
1. Projects
    Projects allow you to group notebooks, boards, error reports,codesnippets, etc into one project.
2. Site Admin
3. User Admin
4. Dashboard for each project
6. initial boards (create boards and add list and tasks)
   
7. Notebooks
   - A rich-text Markdown editor with a toolbar for creating and editing notes.
   - Image upload and embedding functionality within notes.
   - A tagging system to organize notes by topic.
   - A pinning feature to highlight important notes.
   - A search functionality to easily find notes by title, content, or tags.
     
## Roadmap

- [x] Add a backend to persist data
- [x] Implement user authentication
- [ ] Add more features to the notebook and boards
- [ ] Add a CI/CD pipeline
- [ ] Add a testing suite
- [ ] Add a documentation site
