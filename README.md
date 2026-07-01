# 📝 ZenTodo — Premium To-Do Web Application

ZenTodo is a premium, interactive, and single-page To-Do application built with a modern glassmorphism design. It lets users organize tasks into distinct lists, schedule date/time due dates, track priority levels, filter/sort items, and edit them inline using modal overlays. All data is persisted automatically in the browser using `localStorage`.

This project is built for **SCT_WD_4** (Task 04).

---

## ✨ Features

- 📁 **List Collections**: 
  - Create and manage custom folders/lists (e.g. *Work*, *Personal*, *Shopping*, *Fitness*).
  - Clean counting badges indicating the active uncompleted task count for each list.
  - Delete entire lists along with their associated tasks.

- ⚙️ **Task Scheduling & Management**:
  - Add tasks with precise **Due Dates & Times**.
  - Automatically flags **Overdue** tasks with red warning badges.
  - Interactive custom check circles with strike-through animations.
  - A collapsible **Completed** task archive at the bottom of the list for a clean view.

- 🏷️ **Priority Configurations**:
  - Color-coded borders and badges for **Low** (green), **Medium** (orange), and **High** (red) priority tasks.

- 🔍 **Interactive Filters & Sorting**:
  - Dynamically filter views by status: **All**, **Active**, and **Completed**.
  - Sort tasks instantly by **Due Date (Soonest / Latest)**, **Priority (High to Low)**, and **Alphabetical order**.
  - Real-time **search input** to filter tasks matching search queries.

- ✏️ **Edit Modal Overlay**:
  - A sleek card pop-up enabling quick updates to titles, due dates, priority weight, and moving the task to another list.

- 📱 **Fully Responsive Layout**:
  - Desktop: Sidebar & workspace split view.
  - Mobile: Collapsed stacked view with touch-friendly elements.

---

## 🛠️ Technology Stack

- **Markup**: HTML5 (Semantic elements)
- **Styling**: Vanilla CSS3 (Custom design tokens, glassmorphism, responsive grid & flexbox layouts, hover states)
- **Logic**: Vanilla JavaScript (ES6+, DOM Manipulation, LocalStorage engine)

---

## 📂 Project Structure

```
todo-app/
├── index.html   # HTML markup & layout
├── styles.css   # Custom CSS styling & themes
├── app.js       # Client state model & controllers
└── README.md    # Documentation
```

---

## 🚀 How to Run Locally

Since this is a client-side vanilla web app, there are no dependencies to install.

### Option 1: Open Directly
Double-click [index.html](index.html) in your file explorer to open it immediately in any modern web browser.

### Option 2: Live Local Server (Recommended)
If you have Python installed, you can launch a local HTTP server:
```bash
python -m http.server 8000
```
Then visit: `http://localhost:8000` in your web browser.
