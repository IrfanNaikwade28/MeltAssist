# 🔥 MeltAssist
**AI-Powered Foundry Melt Chemistry Optimization System**

---

## 🎥Demo Video
https://github.com/user-attachments/assets/a464be40-200f-4d6d-9e76-1e9f95e444cd

---

MeltAssist is an intelligent decision support system for foundry operations that uses machine learning to optimize alloy additions and melt chemistry adjustments. The system provides step-by-step recommendations for achieving target chemistry specifications while maintaining safety thresholds and industry best practices.

---

## ✨ Features

- **🎯 Chemistry Optimization**: ML-powered predictions for alloy additions based on initial and target chemistry
- **📊 Multi-Step Workflow**: Guided foundry workflow with:
  - Melt input and specification
  - Chemistry analysis and delta calculation
  - Alloy recommendation with kg/ton predictions
  - Re-sampling and verification steps
  - Step execution tracking
- **🔬 Machine Learning Engine**: Trained models for predicting alloy additions (kg/ton)
- **⚡ Real-time API**: RESTful backend with Django Rest Framework
- **🎨 Modern UI**: React + TypeScript frontend with Tailwind CSS and shadcn/ui components
- **🛡️ Safety Thresholds**: Built-in validation for melt weight and chemistry ranges
- **📈 Large Correction Handling**: Automatic multi-step recommendations for significant chemistry changes

---

## 🏗️ Tech Stack

### Backend
- **Framework**: Django 5.2+
- **API**: Django Rest Framework
- **ML/AI**: scikit-learn, NumPy, pandas, joblib
- **Database**: SQLite (development)
- **CORS**: django-cors-headers

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui (Radix UI)
- **State Management**: TanStack Query (React Query)
- **Icons**: Lucide React
- **Date Handling**: date-fns

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Python**: 3.10 or higher
- **Node.js**: 18.x or higher (or Bun runtime)
- **pip**: Python package installer
- **npm/bun**: Node package manager

---

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd MeltAssist
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create a virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Create a superuser (optional, for admin access)
python manage.py createsuperuser

# Start the development server
python manage.py runserver
```

The backend API will be available at `http://localhost:8000`

### 3. Frontend Setup

```bash
# Navigate to frontend directory (from project root)
cd frontend

# Install dependencies
npm install
# OR if using Bun:
bun install

# Start the development server
npm run dev
# OR if using Bun:
bun run dev
```

The frontend will be available at `http://localhost:5173`

---

## 🎮 Usage

### Starting the Application

1. **Start Backend**:
   ```bash
   cd backend
   python manage.py runserver
   ```

2. **Start Frontend** (in a new terminal):
   ```bash
   cd frontend
   npm run dev
   ```

3. Open your browser and navigate to `http://localhost:5173`

### Workflow Steps

1. **Melt Input**: Enter current melt chemistry, target chemistry, and melt weight (kg)
2. **Chemistry Analysis**: Review the chemistry deltas and required adjustments
3. **Alloy Recommendation**: Get ML-predicted alloy additions in kg
4. **Re-Sampling**: Plan verification samples after additions
5. **Step Execution**: Track execution of recommended steps
6. **Completion**: Review results and finalize the melt

---

## 📡 API Endpoints

### Melt Optimization

**POST** `/api/optimize/`

Predict alloy additions for melt chemistry optimization.

**Request Body**:
```json
{
  "initial_chemistry": {
    "C": 0.15,
    "Si": 0.25,
    "Mn": 0.80,
    ...
  },
  "target_chemistry": {
    "C": 0.18,
    "Si": 0.30,
    "Mn": 1.00,
    ...
  },
  "melt_weight_kg": 20000
}
```

**Response**:
```json
{
  "status": "success",
  "message": "Optimization complete",
  "data": {
    "alloy_additions_kg": {
      "FeSi75": 45.2,
      "FeMn": 32.8,
      ...
    },
    "steps": [...],
    "requires_multiple_steps": false
  }
}
```

---

## 📁 Project Structure

```
MeltAssist/
├── backend/                 # Django backend
│   ├── config/             # Django project configuration
│   │   ├── settings.py     # Project settings
│   │   ├── urls.py         # Main URL configuration
│   │   └── wsgi.py         # WSGI configuration
│   ├── meltopt/            # Main application
│   │   ├── models.py       # Database models
│   │   ├── views.py        # API views
│   │   ├── urls.py         # App URL routes
│   │   └── ml/             # Machine learning module
│   │       ├── config.py   # ML configuration
│   │       ├── loader.py   # Model loader
│   │       └── predictor.py # Prediction engine
│   ├── models/             # Trained ML models (joblib)
│   ├── manage.py           # Django management script
│   └── requirements.txt    # Python dependencies
│
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   │   ├── dashboard/ # Dashboard components
│   │   │   └── ui/        # shadcn/ui components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── services/      # API service layer
│   │   ├── types/         # TypeScript type definitions
│   │   └── pages/         # Page components
│   ├── package.json       # Node dependencies
│   └── vite.config.ts     # Vite configuration
│
└── README.md              # This file
```

---

## 🧪 Machine Learning Models

The system uses trained scikit-learn models that predict **kg/ton** (kilograms per ton of melt) for various alloy additions. The models are trained on historical foundry data and consider:

- **Input Features**: Chemistry deltas (target - initial) for all elements
- **Output**: Predicted alloy addition amounts in kg/ton
- **Conversion**: Automatically converts to total kg using melt weight

### Supported Elements
C, Si, Mn, P, S, Cr, Ni, Mo, Cu, Al, Ti, V, Nb, N, and others

### Safety Features
- Minimum melt weight validation
- Maximum melt weight validation
- Large correction detection
- Multi-step recommendation for significant changes

---

## 🔧 Development

### Backend Development

```bash
# Run tests
python manage.py test

# Create new migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Access Django admin
# Navigate to http://localhost:8000/admin
```

### Frontend Development

```bash
# Run linting
npm run lint

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 🐛 Known Issues

- Frontend shows 7 vulnerabilities (3 moderate, 4 high) - Run `npm audit fix` to address
- SECRET_KEY in settings.py should be moved to environment variables for production
- DEBUG mode is enabled - disable for production deployment

---

## 🚢 Production Deployment

### Backend
1. Set `DEBUG = False` in settings.py
2. Configure proper SECRET_KEY from environment variable
3. Update ALLOWED_HOSTS
4. Use PostgreSQL or MySQL instead of SQLite
5. Configure static files serving
6. Set up HTTPS

### Frontend
1. Build production bundle: `npm run build`
2. Serve the `dist/` directory using a web server (nginx, Apache, etc.)
3. Configure proper API endpoint URLs
4. Enable production optimizations

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is proprietary software. All rights reserved.

---

## 👥 Support

For issues, questions, or contributions, please contact the development team.

---

## 🙏 Acknowledgments

- Built with Django and React
- UI components from shadcn/ui
- ML powered by scikit-learn
- Icons from Lucide React

---

**Made with ❤️ for foundry operations optimization**


