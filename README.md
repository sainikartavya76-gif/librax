# 📚 LIBRAX — Library Operations System

**A full-stack library management project with a C-based Data Structures and Algorithms (DSA) engine.**

[🌐 Live Demo](https://sainikartavya76-gif.github.io/librax/) · [💻 GitHub Repository](https://github.com/sainikartavya76-gif/librax)

## 📖 Project Overview

LIBRAX is a library operations platform designed to simplify book catalogue management, member records, borrowing and returns, reservations, fines, and operational reporting. Alongside the web application, it includes a dedicated C-language DSA engine and an interactive algorithm visualization lab, connecting classroom DSA concepts with a practical application.

## ✨ Key Features

- **Book catalogue:** Search, filter, view, add, and edit books.
- **Member management:** Maintain member accounts and roles.
- **Issue and return workflows:** Record book borrowing and returns.
- **Reservations:** Manage book holds and queues.
- **Fine management:** Track overdue fines and settlements.
- **Dashboards and analytics:** View circulation statistics and activity.
- **DSA lab:** Explore algorithm visualizations step by step.
- **Role-based interfaces:** Separate experiences for administrators, librarians, and students.

> **Deployment note:** The live GitHub Pages demo and locally run full-stack application have different execution environments. The local setup uses the Node.js/Express API and persistent SQLite database; do not assume that GitHub Pages hosts the Node.js backend.

## 🛠️ Technology Stack

| Layer | Technologies |
| --- | --- |
| Frontend | React 18, TypeScript, Vite, Tailwind CSS |
| Backend | Node.js, Express |
| Database | SQLite |
| DSA Engine | C (C99), GCC |
| Visualization | Interactive DSA lab and web UI |
| Hosting | GitHub Pages (web demo) |

## 🧠 Data Structures and Algorithms

The C DSA engine includes:

- **Data structures:** Arrays, singly and doubly linked lists, stacks, queues, circular queues, binary search trees, hash tables, heaps, and graph representations.
- **Sorting:** Bubble, selection, insertion, merge, quick, and heap sort.
- **Searching:** Linear and binary search.
- **Graph traversal:** Breadth-first search (BFS) and depth-first search (DFS).

These concepts are relevant to catalogue searching, reservations, data organization, and the project's DSA learning features.

## 🏗️ Project Structure

```text
librax/
├── frontend/           # React/TypeScript web application
├── node-backend/       # Node.js/Express backend
├── backend/            # Additional backend components
├── dsa-engine/         # C data structures, algorithms and tests
├── standalone/         # Standalone web build
├── API.md              # API documentation
├── ARCHITECTURE.md     # System design
├── DATABASE.md         # Database documentation
├── DSA.md              # DSA documentation
├── TESTING.md          # Testing documentation
└── README.md           # Project overview
```

## 🚀 How to Run

### Option 1: Open the live demo

Visit: **https://sainikartavya76-gif.github.io/librax/**

### Option 2: Run the full-stack application locally

**Prerequisites:** Git and Node.js/npm. A C compiler is needed to build or test the C engine.

```bash
git clone https://github.com/sainikartavya76-gif/librax.git
cd librax
npm run setup
npm start
```

Open **http://localhost:8000** in your browser.

On Windows, the repository also includes `start.bat`.

### Option 3: Run frontend and backend separately

Backend terminal:

```bash
cd node-backend
npm install
npm run seed
npm start
```

Frontend terminal (from the repository root, in a separate terminal):

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173**.

## 🧪 Testing

The repository documents a C DSA test suite with **154 passing tests**. To run it on a Windows system with MinGW Make:

```bash
cd dsa-engine
mingw32-make test
./test_all.exe
```

The reported test result comes from the repository documentation; verify locally before presenting it as a fresh test run.

## 👥 Team Members and Responsibilities

The following is a **proposed division of responsibilities** for the five-member team. Please confirm it reflects each person's actual contribution before submission.

| Team Member | Proposed Role | Responsibility |
| --- | --- | --- |
| **Kartavya** | Team Leader & Backend Developer | Team coordination, backend services, API workflows, and integration. |
| **Aaradhya Agarwal** | Frontend Developer | React components, responsive interface implementation, and frontend functionality. |
| **Veer** | UI/UX Designer | Interface layouts, user flows, and usability planning. |
| **Kushan** | DSA Implementation | Data structure and algorithm modules in C. |
| **Aarush** | Database Management & Testing | Database design, records, and functional testing. |

## 📚 Additional Documentation

- [System Architecture](ARCHITECTURE.md)
- [DSA Engine](DSA.md)
- [Database](DATABASE.md)
- [API Reference](API.md)
- [Testing](TESTING.md)

## 🎯 Learning Outcomes

This project demonstrates how data structures and algorithms can be combined with a modern web interface, backend APIs, and database operations to solve real-world library management problems.

---

**LIBRAX — A DSA-based Library Management Project**