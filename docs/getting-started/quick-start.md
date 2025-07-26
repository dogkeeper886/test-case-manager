# Quick Start Guide

## 🚀 **Get Started in 5 Minutes**

This guide will get you up and running with the Test Case Management System in just 5 minutes.

## 📋 **Prerequisites**

- **Docker** and **Docker Compose** installed on your system
- **Git** for cloning the repository
- **Web browser** (Chrome, Firefox, Safari, or Edge)

## ⚡ **Step-by-Step Setup**

### **Step 1: Clone the Repository**
```bash
git clone <repository-url>
cd test-case-manager
```

### **Step 2: Start the Application**
```bash
cd docker
docker compose up -d
```

### **Step 3: Access the System**
- Open your browser and go to: **http://localhost:3000**
- The system will load with the Dashboard view

## 🎯 **First Steps**

### **1. Explore the Dashboard**
- View system statistics (183 test cases, 7 projects, 37 test suites)
- Click on metric cards to navigate to different sections
- Use the sidebar navigation to explore features

### **2. Browse Test Cases**
- Click "Test Cases" in the sidebar
- View the list of 183 test cases with Apple-style cards
- Use the search bar to find specific test cases
- Try the filters (Project, Suite, Status, Priority)

### **3. Explore Test Suites**
- Click "Test Suites" in the sidebar
- See the hierarchical tree structure
- Click the chevron icons to expand/collapse suites
- Click on suite names to select them

### **4. View Projects**
- Click "Projects" in the sidebar
- See project statistics and organization
- View test case counts per project

## 🔍 **Key Features to Try**

### **Search and Filtering**
- Use the global search bar in the top navigation
- Try filtering by project, test suite, status, or priority
- Search across test case titles and descriptions

### **Responsive Design**
- Resize your browser window to see responsive behavior
- On mobile, the sidebar becomes an overlay with hamburger menu
- Test touch interactions on tablet/mobile devices

### **Test Case Details**
- Click on any test case card to view details
- See test steps, metadata, and execution history
- Use the action buttons (View, Edit, Delete)

## 🎨 **UI Features**

### **Apple-Style Design**
- Clean, modern interface with Apple-inspired colors
- Smooth animations and micro-interactions
- Professional typography and spacing
- Hover effects on interactive elements

### **Navigation**
- Collapsible sidebar with hierarchical navigation
- Breadcrumb navigation in the top bar
- Quick access to common actions
- Mobile-friendly hamburger menu

## 📊 **Sample Data**

The system comes with sample data to help you explore:

- **183 Test Cases** with various statuses and priorities
- **7 Projects** with different scopes and sizes
- **37 Test Suites** organized in a hierarchical structure
- **Test Steps** with detailed instructions
- **Custom Fields** for additional metadata

## 🔧 **Common Actions**

### **View Test Cases**
- Navigate to Test Cases page
- Use search and filters to find specific cases
- Click on cards to view details

### **Browse Test Suites**
- Navigate to Test Suites page
- Expand/collapse the tree structure
- Select suites to see their test cases

### **Check System Status**
- View the Dashboard for system statistics
- Check API health at http://localhost:3001/api/health
- Monitor container status with `docker compose ps`

## 🚨 **Troubleshooting**

### **If the system won't start:**
```bash
# Stop and restart
docker compose down
docker compose up -d

# Check logs
docker compose logs -f
```

### **If you can't access the application:**
- Verify containers are running: `docker compose ps`
- Check if ports 3000 and 3001 are available
- Try accessing http://localhost:3000 in your browser

### **If you see errors:**
- Check the troubleshooting guide for detailed solutions
- View container logs for specific error messages
- Restart the system if needed

## 🎉 **Next Steps**

### **Explore Advanced Features**
- Try the TestLink import functionality
- Generate test reports
- Manage documents and requirements
- Configure system settings

### **Learn More**
- Read the [System Overview](../user-guide/overview.md) for detailed feature information
- Check the [Installation Guide](installation.md) for advanced setup options
- Review the [API Reference](../development/api-reference.md) for developers

### **Get Help**
- Check the [Troubleshooting Guide](troubleshooting.md) for common issues
- Review the [User Guide](../user-guide/) for detailed feature documentation
- Contact support if you need additional help

---

**🎉 Congratulations! You're now ready to use the Test Case Management System. The system is production-ready with real data and full functionality.** 