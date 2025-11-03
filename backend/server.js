const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// Load env vars
dotenv.config();

// Route files
const authRoutes = require('./src/routes/auth');
const userRoutes = require('./src/routes/users');
const notificationRoutes = require('./src/routes/notifications');
const projectRoutes = require('./src/routes/projects');
const { projectBoardsRouter, boardRouter } = require('./src/routes/boards');
const listRoutes = require('./src/routes/lists');
const taskRoutes = require('./src/routes/taskRoutes');
const taskAttachmentRoutes = require('./src/routes/taskAttachmentRoutes');
const taskChecklistRoutes = require('./src/routes/taskChecklistRoutes');
const taskCommentRoutes = require('./src/routes/taskCommentRoutes');
const settingsRoutes = require('./src/routes/settings');
const { projectNotesRouter, noteRouter } = require('./src/routes/notes');
const { projectLabelsRouter, labelRouter } = require('./src/routes/labels');
const progressReportRoutes = require('./src/routes/progressReportRoutes');
const reportRoutes = require('./src/routes/reportRoutes');
const { projectDiagrams, diagrams } = require('./src/routes/diagramRoutes');
const { projectChangeLogRouter, changeLogRouter } = require('./src/routes/changeLogRoutes');
const { projectFoldersRouter, folderRouter } = require('./src/routes/folders');
const { projectTimeEntriesRouter, timeEntryRouter } = require('./src/routes/timeEntryRoutes');
const projectTaskRoutes = require('./src/routes/projectTaskRoutes');
const snippetRoutes = require('./src/routes/snippets');
const errorReportRoutes = require('./src/routes/errorReportRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Helper Functions (Seeders & Migrations)
const seedAdminUser = async () => {
    const User = require('./src/models/User');
    try {
        let adminUser = await User.findOne({ email: 'admin@dagboek.com' });

        if (adminUser) {
            // Admin user exists, ensure role and status are correct.
            // DO NOT reset the password.
            let needsSave = false;
            if (adminUser.role !== 'system_admin') {
                adminUser.role = 'system_admin';
                needsSave = true;
            }
            if (adminUser.status !== 'approved') {
                adminUser.status = 'approved';
                needsSave = true;
            }

            if (needsSave) {
                await adminUser.save();
                console.log('✅ Admin user account state has been updated.');
            } else {
                console.log('✅ Admin user account verified.');
            }
        } else {
            // Admin user does not exist, create it with a default password.
            // The 'pre' save hook in the User model will hash the password.
            adminUser = new User({
                name: 'Admin',
                email: 'admin@dagboek.com',
                username: 'admin',
                password: 'admin', // The model hook will hash this.
                role: 'system_admin',
                status: 'approved'
            });
            await adminUser.save();
            console.log('✅ Default admin user created.');
        }
    } catch (error) {
        console.error('❌ Error seeding admin user:', error);
    }
};

const migrateProjects = async () => {
    const Project = require('./src/models/Project');
    try {
        const projectsToMigrate = await Project.find({ 'members.0': { $exists: false }, user: { $exists: true } });
        if (projectsToMigrate.length > 0) {
            console.log(`Found ${projectsToMigrate.length} projects to migrate...`);
            for (const project of projectsToMigrate) {
                const ownerExists = project.members.some(m => m.role === 'owner');
                if (!ownerExists) {
                    project.members.push({ user: project.user, role: 'owner' });
                    await project.save();
                    console.log(`Project ${project.name} migrated.`);
                }
            }
            console.log('✅ Project migration complete.');
        }
    } catch (error) {
        console.error('❌ Error migrating projects:', error);
    }
};

const migrateUsers = async () => {
    const User = require('./src/models/User');
    try {
        const usersToMigrate = await User.find({ username: { $exists: false } });
        if (usersToMigrate.length > 0) {
            console.log(`Found ${usersToMigrate.length} users to migrate for username...`);
            for (const user of usersToMigrate) {
                const username = user.email.split('@')[0];
                let potentialUsername = username;
                let counter = 1;
                while (await User.findOne({ username: potentialUsername })) {
                    potentialUsername = `${username}${counter}`;
                    counter++;
                }
                user.username = potentialUsername;
                await user.save();
                console.log(`User ${user.email} migrated with username ${user.username}.`);
            }
            console.log('✅ User username migration complete.');
        }
    } catch (error) {
        console.error('❌ Error migrating users:', error);
    }
};

const migrateTimeEntries = async () => {
    const TimeEntry = require('./src/models/TimeEntry');
    try {
        const entriesToMigrate = await TimeEntry.find({ date: { $type: "string" } });
        if (entriesToMigrate.length > 0) {
            console.log(`Found ${entriesToMigrate.length} time entries to migrate...`);
            for (const entry of entriesToMigrate) {
                entry.date = new Date(entry.date);
                await entry.save();
            }
            console.log('✅ Time entry date migration complete.');
        }
    } catch (error) {
        console.error('❌ Error migrating time entries:', error);
    }
};

const migrateTasks = async () => {
    const Task = require('./src/models/Task');
    const List = require('./src/models/List');
    try {
        const tasksToMigrate = await Task.find({ board: { $exists: false } }).populate('list');
        if (tasksToMigrate.length > 0) {
            console.log(`Found ${tasksToMigrate.length} tasks to migrate for board field...`);
            for (const task of tasksToMigrate) {
                if (task.list && task.list.board) {
                    task.board = task.list.board;
                    await task.save();
                    console.log(`Task "${task.title}" migrated with board ID ${task.board}.`);
                } else {
                    console.log(`Could not migrate task "${task.title}" - list or board not found.`);
                }
            }
            console.log('✅ Task board field migration complete.');
        }
    } catch (error) {
        console.error('❌ Error migrating tasks:', error);
    }
};


const startServer = async () => {
  try {
    // 1. Connect to Database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dagboek');
    console.log('✅ MongoDB connected');

    // 2. Register all Mongoose models
    require('./src/models/User');
    require('./src/models/Project');
    require('./src/models/Board');
    require('./src/models/List');
    require('./src/models/Task');
    require('./src/models/Diagram');
    require('./src/models/ChangeLog');
    require('./src/models/Folder');
    require('./src/models/TimeEntry');
    require('./src/models/Note');
    require('./src/models/Label');
    require('./src/models/SiteSettings');
    require('./src/models/Notification');
    require('./src/models/CodeSnippet');
    require('./src/models/ErrorReport');

    // 3. Run seeders and migrations
    await seedAdminUser();
    await migrateProjects();
    await migrateUsers();
    await migrateTimeEntries();
    await migrateTasks();

    // 4. Configure Express Middleware
    app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
    app.use(cors());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    if (process.env.NODE_ENV === 'development') {
      app.use(require('morgan')('dev'));
    }
    app.use('/uploads', express.static('uploads'));

    // 5. Mount all API routers
    app.use('/api/auth', authRoutes);
    app.use('/api/users', userRoutes);
    app.use('/api/notifications', notificationRoutes);
    app.use('/api/projects', projectRoutes);
    app.use('/api/projects/:projectId/boards', projectBoardsRouter);
    app.use('/api/boards', boardRouter);
    app.use('/api/lists', listRoutes);
    app.use('/api/tasks', taskRoutes);
    app.use('/api/tasks/:taskId/attachments', taskAttachmentRoutes);
    app.use('/api/tasks/:taskId/checklist', taskChecklistRoutes);
    app.use('/api/tasks/:taskId/comments', taskCommentRoutes);
    app.use('/api/settings', settingsRoutes);
    app.use('/api/projects/:projectId/notes', projectNotesRouter);
    app.use('/api/notes', noteRouter);
    app.use('/api/projects/:projectId/labels', projectLabelsRouter);
    app.use('/api/labels', labelRouter);
    app.use('/api/projects/:projectId/progress-report', progressReportRoutes);
    app.use('/api/reports', reportRoutes);
    app.use('/api/projects/:projectId/diagrams', projectDiagrams);
    app.use('/api/diagrams', diagrams);
    app.use('/api/projects/:projectId/changelog', projectChangeLogRouter);
    app.use('/api/changelog', changeLogRouter);
    app.use('/api/projects/:projectId/folders', projectFoldersRouter);
    app.use('/api/folders', folderRouter);
    app.use('/api/projects/:projectId/time-entries', projectTimeEntriesRouter);
    app.use('/api/time-entries', timeEntryRouter);
    app.use('/api/projects/:projectId/tasks', projectTaskRoutes);
    app.use('/api/projects/:projectId/snippets', snippetRoutes);
    app.use('/api/projects/:projectId/errors', errorReportRoutes);

    // Health check endpoint
    app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

    // 6. Configure Error Handlers
    app.use((req, res, next) => {
      const error = new Error(`Route not found: ${req.originalUrl}`);
      res.status(404);
      next(error);
    });
    app.use((err, req, res, next) => {
      const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
      res.status(statusCode);
      res.json({
        error: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
      });
    });

    // 7. Start the server
    app.listen(PORT, () => {
      console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    });

  } catch (err) {
    console.error('❌ Server startup failed:', err);
    process.exit(1);
  }
};

startServer();
