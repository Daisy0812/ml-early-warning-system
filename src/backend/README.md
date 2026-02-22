# ML-Based Early Warning System - Backend API

Flask-based REST API for the ML-Based Early Warning System for Silent Software Project Failure Detection.

## Features

- **User Authentication**: JWT-based authentication with signup/login
- **Project Management**: Create, read, update, delete projects
- **ML Risk Analysis**: Random Forest & XGBoost models for risk prediction
- **Explainable AI**: Feature importance and risk factor analysis
- **GitHub Integration**: Automatic repository metrics fetching
- **Warning System**: Automated warning generation and management
- **RESTful API**: Clean, documented API endpoints

## Tech Stack

- **Framework**: Flask 3.0
- **Database**: SQLAlchemy (SQLite/PostgreSQL)
- **ML Models**: scikit-learn, XGBoost
- **Authentication**: Flask-JWT-Extended, Bcrypt
- **Data Processing**: Pandas, NumPy

## Installation

### 1. Create Virtual Environment

```bash
python -m venv venv

# On Windows
venv\Scripts\activate

# On macOS/Linux
source venv/bin/activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Environment Configuration

```bash
# Copy example environment file
cp .env.example .env

# Edit .env with your configuration
nano .env  # or use any text editor
```

### 4. Initialize Database

```bash
# Create database tables
flask init-db

# (Optional) Seed with sample data
flask seed-db
```

## Running the Application

### Development Mode

```bash
python app.py
```

The API will be available at `http://localhost:5000`

### Production Mode

```bash
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

## API Endpoints

### Authentication

#### Sign Up
```http
POST /api/auth/signup
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securepassword",
  "role": "developer"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "johndoe",
  "password": "securepassword"
}
```

### Projects

#### Get All Projects
```http
GET /api/projects
Authorization: Bearer <access_token>
```

#### Create Project
```http
POST /api/projects
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "My Project",
  "description": "Project description",
  "repository": "https://github.com/user/repo"
}
```

#### Get Project Details
```http
GET /api/projects/{project_id}
Authorization: Bearer <access_token>
```

#### Delete Project
```http
DELETE /api/projects/{project_id}
Authorization: Bearer <access_token>
```

### Analysis

#### Run ML Analysis
```http
POST /api/analyze
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "project_id": 1,
  "metrics": {
    "commit_frequency": 4.2,
    "contributor_activity": 75,
    "issue_resolution_time": 6.5,
    "code_churn": 234,
    "open_issues_ratio": 0.15
  }
}
```

#### Get Project Analyses
```http
GET /api/projects/{project_id}/analyses
Authorization: Bearer <access_token>
```

### GitHub Integration

#### Analyze GitHub Repository
```http
POST /api/github/analyze
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "repository": "https://github.com/owner/repo"
}
```

### Warnings

#### Get All Warnings
```http
GET /api/warnings
Authorization: Bearer <access_token>
```

#### Acknowledge Warning
```http
PUT /api/warnings/{warning_id}/acknowledge
Authorization: Bearer <access_token>
```

### Utilities

#### Health Check
```http
GET /api/health
```

#### Dashboard Statistics
```http
GET /api/stats
Authorization: Bearer <access_token>
```

## Machine Learning Models

### Risk Predictor

The system uses an ensemble approach combining:

1. **Random Forest Classifier**
   - 100 estimators
   - Max depth: 10
   - Handles non-linear relationships well

2. **XGBoost Classifier**
   - 100 estimators
   - Learning rate: 0.1
   - Excellent for structured data

### Features Used

1. **Commit Frequency**: Average commits per day
2. **Contributor Activity**: Engagement level (%)
3. **Issue Resolution Time**: Average days to close issues
4. **Code Churn**: Lines of code changed per day
5. **Open Issues Ratio**: Proportion of unresolved issues

### Risk Scoring

- **0-29%**: Low Risk (Green)
- **30-59%**: Medium Risk (Yellow)
- **60-100%**: High Risk (Red)

## Database Schema

### Users Table
- id, username, email, password_hash, role, created_at

### Projects Table
- id, user_id, name, description, repository, risk_score, risk_level, created_at, last_analyzed

### Analyses Table
- id, project_id, timestamp, risk_score, risk_level, metrics, feature_importance, warnings, recommendations

### Warnings Table
- id, project_id, severity, message, timestamp, acknowledged

## Deployment

### Using Heroku

```bash
# Login to Heroku
heroku login

# Create app
heroku create your-app-name

# Add PostgreSQL
heroku addons:create heroku-postgresql:hobby-dev

# Set environment variables
heroku config:set SECRET_KEY=your-secret-key
heroku config:set JWT_SECRET_KEY=your-jwt-secret
heroku config:set GITHUB_TOKEN=your-github-token

# Deploy
git push heroku main

# Initialize database
heroku run flask init-db
```

### Using Docker

```bash
# Build image
docker build -t early-warning-api .

# Run container
docker run -p 5000:5000 \
  -e SECRET_KEY=your-secret \
  -e DATABASE_URL=postgresql://... \
  early-warning-api
```

## Testing

```bash
# Run tests
pytest

# With coverage
pytest --cov=app tests/
```

## Security Considerations

1. **Change default secrets** in production
2. **Use HTTPS** for all API communication
3. **Enable CORS** only for trusted domains
4. **Use PostgreSQL** instead of SQLite in production
5. **Implement rate limiting** for API endpoints
6. **Validate all inputs** to prevent injection attacks
7. **Keep dependencies updated** for security patches

## GitHub Token Setup

1. Go to GitHub Settings → Developer settings → Personal access tokens
2. Generate new token with these scopes:
   - `repo` (for private repositories)
   - `read:org` (for organization data)
3. Add token to `.env` file as `GITHUB_TOKEN`

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## License

This project is licensed under the MIT License.

## Support

For issues and questions:
- Open an issue on GitHub
- Email: support@example.com

## Authors

- Your Name - Initial work

## Acknowledgments

- scikit-learn and XGBoost teams for ML libraries
- Flask community for excellent web framework
- GitHub API for repository data access
