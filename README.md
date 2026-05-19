# 🔥 MeltAssist

## Intelligent Foundry Melt Chemistry Optimization & Alloy Calculation System

---

## 🎥 Demo Video

https://github.com/user-attachments/assets/a464be40-200f-4d6d-9e76-1e9f95e444cd

---

## 📌 Overview

MeltAssist is a full-stack industrial assistance platform designed for foundry operations.
The system helps operators calculate required alloy additions based on current melt chemistry, target chemistry, and total melt weight.

It simplifies manual calculations, reduces human error, and provides a structured workflow for melt chemistry correction and optimization.

---

# 📌 Problem Statement

In foundry industries, achieving the desired melt chemistry requires accurate alloy calculations and process control.

Traditional manual calculations are:

* Time-consuming
* Error-prone
* Difficult for large melt weights
* Hard to track consistently

Operators must continuously:

* Compare current and target chemistry
* Calculate chemistry differences
* Determine required alloy additions
* Maintain process safety limits
* Execute corrections step-by-step

Incorrect calculations can lead to:

* Material wastage
* Rework and repeated corrections
* Inconsistent melt quality
* Increased production costs
* Production delays

---

# 💡 Our Solution

MeltAssist is an intelligent melt chemistry assistance system that automates alloy addition calculations and melt correction workflows.

The platform:

* Accepts current and target chemistry values
* Calculates chemistry deltas automatically
* Determines required alloy additions using industrial calculation formulas
* Converts alloy requirements based on total melt weight
* Provides step-by-step workflow guidance
* Validates melt weight and chemistry ranges
* Reduces manual effort and calculation mistakes

The system combines industrial process logic with a modern web-based interface to improve operational efficiency in foundry environments.

---

# ✨ Features

* 🎯 Automated Alloy Addition Calculations
* 📊 Chemistry Delta Analysis
* ⚙️ Melt Weight-Based Calculations
* 🧮 Formula-Based Recommendation Engine
* 📋 Multi-Step Foundry Workflow
* 🔄 Re-Sampling & Verification Steps
* 🛡️ Safety Validation Checks
* 📈 Large Correction Handling
* ⚡ RESTful Backend API
* 🎨 Modern Responsive User Interface

---

# 🏗️ Tech Stack

## Backend

* **Framework**: Django 5.2+
* **API**: Django REST Framework
* **Libraries**: NumPy, pandas
* **Database**: SQLite (development)
* **CORS**: django-cors-headers

## Frontend

* **Framework**: React 18 with TypeScript
* **Build Tool**: Vite
* **Styling**: Tailwind CSS
* **UI Components**: shadcn/ui (Radix UI)
* **State Management**: TanStack Query (React Query)
* **Icons**: Lucide React
* **Date Handling**: date-fns

---

# 📋 Prerequisites

Before you begin, ensure you have the following installed:

* **Python**: 3.10 or higher
* **Node.js**: 18.x or higher
* **pip**: Python package installer
* **npm/bun**: Node package manager

---

# 🚀 Installation

## 1. Clone the Repository

```bash
git clone <repository-url>
cd MeltAssist
```

---

# ⚙️ Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv
```

## Activate Virtual Environment

### Windows

```bash
venv\Scripts\activate
```

### Linux/macOS

```bash
source venv/bin/activate
```

## Install Dependencies

```bash
pip install -r requirements.txt
```

## Run Migrations

```bash
python manage.py migrate
```

## Create Superuser (Optional)

```bash
python manage.py createsuperuser
```

## Start Backend Server

```bash
python manage.py runserver
```

Backend will run at:

```bash
http://localhost:8000
```

---

# 🎨 Frontend Setup

```bash
# Navigate to frontend directory
cd frontend
```

## Install Dependencies

```bash
npm install
```

OR

```bash
bun install
```

## Start Frontend

```bash
npm run dev
```

OR

```bash
bun run dev
```

Frontend will run at:

```bash
http://localhost:5173
```

---

# 🎮 Usage

## Starting the Application

### Start Backend

```bash
cd backend
python manage.py runserver
```

### Start Frontend

```bash
cd frontend
npm run dev
```

Open your browser and navigate to:

```bash
http://localhost:5173
```

---

# 🔄 Workflow Steps

## 1. Melt Input

Enter:

* Initial melt chemistry
* Target chemistry
* Melt weight (kg)

## 2. Chemistry Analysis

System calculates:

* Chemistry differences (delta)
* Required corrections

## 3. Alloy Recommendation

The recommendation engine calculates:

* Required alloy additions
* kg/ton conversion
* Total alloy quantity

## 4. Re-Sampling

Operators can:

* Verify updated chemistry
* Perform additional correction steps if required

## 5. Completion

Finalize melt process and review output.

---

# 📡 API Endpoint

## Melt Optimization

### POST

```http
/api/optimize/
```

---

## Request Body

```json
{
  "initial_chemistry": {
    "C": 0.15,
    "Si": 0.25,
    "Mn": 0.80
  },
  "target_chemistry": {
    "C": 0.18,
    "Si": 0.30,
    "Mn": 1.00
  },
  "melt_weight_kg": 20000
}
```

---

## Response

```json
{
  "status": "success",
  "message": "Optimization complete",
  "data": {
    "alloy_additions_kg": {
      "FeSi75": 45.2,
      "FeMn": 32.8
    },
    "steps": [],
    "requires_multiple_steps": false
  }
}
```

---

# 📁 Project Structure

```bash
MeltAssist/
├── backend/
│   ├── config/
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   │
│   ├── meltopt/
│   │   ├── models.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   └── calculations/
│   │
│   ├── manage.py
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── types/
│   │   └── pages/
│   │
│   ├── package.json
│   └── vite.config.ts
│
└── README.md
```

---

# 🧮 Calculation & Recommendation Engine

The system uses industrial calculation formulas and chemistry difference analysis to determine alloy additions.

## Process Includes

* Chemistry delta calculation
* Alloy percentage adjustment
* Melt weight conversion
* kg/ton calculations
* Safety threshold validation

---

# 🛡️ Safety Features

* Minimum melt weight validation
* Maximum melt weight validation
* Large correction detection
* Multi-step recommendation support
* Input validation checks

---

# 🔧 Development

## Backend Development

### Run Tests

```bash
python manage.py test
```

### Create Migrations

```bash
python manage.py makemigrations
```

### Apply Migrations

```bash
python manage.py migrate
```

### Access Django Admin

```bash
http://localhost:8000/admin
```

---

## Frontend Development

### Run Lint

```bash
npm run lint
```

### Production Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

---

# 🐛 Known Issues

* SQLite is used for development only
* Production environment variables not configured
* API authentication not implemented yet
* Frontend dependency vulnerabilities may require:

```bash
npm audit fix
```

---

# 🚢 Production Deployment

## Backend

1. Set `DEBUG = False`
2. Configure `SECRET_KEY` using environment variables
3. Update `ALLOWED_HOSTS`
4. Use PostgreSQL/MySQL instead of SQLite
5. Configure static file serving
6. Enable HTTPS

## Frontend

1. Build production bundle:

```bash
npm run build
```

2. Deploy `dist/` folder using:

* Vercel
* Netlify
* Nginx
* Apache

3. Configure production API endpoints

---

# 🔮 Future Improvements

* Historical melt data storage
* Report generation
* Authentication system
* Export to Excel/PDF
* Advanced analytics dashboard
* Real-time monitoring
* Cloud deployment support
* Predictive optimization using ML models

---

# 🤝 Contributing

Contributions are welcome.

## Steps

1. Fork the repository
2. Create a feature branch
3. Commit changes
4. Push changes
5. Open a Pull Request

---

# 📝 License

This project is proprietary software.
All rights reserved.

---

# 👥 Support

For issues, questions, or contributions, please contact the development team.

---

# 🙏 Acknowledgments

* Built with Django and React
* UI components from shadcn/ui
* Icons from Lucide React

---

# ❤️ Made for Foundry Operations

MeltAssist was developed to simplify melt chemistry calculations and improve process efficiency in industrial foundry environments.
