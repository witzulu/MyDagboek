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

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use('/uploads', express.static('uploads'));

// Database connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dagboek', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ MongoDB connected');
    require('./src/models/User');
require('./src/models/Project');
require('./src/models/Board');
require('./src/models/List');
require('./src/models/Task');
require('./src/models/Diagram');
require('./src/models/ChangeLog');
require('./src/models/Folder');
require('./src/models/TimeEntry');

    await seedAdminUser();
    await migrateProjects();
    await migrateUsers();
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  }
};

const seedAdminUser = async () => {
    const User = require('./src/models/User');
    const bcrypt = require('bcryptjs');

    try {
        let adminUser = await User.findOne({ email: 'admin@dagboek.com' });

        if (adminUser) {
            // If admin exists but has the wrong role, update it
            if (adminUser.role !== 'system_admin') {
                adminUser.role = 'system_admin';
                await adminUser.save();
                console.log('✅ Admin user role updated to system_admin.');
            }
        } else {
            // If no admin user exists, create one
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('password', salt);

            adminUser = new User({
                name: 'Admin User',
                email: 'admin@dagboek.com',
                username: 'admin',
                password: hashedPassword,
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
        const projectsToMigrate = await Project.find({ 'members.role': { $ne: 'owner' } });

        if (projectsToMigrate.length > 0) {
            console.log(`Found ${projectsToMigrate.length} projects to migrate...`);
            for (const project of projectsToMigrate) {
                const ownerExists = project.members.some(m => m.role === 'owner');
                if (!ownerExists && project.user) {
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
        // First, handle role migration for any legacy 'admin' users
        const legacyAdmins = await User.find({ role: 'admin' });
        if (legacyAdmins.length > 0) {
            console.log(`Found ${legacyAdmins.length} legacy admin users to migrate...`);
            for (const admin of legacyAdmins) {
                admin.role = 'system_admin';
                await admin.save({ validateBeforeSave: false }); // Bypass other validators
                 console.log(`User ${admin.email} role migrated to system_admin.`);
            }
            console.log('✅ Admin role migration complete.');
        }

        // Second, handle username migration
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

connectDB();

// Mount routers
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


// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// 404 handler
app.use((req, res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  res.status(404);
  next(error);
});

// Error handler
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    error: err.message,
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
