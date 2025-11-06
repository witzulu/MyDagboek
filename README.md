# Dagboek

Dagboek is a developer hub and collaboration platform designed to streamline your workflow. It includes a notebook for jotting down ideas, a kanban-style board for managing tasks, progress reports for tracking your project's status, and much more.

## About The Project

This project was created to provide a centralized hub for developers to manage their projects, from brainstorming to deployment. It's designed to be a flexible and extensible platform that can be adapted to fit your needs.

## Getting Started

### Using Docker (Recommended)

This is the easiest and recommended way to get the application running locally. It ensures a consistent environment for all services.

#### Prerequisites

*   **Docker:** Make sure you have Docker and Docker Compose installed. You can download them from the [Docker website](https://www.docker.com/products/docker-desktop).

#### Running the Application

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/witzulu/MyDagboek.git
    cd MyDagboek
    ```

2.  **Build and start the containers:**
    Run the following command from the root of the project:
    ```sh
    docker-compose up --build
    ```
    This command will:
    - Build the Docker images for the frontend and backend services.
    - Start the frontend, backend, and a MongoDB database container.
    - The first time you run this, it may take a few minutes to download the base images and install dependencies.

3.  **Access the application:**
    - The frontend will be available at `http://localhost:5173`.
    - The backend API will be available at `http://localhost:5000`.

#### Stopping the Application

To stop all the running containers, press `Ctrl+C` in the terminal where `docker-compose` is running, and then run:
```sh
docker-compose down
```
This will stop and remove the containers, but your database data will be preserved in a Docker volume.

### Manual Setup

To get a local copy up and running, follow these simple steps.

#### Prerequisites

*   **Node.js and npm:** Make sure you have Node.js and npm installed. You can download them from [nodejs.org](https://nodejs.org/).
*   **MongoDB:** A running instance of MongoDB is required. You can use a local installation or a cloud service like MongoDB Atlas.

#### Frontend Setup

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
## Admin

    The server will be running on `http://localhost:5000`.

    > **Note:** The first time you run the backend server, it will automatically create a default admin account with the following credentials:
    > - **Email:** `admin@dagboek.com`
    > - **Password:** `password`

### Resetting a User's Password
    A command-line tool is provided to reset any user's password. This is useful for regaining access if an admin password is lost.

1.  **Navigate to the backend directory:**
    ```sh
    cd backend
    ```
2.  **Run the reset script:**
    ```sh
    npm run reset-password <user-email> <new-password>
    ```
    - Replace `<user-email>` with the email of the user you want to update.
    - Replace `<new-password>` with the desired new password.

    **Example:**
    ```sh
    npm run reset-password admin@dagboek.com aSecureNewPassword
    ```


## Status

    Currently not implemented all the features yet.

    
    
    
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
   - Scratch pad. a interactive multipage area where you can draw and plan straight on the page like you would in a pen and paper notebook.
8. Code Snippets
   - Dashboard for snippets
   - can create a snippet in various languages
        - Javascript
        - HTML
        - Python
        - C++
        - C#
        - CSS
9. Progress Reports
   - **Per-Project Reports:** Generate detailed progress reports for a specific project within a given date range. These reports provide a snapshot of project velocity and include:
     - Key metrics: Tasks Created, Completed, Overdue, and In Progress.
     - Visualizations: A pie chart for task status, a bar chart for daily completions, and a burndown chart to track remaining work.
     - Changelog Integration: Includes both manual and automatic changelog entries for a qualitative view of progress.
     - Multiple Export Formats: Export reports to PDF, Markdown, or CSV for sharing and archiving.
   - **High-Level Dashboard:** A dedicated dashboard at `/reports-dashboard` that provides a quick, high-level overview of progress across all of your projects at once. It includes:
     - A 14-day trend chart for task completions.
     - A summary of the total number of overdue tasks.
     - A list of recent major achievements from across your projects.
10. Diagrams.
    - Make diagrams like flowcharts
11. Team Member
    - invite team maembers and manage members for a project
          
     
## Roadmap

- [x] Add a backend to persist data
- [x] Implement user authentication
- [x] Add more features to the notebook and boards
- [ ] Add a CI/CD pipeline
- [ ] Add a testing suite
- [ ] Add a documentation site
