# Complete Deployment Guide
## ML-Based Early Warning System for Silent Software Project Failure

This guide provides step-by-step instructions for deploying both the frontend and backend of the ML-Based Early Warning System.

---

## Table of Contents

1. [Frontend Deployment](#frontend-deployment)
2. [Backend Deployment](#backend-deployment)
3. [Full Stack Deployment](#full-stack-deployment)
4. [Environment Variables](#environment-variables)
5. [Database Setup](#database-setup)
6. [GitHub Integration](#github-integration)
7. [Production Checklist](#production-checklist)

---

## Frontend Deployment

The frontend is built with React and Vite. It can be deployed to any static hosting service.

### Option 1: Vercel (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Navigate to project root
cd /path/to/project

# Deploy
vercel

# For production
vercel --prod
```

### Option 2: Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build the project
npm run build

# Deploy
netlify deploy

# For production
netlify deploy --prod
```

### Option 3: Manual Build

```bash
# Build the project
npm run build

# The 'dist' folder contains your production-ready files
# Upload the contents to any static hosting service
```

### Frontend Environment Variables

Create a `.env` file in the project root:

```env
VITE_API_URL=https://your-backend-api.com/api
```

---

## Backend Deployment

The backend is a Flask application with ML capabilities.

### Prerequisites

- Python 3.9 or higher
- PostgreSQL (recommended for production)
- GitHub Personal Access Token (for repository analysis)

### Local Development Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file from example
cp .env.example .env

# Edit .env with your configuration
nano .env

# Initialize database
flask init-db

# (Optional) Add sample data
flask seed-db

# Run development server
python app.py
```

The API will be available at `http://localhost:5000`

### Option 1: Heroku Deployment

```bash
# Install Heroku CLI: https://devcenter.heroku.com/articles/heroku-cli

# Login to Heroku
heroku login

# Create new Heroku app
heroku create your-early-warning-api

# Add PostgreSQL database
heroku addons:create heroku-postgresql:hobby-dev

# Set environment variables
heroku config:set SECRET_KEY=$(python -c 'import secrets; print(secrets.token_hex(32))')
heroku config:set JWT_SECRET_KEY=$(python -c 'import secrets; print(secrets.token_hex(32))')
heroku config:set GITHUB_TOKEN=your_github_token_here
heroku config:set FLASK_ENV=production

# Create Procfile in backend directory
echo "web: gunicorn app:app" > Procfile

# Create runtime.txt
echo "python-3.11.0" > runtime.txt

# Deploy to Heroku
git init
git add .
git commit -m "Initial backend deployment"
heroku git:remote -a your-early-warning-api
git push heroku main

# Initialize database
heroku run flask init-db

# Check logs
heroku logs --tail
```

### Option 2: AWS EC2 Deployment

```bash
# SSH into your EC2 instance
ssh -i your-key.pem ubuntu@your-ec2-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Python and dependencies
sudo apt install python3 python3-pip python3-venv nginx -y

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Create database
sudo -u postgres psql
CREATE DATABASE early_warning_db;
CREATE USER early_warning_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE early_warning_db TO early_warning_user;
\q

# Clone your repository
git clone https://github.com/yourusername/your-repo.git
cd your-repo/backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
nano .env
# Add your environment variables

# Initialize database
flask init-db

# Install and configure Gunicorn
pip install gunicorn

# Create systemd service file
sudo nano /etc/systemd/system/early-warning.service
```

Add this content to the service file:

```ini
[Unit]
Description=Early Warning System API
After=network.target

[Service]
User=ubuntu
WorkingDirectory=/home/ubuntu/your-repo/backend
Environment="PATH=/home/ubuntu/your-repo/backend/venv/bin"
ExecStart=/home/ubuntu/your-repo/backend/venv/bin/gunicorn -w 4 -b 127.0.0.1:5000 app:app

[Install]
WantedBy=multi-user.target
```

```bash
# Start the service
sudo systemctl start early-warning
sudo systemctl enable early-warning

# Configure Nginx
sudo nano /etc/nginx/sites-available/early-warning
```

Add this Nginx configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/early-warning /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Install SSL certificate (optional but recommended)
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d your-domain.com
```

### Option 3: Docker Deployment

```bash
# Build Docker image
docker build -t early-warning-api ./backend

# Run with Docker Compose
cd backend
docker-compose up -d

# Check logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Option 4: Google Cloud Run

```bash
# Install Google Cloud SDK
# https://cloud.google.com/sdk/docs/install

# Login
gcloud auth login

# Set project
gcloud config set project your-project-id

# Build and deploy
gcloud builds submit --tag gcr.io/your-project-id/early-warning-api
gcloud run deploy early-warning-api \
  --image gcr.io/your-project-id/early-warning-api \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars="SECRET_KEY=your-secret,JWT_SECRET_KEY=your-jwt-secret,GITHUB_TOKEN=your-token"
```

---

## Full Stack Deployment

### Architecture

```
Frontend (Vercel/Netlify) → Backend API (Heroku/AWS) → Database (PostgreSQL)
                                ↓
                          GitHub API Integration
```

### Steps

1. **Deploy Backend First**
   - Choose a backend hosting option above
   - Note the API URL (e.g., `https://your-api.herokuapp.com`)

2. **Configure Frontend**
   - Update `.env` with backend API URL
   - Build and deploy frontend

3. **Test Integration**
   - Visit frontend URL
   - Test signup/login
   - Create a project
   - Run analysis

---

## Environment Variables

### Frontend (.env)

```env
VITE_API_URL=https://your-backend-api.com/api
```

### Backend (.env)

```env
# Flask Configuration
FLASK_APP=app.py
FLASK_ENV=production
SECRET_KEY=your-super-secret-key-minimum-32-characters-long
JWT_SECRET_KEY=your-jwt-secret-key-minimum-32-characters-long

# Database (PostgreSQL)
DATABASE_URL=postgresql://username:password@host:5432/database_name

# GitHub API
GITHUB_TOKEN=ghp_your_github_personal_access_token

# Server
PORT=5000
CORS_ORIGINS=https://your-frontend-domain.com
```

---

## Database Setup

### PostgreSQL Setup

#### Local Development

```bash
# Install PostgreSQL
# macOS: brew install postgresql
# Ubuntu: sudo apt install postgresql

# Start PostgreSQL
# macOS: brew services start postgresql
# Ubuntu: sudo systemctl start postgresql

# Create database
createdb early_warning_db

# Update DATABASE_URL in .env
DATABASE_URL=postgresql://localhost/early_warning_db
```

#### Production

Most hosting services provide managed PostgreSQL:
- **Heroku**: `heroku addons:create heroku-postgresql`
- **AWS**: Use RDS
- **Google Cloud**: Use Cloud SQL

### Database Migrations

```bash
# Initialize database
flask init-db

# Seed with sample data (optional)
flask seed-db
```

---

## GitHub Integration

### Create Personal Access Token

1. Go to GitHub → Settings → Developer settings → Personal access tokens
2. Click "Generate new token (classic)"
3. Select scopes:
   - ✅ `repo` (Full control of private repositories)
   - ✅ `read:org` (Read org data)
4. Generate and copy token
5. Add to `.env` as `GITHUB_TOKEN=your_token_here`

### Token Security

- **Never commit** tokens to Git
- Use environment variables
- Rotate tokens regularly
- Use minimum required permissions

---

## Production Checklist

### Security

- [ ] Change all default secret keys
- [ ] Enable HTTPS (SSL/TLS)
- [ ] Configure CORS properly
- [ ] Use environment variables for secrets
- [ ] Enable rate limiting
- [ ] Implement input validation
- [ ] Use strong password hashing
- [ ] Keep dependencies updated

### Performance

- [ ] Use production database (PostgreSQL)
- [ ] Enable database connection pooling
- [ ] Configure caching
- [ ] Optimize ML model loading
- [ ] Use CDN for frontend assets
- [ ] Enable gzip compression

### Monitoring

- [ ] Set up error logging
- [ ] Configure application monitoring
- [ ] Set up database backups
- [ ] Configure alerts for downtime
- [ ] Monitor API rate limits

### Testing

- [ ] Test all API endpoints
- [ ] Test ML model predictions
- [ ] Test GitHub integration
- [ ] Test authentication flow
- [ ] Load testing
- [ ] Security testing

---

## Troubleshooting

### Common Issues

#### 1. CORS Errors

```python
# In app.py, update CORS configuration
CORS(app, resources={
    r"/api/*": {
        "origins": ["https://your-frontend-domain.com"],
        "methods": ["GET", "POST", "PUT", "DELETE"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})
```

#### 2. Database Connection Errors

```bash
# Check DATABASE_URL format
# PostgreSQL: postgresql://user:password@host:port/database
# Heroku provides this automatically

# Test connection
flask shell
>>> from app import db
>>> db.create_all()
```

#### 3. GitHub API Rate Limiting

```python
# Use authenticated requests with token
# Increases rate limit from 60 to 5000 requests/hour
```

#### 4. ML Model Performance

```python
# Optimize model loading
# Load models once at startup, not per request
# Consider caching predictions for similar inputs
```

---

## Support and Resources

### Documentation

- [Flask Documentation](https://flask.palletsprojects.com/)
- [React Documentation](https://react.dev/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [GitHub API Documentation](https://docs.github.com/en/rest)

### Hosting Platforms

- [Vercel](https://vercel.com/docs)
- [Netlify](https://docs.netlify.com/)
- [Heroku](https://devcenter.heroku.com/)
- [AWS](https://docs.aws.amazon.com/)
- [Google Cloud](https://cloud.google.com/docs)

---

## License

This project is licensed under the MIT License.

## Author

Created as an academic project for ML-based software project failure detection.
