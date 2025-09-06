# System Monitoring Application

A lightweight, cross-platform system monitoring application optimized for Android (Termux), VPS, and Windows environments. Built with React frontend and Node.js backend, designed to work efficiently even on devices with limited resources.

## 🚀 Features

### Core Functionality
- **Real-time System Monitoring**: CPU, memory, and process monitoring with live updates
- **Cross-platform Compatibility**: Works on Android (Termux), Linux VPS, Windows, and macOS
- **Lightweight Architecture**: Minimal resource usage, optimized for mobile devices
- **Responsive Design**: Mobile-first UI that works on all screen sizes
- **WebSocket Integration**: Real-time updates without constant polling
- **Error Handling**: Graceful fallbacks for restricted environments

### System Information
- CPU usage, temperature, and specifications
- Memory usage with detailed breakdown (buffers, cache, swap)
- Process list with filtering and sorting capabilities
- System uptime and load averages
- Network interface information

### Performance Optimizations
- Minimal dependencies (Express, Chart.js, WebSocket)
- Efficient data polling and caching
- Fallback mechanisms for non-root environments
- Mobile-optimized charts and visualizations

## 📱 Platform Support

### ✅ Termux (Android)
- Optimized for non-root environments
- Fallback data sources when system commands fail
- Minimal battery usage
- Touch-friendly interface

### ✅ Linux VPS
- Full system information access
- Process monitoring and management
- Temperature monitoring (where available)
- Service monitoring capabilities

### ✅ Windows
- Windows-specific process listing
- System resource monitoring
- Cross-platform command compatibility

## 🛠️ Installation

### Prerequisites
- Node.js 16.0.0 or higher
- npm or yarn package manager

### Quick Start

1. **Clone or download the project:**
   ```bash
   # If you have git
   git clone <repository-url>
   cd monitoring-app
   
   # Or download and extract the ZIP file
   ```

2. **Install dependencies:**
   ```bash
   # Install all dependencies (frontend + backend)
   npm run install:all
   
   # Or install separately
   npm install              # Frontend dependencies
   npm run server:install   # Backend dependencies
   ```

3. **Start the application:**
   ```bash
   # Start both frontend and backend
   npm run dev
   
   # Or start separately
   npm run server:dev  # Backend (http://localhost:5000)
   npm run client:dev  # Frontend (http://localhost:3000)
   ```

4. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000/api
   - WebSocket: ws://localhost:5000

## 📋 Platform-Specific Instructions

### 🤖 Android (Termux)

1. **Install Termux from F-Droid (recommended) or Google Play**

2. **Setup Termux environment:**
   ```bash
   # Update packages
   pkg update && pkg upgrade
   
   # Install Node.js
   pkg install nodejs
   
   # Install git (optional)
   pkg install git
   ```

3. **Download and run the application:**
   ```bash
   # Navigate to your preferred directory
   cd ~/storage/downloads
   
   # Extract the downloaded zip file
   unzip system-monitoring-app.zip
   cd system-monitoring-app
   
   # Install dependencies
   npm run install:all
   
   # Start the application
   npm run dev
   ```

4. **Access via browser:**
   - Open a web browser on your Android device
   - Go to: http://localhost:3000

**Termux Notes:**
- Some system information may be limited due to Android's security model
- Temperature monitoring might not be available
- Process list may be restricted to user processes
- The app will automatically fall back to basic information when advanced commands fail

### 🖥️ Linux VPS

1. **Install Node.js (Ubuntu/Debian):**
   ```bash
   # Using NodeSource repository (recommended)
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Or using snap
   sudo snap install node --classic
   ```

2. **Install Node.js (CentOS/RHEL):**
   ```bash
   # Using NodeSource repository
   curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
   sudo yum install -y nodejs
   ```

3. **Deploy the application:**
   ```bash
   # Upload files to your VPS
   scp -r system-monitoring-app/ user@your-vps:/home/user/
   
   # SSH into your VPS
   ssh user@your-vps
   
   # Navigate to app directory
   cd system-monitoring-app
   
   # Install dependencies
   npm run install:all
   
   # Start the application
   npm run dev
   ```

4. **Access remotely:**
   - Replace `localhost` with your VPS IP address
   - Example: http://your-vps-ip:3000

**VPS Security Note:**
- Consider using a reverse proxy (nginx/Apache) for production
- Configure firewall rules for ports 3000 and 5000
- Use environment variables for production configuration

### 🪟 Windows

1. **Install Node.js:**
   - Download from: https://nodejs.org/
   - Choose the LTS (Long Term Support) version
   - Run the installer and follow the setup wizard

2. **Open Command Prompt or PowerShell as Administrator:**
   ```cmd
   # Navigate to your desired directory
   cd C:\Users\YourUsername\Documents
   
   # Extract the downloaded zip file
   # (Use Windows Explorer or 7-zip)
   cd system-monitoring-app
   
   # Install dependencies
   npm run install:all
   
   # Start the application
   npm run dev
   ```

3. **Alternative: Using PowerShell:**
   ```powershell
   # Set execution policy (if needed)
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   
   # Navigate to app directory
   cd C:\path\to\system-monitoring-app
   
   # Install and run
   npm run install:all
   npm run dev
   ```

4. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:5000

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the server directory for custom configuration:

```env
# Server Configuration
PORT=5000
HOST=localhost

# Monitoring Settings
POLLING_INTERVAL=5000          # WebSocket update interval (ms)
PROCESS_LIMIT=50              # Maximum processes to fetch
CPU_HISTORY_LENGTH=20         # CPU usage history length
MEMORY_HISTORY_LENGTH=20      # Memory usage history length

# Performance Settings
ENABLE_CPU_TEMPERATURE=true   # Enable CPU temperature monitoring
ENABLE_DETAILED_MEMORY=true   # Enable detailed memory breakdown
ENABLE_PROCESS_TREE=false     # Enable process tree (resource intensive)

# CORS Settings (for remote access)
ALLOWED_ORIGINS=http://localhost:3000,http://192.168.1.100:3000
```

### Customization Options

#### Frontend Configuration (`src/config.js`)
```javascript
export const config = {
  // API endpoints
  apiBaseUrl: 'http://localhost:5000/api',
  wsBaseUrl: 'ws://localhost:5000',
  
  // Update intervals
  chartUpdateInterval: 5000,    // Chart refresh rate
  dataRefreshInterval: 30000,   // Data refresh rate
  
  // Chart settings
  maxDataPoints: 20,            // Maximum chart data points
  animationDuration: 300,       // Chart animation speed
  
  // Mobile optimizations
  enableMobileOptimizations: true,
  reducedAnimations: false,
};
```

## 📊 API Documentation

### REST Endpoints

#### System Information
```
GET /api/health              - Server health check
GET /api/system/overview     - Complete system overview
GET /api/system/cpu          - Detailed CPU information
GET /api/system/memory       - Memory usage information
GET /api/system/uptime       - System uptime and load average
```

#### Process Management
```
GET /api/processes                    - List of running processes
GET /api/processes/:pid               - Specific process details
GET /api/processes/tree/view          - Process tree (limited)
```

#### Query Parameters
```
GET /api/processes?limit=20&sort=cpu  - Limit results and sort by CPU
GET /api/processes?limit=50&sort=memory - Sort by memory usage
```

### WebSocket Events

#### Client to Server
```javascript
// Subscribe to real-time updates
{ type: 'subscribe' }

// Unsubscribe from updates
{ type: 'unsubscribe' }

// Request immediate update
{ type: 'requestUpdate' }
```

#### Server to Client
```javascript
// System update event
{
  type: 'systemUpdate',
  timestamp: '2025-01-11T10:30:00.000Z',
  cpu: { usage: 45, cores: 4, temperature: 65 },
  memory: { total: 8192, used: 3072, percentage: 37.5 },
  processes: [...]
}

// Connection established
{
  type: 'connected',
  timestamp: 1641902400000
}
```

## 🔍 Troubleshooting

### Common Issues

#### "Cannot connect to monitoring server"
**Cause:** Backend server is not running or accessible.
**Solution:**
```bash
# Check if backend is running
curl http://localhost:5000/api/health

# Start backend server
cd server && npm run dev

# Check for port conflicts
netstat -an | grep 5000  # Linux/macOS
netstat -an | findstr 5000  # Windows
```

#### Limited system information in Termux
**Cause:** Android security restrictions prevent access to some system information.
**Expected Behavior:** The app will show basic information and display warnings for unavailable data.

#### High CPU usage
**Cause:** Too frequent updates or large process lists.
**Solution:**
```javascript
// Reduce update frequency in config
POLLING_INTERVAL=10000  // 10 seconds instead of 5
PROCESS_LIMIT=20        // Reduce process list size
```

#### WebSocket connection failed
**Cause:** Network restrictions or firewall blocking WebSocket connections.
**Solution:**
1. Check firewall settings
2. Verify port 5000 is accessible
3. The app will fall back to HTTP polling if WebSocket fails

### Performance Optimization

#### For Low-End Devices
1. **Reduce update frequency:**
   ```env
   POLLING_INTERVAL=10000
   CPU_HISTORY_LENGTH=10
   MEMORY_HISTORY_LENGTH=10
   ```

2. **Disable resource-intensive features:**
   ```env
   ENABLE_CPU_TEMPERATURE=false
   ENABLE_DETAILED_MEMORY=false
   ENABLE_PROCESS_TREE=false
   ```

3. **Limit process monitoring:**
   ```env
   PROCESS_LIMIT=20
   ```

#### For Better Performance
1. **Enable hardware acceleration in browser**
2. **Close unnecessary browser tabs**
3. **Use a modern browser (Chrome, Firefox, Edge)**

### Termux-Specific Issues

#### Permission denied errors
```bash
# Some commands might require termux-api
pkg install termux-api

# Grant necessary permissions in Android settings
# Settings > Apps > Termux > Permissions
```

#### Storage access issues
```bash
# Setup storage access
termux-setup-storage

# Move app to internal storage for better performance
cp -r /sdcard/Download/system-monitoring-app ~/
```

## 🚀 Development

### Project Structure
```
monitoring-app/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── hooks/         # Custom hooks
│   │   ├── utils/         # Utility functions
│   │   └── App.tsx        # Main app component
│   └── package.json
├── server/                 # Node.js backend
│   ├── src/
│   │   ├── routes/        # API routes
│   │   ├── utils/         # Server utilities
│   │   └── index.js       # Server entry point
│   └── package.json
├── package.json           # Root package.json
└── README.md
```

### Development Commands
```bash
# Install all dependencies
npm run install:all

# Development mode (starts both frontend and backend)
npm run dev

# Start only backend
npm run server:dev

# Start only frontend  
npm run client:dev

# Build for production
npm run build

# Lint code
npm run lint
```

### Adding New Features

#### 1. Adding a New API Endpoint
```javascript
// server/src/routes/system.js
router.get('/new-endpoint', async (req, res) => {
  try {
    const data = await getNewSystemData();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

#### 2. Adding a New Component
```jsx
// src/components/NewComponent.tsx
import React from 'react';

const NewComponent: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
      {/* Component content */}
    </div>
  );
};

export default NewComponent;
```

#### 3. Adding Real-time Data
```javascript
// Add to server/src/utils/monitor.js
const newData = await getNewData();
updateData.newField = newData;

// Handle in frontend WebSocket hook
if (messageData.type === 'systemUpdate' && messageData.newField) {
  // Process new data
}
```

## 📈 Performance Benchmarks

### Resource Usage (Typical)
- **RAM Usage:** 50-100MB (Node.js backend + React frontend)
- **CPU Usage:** <5% on modern devices, <15% on older devices
- **Network:** ~1KB/s for real-time updates
- **Storage:** ~15MB total application size

### Supported Concurrent Users
- **Single Device:** Optimized for 1-5 concurrent browser tabs
- **Network Access:** Can handle 10-20 concurrent connections on modern hardware

### Update Frequencies
- **Real-time Updates:** 5-second intervals (configurable)
- **Chart Refresh:** 5-second intervals
- **Process List:** 10-second intervals
- **System Overview:** 30-second intervals

## 🔐 Security Considerations

### Network Security
- **Local Access Only:** By default, only accessible from localhost
- **No Authentication:** Designed for local monitoring only
- **CORS Protection:** Configurable allowed origins

### System Access
- **Limited Privileges:** Works with user-level permissions
- **No System Modification:** Read-only system monitoring
- **Sandboxed:** Cannot modify system settings or processes

### Production Deployment
For production use, consider:
1. **Add Authentication:** Implement user authentication
2. **Use HTTPS:** Set up SSL/TLS certificates
3. **Reverse Proxy:** Use nginx or Apache as reverse proxy
4. **Firewall Rules:** Restrict access to specific IP addresses
5. **Rate Limiting:** Implement API rate limiting

## 📚 Dependencies

### Frontend Dependencies
- **React 18.3.1:** UI framework
- **Chart.js 4.4.0:** Data visualization
- **Lucide React 0.344.0:** Icons
- **Tailwind CSS 3.4.1:** Styling framework

### Backend Dependencies
- **Express 4.18.2:** Web server framework
- **ws 8.14.2:** WebSocket implementation
- **cors 2.8.5:** Cross-origin resource sharing

### Development Dependencies
- **Vite 5.4.2:** Build tool and dev server
- **TypeScript 5.5.3:** Type checking
- **ESLint 9.9.1:** Code linting

## 🤝 Contributing

We welcome contributions! Here's how you can help:

### Reporting Issues
1. Check existing issues first
2. Provide detailed system information
3. Include error messages and logs
4. Describe steps to reproduce

### Feature Requests
1. Describe the use case
2. Explain the expected behavior
3. Consider performance implications
4. Check if it fits the lightweight design philosophy

### Code Contributions
1. Fork the repository
2. Create a feature branch
3. Follow the existing code style
4. Test on multiple platforms
5. Update documentation
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License. See the LICENSE file for details.

## 🙏 Acknowledgments

- **Termux Community** for Android development support
- **Node.js Team** for the runtime environment
- **React Team** for the frontend framework
- **Chart.js** for data visualization capabilities
- **Tailwind CSS** for the styling framework

## 📞 Support

For support and questions:

1. **Check this README** for common solutions
2. **Review the troubleshooting section**
3. **Check browser console** for error messages
4. **Test on different platforms** to isolate issues

Remember: This application is designed to be lightweight and work in resource-constrained environments. Some features may be limited on certain platforms due to security restrictions, which is expected behavior.