# 🎯 Codeforces Student Progress Tracker



https://github.com/user-attachments/assets/59bba31c-80d5-4408-a50f-65d2fcc9ca0a


deployment: https://cf-progress-tracker.netlify.app/


A comprehensive web application for tracking and managing student progress on Codeforces competitive programming platform. Built with modern technologies to help instructors monitor their students' coding journey and maintain engagement through automated reminders.

![Node.js](https://img.shields.io/badge/node.js-18+-green.svg)
![React](https://img.shields.io/badge/react-19+-blue.svg)
![TypeScript](https://img.shields.io/badge/typescript-5.8+-blue.svg)
![MongoDB](https://img.shields.io/badge/mongodb-8+-green.svg)

## ✨ Features

### 📊 Student Management
- **CRUD Operations**: Add, view, edit, and delete student records
- **Codeforces Integration**: Automatic sync with Codeforces API for real-time data
- **Rating Tracking**: Monitor current and maximum ratings
- **Activity Status**: Track student engagement based on submission frequency

### 📈 Analytics & Insights
- **Contest History**: View recent contest participation and performance
- **Problem Statistics**: Analyze solved problems by difficulty and rating distribution
- **Submission Heatmap**: Visual representation of coding activity over time
- **Progress Monitoring**: Track improvement trends and identify inactive periods

### 🔄 Automated Synchronization
- **Scheduled Updates**: Configurable cron jobs for automatic data synchronization
- **Manual Sync**: On-demand data refresh with real-time progress feedback
- **Rate Limiting**: Smart API calls to respect Codeforces rate limits
- **Error Handling**: Robust error recovery and logging

### 📧 Email Notifications
- **Inactivity Alerts**: Automated reminders for inactive students
- **SMTP Configuration**: Flexible email setup with various providers
- **Customizable Thresholds**: Configurable inactivity periods
- **Email Templates**: Professional, encouraging reminder emails

### ⚙️ System Configuration
- **Settings Management**: Centralized configuration for all system parameters
- **Database Monitoring**: Real-time connection status and statistics
- **Flexible Scheduling**: Multiple sync frequency options (daily, twice-daily, weekly)
- **Security**: Password masking and secure credential storage

## 🛠️ Tech Stack

### Frontend (`/client`)
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite 6
- **Styling**: Tailwind CSS 4 with shadcn UI components
- **Icons**: Lucide React
- **Charts**: Recharts for data visualization
- **Themes**: next-themes for dark/light mode

### Backend (`/server`)
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js 5
- **Database**: MongoDB with Mongoose ODM
- **Scheduling**: node-cron for automated tasks
- **Email**: Nodemailer for SMTP integration

## 🚀 Quick Start

### Prerequisites
- Node.js 18 or higher
- MongoDB 6 or higher
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/vewake/cf-progress-tracker
   cd cf-progress-tracker 
   ```

2. **Backend Setup**
   ```bash
   cd server
   npm install
   
   # Create environment file
   cp .env.example .env
   # Edit .env with your MongoDB URI and other settings
   
   # Start the backend server
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd ../client
   npm install
   
   # Update API endpoints if needed
   # Start the development server
   npm run dev
   ```

4. **Access the application**
   - Frontend: `http://localhost:5173` (Vite default)
   - Backend API: `http://localhost:3000`
   - Health Check: `http://localhost:3009/api/health`

### Environment Variables

Create a `.env` file in the `/server` directory:

```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/student-progress
NODE_ENV=development
```

## 📖 Usage Guide

### Adding Students
1. Navigate to the main dashboard
2. Click "Add Student" button
3. Fill in student details including Codeforces handle
4. System automatically fetches initial Codeforces data

### Configuring Sync Schedule
1. Open Settings dialog (gear icon)
2. Set preferred sync time and frequency
3. Configure SMTP settings for email notifications
4. Test sync functionality with "Test Sync Now" button

### Monitoring Progress
- View student list with real-time activity status
- Click on individual students for detailed analytics
- Monitor system health via database statistics
- Review sync logs for troubleshooting

## 🔧 Configuration

### Sync Frequencies
- **Daily**: Once per day at specified time
- **Twice Daily**: Every 12 hours
- **Weekly**: Once per week (Sundays)
- **Manual**: Sync only when triggered manually


## 📊 API Documentation

### Student Endpoints
```
GET    /api/student/all        # Get all students
POST   /api/student/add        # Create new student
PUT    /api/student/edit       # Update student
DELETE /api/student/delete/:id # Delete student
```

### Settings Endpoints
```
GET /api/settings/sync         # Synchronize settings
GET  /api/settings            # Get system settings
PUT  /api/settings            # Update settings
```


### System Endpoints
```
GET /health                    # System health check
```

## 🏗️ Project Structure

```
cf-progress-tracker/
├── client/                   # React frontend
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── constants/        # API endpoints and constants
│   │   ├── lib/             # Utility functions
│   │   └── App.tsx         # App entry point
│   ├── package.json
│   └── vite.config.ts
├── server/                   # Express backend
│   ├── src/
│   │   ├── controllers/      # Request handlers
│   │   ├── models/          # Database schemas
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   └── index.ts         # Server entry point
│   ├── package.json
│   └── tsconfig.json
└── README.md
```

## 🚧 Development

### Frontend Development
```bash
cd client
npm run dev     # Start development server
npm run build   # Build for production
npm run preview # Preview production build
npm run lint    # Run ESLint
```

### Backend Development
```bash
cd server
npm run dev     # Start development server with ts-node
npm run build   # Compile TypeScript to JavaScript
npm run start   # Run compiled JavaScript
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Use ESLint configuration for code style
- Write descriptive commit messages
- Add comments for complex logic
- Test your changes thoroughly
- Update documentation as needed

## 👨‍💻 Author

**vewake**
- GitHub: [@vewake](https://github.com/vewake)
- Project Link: [https://github.com/vewake/cf-progress-tracker](https://github.com/vewake/cf-progress-tracker)

## 🙏 Acknowledgments

- [Codeforces](https://codeforces.com) for providing the comprehensive API
- [Radix UI](https://radix-ui.com) for accessible UI primitives
- [Tailwind CSS](https://tailwindcss.com) for utility-first styling
- [Vite](https://vitejs.dev) for lightning-fast development experience
- Open source community for inspiration and tools

---

⭐ **Star this repository if you find it helpful!**

*Built with ❤️ for the competitive programming community*

## 🔧 Quick Commands

```bash
# Install all dependencies
npm install --prefix client && npm install --prefix server

# Run both frontend and backend concurrently
# Terminal 1:
cd server && npm run dev

# Terminal 2:
cd client && npm run dev

# Build for production
cd client && npm run build
cd server && npm run build
```
