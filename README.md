# TO-DO-APPLICATION

## Group Information
- Student 1:Niroshini Sachithananthan - ITBIN-2313-0074 - Role:DevOps engineer
- Student 2: Deva nivethitha Thiyagaraja - [Student ID] - Role:Fullstack developer

## Project Description
This is a mobile friendly todo list applications that helps users manage their daily task

## Live Deployment
🔗 **Live URL:** [Your deployed application URL]

## Technologies Used
- HTML5, CSS3, JavaScript
- [Any frameworks/libraries used]
- GitHub Actions
- [Deployment platform name]

## Features
feature/Reminder_new
feature/task_add
feature/filter

## Branch Strategy
We implemented the following branching strategy:
- `main` - Production branch
- `develop` - Integration branch
- `feature/*` - Feature development branches

## Individual Contributions

### Niroshini Sachithananthan
- Set up GitHub repository and branch strategy
- Configured GitHub Actions for CI/CD pipeline
- Deployed application to Vercel for live hosting
- Implemented automated deployment workflows
- Managed version control and collaboration processes

### Deva nivethitha Thiyagaraja
- Developed the complete frontend application using HTML, CSS, and JavaScript
- Implemented task management functionality (add, edit, delete, complete)
- Created responsive UI design with modern styling
- Added reminder system with browser notifications
- Integrated local storage for data persistence
- Built statistics dashboard and user feedback system

## Setup Instructions

### Prerequisites
- Node.js (version 18 or higher)
- Git
- Web browser

### Installation
```bash
# Clone the repository
git clone https://github.com/Niroshini2002/To-do-Application-devops-Assignment.git

# Navigate to project directory
cd To-do-Application-devops-Assignment

# Open src/index.html in a web browser

# Deployment Process
The CI/CD pipeline is implemented using GitHub Actions. On every push to the main branch, the pipeline automatically builds and deploys the application to Vercel for live hosting.
# Challenges Faced

- Implementing browser notifications for reminders: Required handling user permissions and ensuring compatibility across browsers. Resolved by using the Notification API with proper permission checks.
- Ensuring data persistence with local storage: Needed to handle JSON serialization and deserialization for complex data structures. Resolved by creating utility functions for storage operations.
- Setting up automated deployment: Initial configuration of GitHub Actions for Vercel deployment had authentication issues. Resolved by properly configuring secrets and following Vercel integration guides.
- Responsive design for mobile devices: Achieving consistent UI across different screen sizes. Resolved by using CSS Grid and Flexbox with media queries.

# Build Status

[![Build Status](https://github.com/Niroshini2002/To-do-Application-devops-Assignment/actions/workflows/ci.yml/badge.svg)](https://github.com/Niroshini2002/To-do-Application-devops-Assignment/actions)
[![Deploy to Vercel](https://vercel.com/button/Niroshini2002/to-do-application-devops-assignment)](https://to-do-application-devops-assignment-six.vercel.app/)
[![GitHub stars](https://img.shields.io/github/stars/Niroshini2002/To-do-Application-devops-Assignment)](https://github.com/Niroshini2002/To-do-Application-devops-Assignment/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/Niroshini2002/To-do-Application-devops-Assignment)](https://github.com/Niroshini2002/To-do-Application-devops-Assignment/network/members)
[![GitHub issues](https://img.shields.io/github/issues/Niroshini2002/To-do-Application-devops-Assignment)](https://github.com/Niroshini2002/To-do-Application-devops-Assignment/issues)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
