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

    > Refactor Themes(currently only light stable)
    
    
    
## Features (currently implemented)
1. Projects
    Projects allow you to group notebooks, boards, error reports,codesnippets, etc into one project.
2. Site Admin
3. User Admin
4. Dashboard for each project
6. Boards
    - Cards
    - Lists
    - Drag and drop Card and list
    - Labels on Card
    - Checklist on Card
    - Duedate on Card

    When a new board is created, it comes with four default lists: "To-Do", "In Progress", "Done", and "Optional". The "Optional" list is a special list for tasks that are not part of the main workflow. Tasks in this list are excluded from the "in-progress" count in progress reports.
   
7. Notebooks
   - A rich-text Markdown editor with a toolbar for creating and editing notes.
   - Image upload and embedding functionality within notes.
   - A tagging system to organize notes by topic.
   - A pinning feature to highlight important notes.
   - A search functionality to easily find notes by title, content, or tags.
8. Code Snippets
   - Dashboard for snippets
   - can create a snippet in various languages
        - Javascript
        - HTML
        - Python
        - C++
        - C#
        - CSS
9. Team Member
    - invite team maembers and manage members for a project
          
     
## Roadmap

- [x] Add a backend to persist data
- [x] Implement user authentication
- [x] Add more features to the notebook and boards
- [ ] Add a CI/CD pipeline
- [ ] Add a testing suite
- [ ] Add a documentation site
