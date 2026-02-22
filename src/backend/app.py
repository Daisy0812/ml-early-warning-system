# Flask Backend for ML-Based Early Warning System
# This is a production-ready backend API for the early warning system

from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_jwt_extended import (
    JWTManager, create_access_token, jwt_required, get_jwt_identity
)
from datetime import datetime, timedelta
import os
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from xgboost import XGBClassifier
import joblib
import requests

# Initialize Flask app
app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'your-secret-key-change-in-production')
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///early_warning.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'jwt-secret-key-change-in-production')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=7)

# Initialize extensions
CORS(app)
db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)

# ============================================================================
# DATABASE MODELS
# ============================================================================

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(50), nullable=False)  # student, developer, professor, industry
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    projects = db.relationship('Project', backref='owner', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'role': self.role,
            'created_at': self.created_at.isoformat()
        }


class Project(db.Model):
    __tablename__ = 'projects'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    name = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    repository = db.Column(db.String(500))
    risk_score = db.Column(db.Float, default=0.0)
    risk_level = db.Column(db.String(20), default='low')  # low, medium, high
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_analyzed = db.Column(db.DateTime)
    
    analyses = db.relationship('Analysis', backref='project', lazy=True, cascade='all, delete-orphan')
    warnings = db.relationship('Warning', backref='project', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'repository': self.repository,
            'risk_score': self.risk_score,
            'risk_level': self.risk_level,
            'created_at': self.created_at.isoformat(),
            'last_analyzed': self.last_analyzed.isoformat() if self.last_analyzed else None
        }


class Analysis(db.Model):
    __tablename__ = 'analyses'
    
    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey('projects.id'), nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    risk_score = db.Column(db.Float, nullable=False)
    risk_level = db.Column(db.String(20), nullable=False)
    
    # Store as JSON
    metrics = db.Column(db.JSON)
    feature_importance = db.Column(db.JSON)
    warnings = db.Column(db.JSON)
    recommendations = db.Column(db.JSON)
    
    def to_dict(self):
        return {
            'id': self.id,
            'project_id': self.project_id,
            'timestamp': self.timestamp.isoformat(),
            'risk_score': self.risk_score,
            'risk_level': self.risk_level,
            'metrics': self.metrics,
            'feature_importance': self.feature_importance,
            'warnings': self.warnings,
            'recommendations': self.recommendations
        }


class Warning(db.Model):
    __tablename__ = 'warnings'
    
    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey('projects.id'), nullable=False)
    severity = db.Column(db.String(20), nullable=False)  # low, medium, high, critical
    message = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    acknowledged = db.Column(db.Boolean, default=False)
    
    def to_dict(self):
        return {
            'id': self.id,
            'project_id': self.project_id,
            'severity': self.severity,
            'message': self.message,
            'timestamp': self.timestamp.isoformat(),
            'acknowledged': self.acknowledged
        }


# ============================================================================
# ML MODEL CLASS
# ============================================================================

class RiskPredictor:
    """Machine Learning model for project failure risk prediction"""
    
    def __init__(self):
        self.rf_model = None
        self.xgb_model = None
        self.feature_names = [
            'commit_frequency',
            'contributor_activity',
            'issue_resolution_time',
            'code_churn',
            'open_issues_ratio'
        ]
        
    def train_models(self, X, y):
        """Train both Random Forest and XGBoost models"""
        self.rf_model = RandomForestClassifier(
            n_estimators=100,
            max_depth=10,
            random_state=42
        )
        self.rf_model.fit(X, y)
        
        self.xgb_model = XGBClassifier(
            n_estimators=100,
            max_depth=10,
            learning_rate=0.1,
            random_state=42
        )
        self.xgb_model.fit(X, y)
        
    def predict_risk(self, features):
        """Predict failure risk score (0-100)"""
        if self.rf_model is None or self.xgb_model is None:
            # Use rule-based prediction if models not trained
            return self._rule_based_prediction(features)
        
        # Get predictions from both models
        rf_prob = self.rf_model.predict_proba([features])[0][1]
        xgb_prob = self.xgb_model.predict_proba([features])[0][1]
        
        # Ensemble prediction (average)
        risk_score = (rf_prob + xgb_prob) / 2 * 100
        
        return risk_score
    
    def _rule_based_prediction(self, features):
        """Fallback rule-based prediction when models aren't trained"""
        commit_freq, contributor_activity, resolution_time, code_churn, open_ratio = features
        
        risk_score = 0.0
        
        # Commit frequency (lower is worse)
        if commit_freq < 2:
            risk_score += 25
        elif commit_freq < 4:
            risk_score += 15
        elif commit_freq < 6:
            risk_score += 5
            
        # Contributor activity (lower is worse)
        if contributor_activity < 40:
            risk_score += 30
        elif contributor_activity < 60:
            risk_score += 20
        elif contributor_activity < 80:
            risk_score += 10
            
        # Issue resolution time (higher is worse)
        if resolution_time > 14:
            risk_score += 25
        elif resolution_time > 10:
            risk_score += 15
        elif resolution_time > 7:
            risk_score += 5
            
        # Code churn (very high is unstable)
        if code_churn > 500:
            risk_score += 10
        elif code_churn > 300:
            risk_score += 5
            
        # Open issues ratio (higher is worse)
        if open_ratio > 0.4:
            risk_score += 10
        elif open_ratio > 0.3:
            risk_score += 5
            
        return min(risk_score, 100)
    
    def get_feature_importance(self):
        """Get feature importance scores"""
        if self.rf_model is None:
            # Return default importance
            return [
                {'feature': 'Contributor Activity', 'importance': 0.30, 'trend': 'stable'},
                {'feature': 'Issue Resolution Time', 'importance': 0.25, 'trend': 'stable'},
                {'feature': 'Commit Frequency', 'importance': 0.20, 'trend': 'stable'},
                {'feature': 'Open Issues Ratio', 'importance': 0.15, 'trend': 'stable'},
                {'feature': 'Code Churn', 'importance': 0.10, 'trend': 'stable'},
            ]
        
        importances = self.rf_model.feature_importances_
        feature_imp = []
        for name, imp in zip(self.feature_names, importances):
            feature_imp.append({
                'feature': name.replace('_', ' ').title(),
                'importance': float(imp),
                'trend': 'stable'  # Would be calculated from historical data
            })
        
        return sorted(feature_imp, key=lambda x: x['importance'], reverse=True)
    
    def generate_warnings(self, features, risk_score):
        """Generate specific warnings based on metrics"""
        warnings = []
        commit_freq, contributor_activity, resolution_time, code_churn, open_ratio = features
        
        if contributor_activity < 50:
            warnings.append("Declining contributor activity detected - engagement is below healthy levels")
        
        if open_ratio > 0.3:
            warnings.append("Increasing number of unresolved issues - backlog is growing")
        
        if resolution_time > 10:
            warnings.append("Delayed issue resolution times - average resolution taking too long")
        
        if commit_freq < 3:
            warnings.append("Low commit frequency - development activity is declining")
        
        if code_churn > 400:
            warnings.append("High code churn detected - potential instability in codebase")
        
        if risk_score > 70 and not warnings:
            warnings.append("Multiple risk factors detected - comprehensive review recommended")
        
        return warnings
    
    def generate_recommendations(self, features, warnings):
        """Generate actionable recommendations"""
        recommendations = []
        commit_freq, contributor_activity, resolution_time, code_churn, open_ratio = features
        
        if contributor_activity < 50:
            recommendations.append("Increase team collaboration through daily standups or weekly syncs")
            recommendations.append("Consider bringing in additional contributors or redistributing workload")
        
        if open_ratio > 0.3:
            recommendations.append("Prioritize and address open issues - consider triage meeting")
            recommendations.append("Review issue management workflow for bottlenecks")
        
        if resolution_time > 10:
            recommendations.append("Optimize bug resolution workflow to reduce average resolution time")
            recommendations.append("Implement automated testing to catch issues earlier")
        
        if commit_freq < 3:
            recommendations.append("Establish regular development cadence with consistent commit schedule")
            recommendations.append("Break down large tasks into smaller, more frequent commits")
        
        if code_churn > 400:
            recommendations.append("Review code review practices to reduce unnecessary changes")
            recommendations.append("Stabilize architecture before adding new features")
        
        if not recommendations:
            recommendations.append("Project is healthy - maintain current development practices")
            recommendations.append("Continue regular contributions and active issue management")
        
        return recommendations[:5]  # Return top 5 recommendations


# Initialize predictor
predictor = RiskPredictor()


# ============================================================================
# AUTHENTICATION ROUTES
# ============================================================================

@app.route('/api/auth/signup', methods=['POST'])
def signup():
    """User registration endpoint"""
    data = request.get_json()
    
    # Validate input
    if not all(k in data for k in ['username', 'email', 'password', 'role']):
        return jsonify({'error': 'Missing required fields'}), 400
    
    # Check if user exists
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'error': 'Username already exists'}), 400
    
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already exists'}), 400
    
    # Create user
    password_hash = bcrypt.generate_password_hash(data['password']).decode('utf-8')
    user = User(
        username=data['username'],
        email=data['email'],
        password_hash=password_hash,
        role=data['role']
    )
    
    db.session.add(user)
    db.session.commit()
    
    # Create access token
    access_token = create_access_token(identity=user.id)
    
    return jsonify({
        'message': 'User created successfully',
        'access_token': access_token,
        'user': user.to_dict()
    }), 201


@app.route('/api/auth/login', methods=['POST'])
def login():
    """User login endpoint"""
    data = request.get_json()
    
    if not all(k in data for k in ['username', 'password']):
        return jsonify({'error': 'Missing username or password'}), 400
    
    user = User.query.filter_by(username=data['username']).first()
    
    if not user or not bcrypt.check_password_hash(user.password_hash, data['password']):
        return jsonify({'error': 'Invalid credentials'}), 401
    
    access_token = create_access_token(identity=user.id)
    
    return jsonify({
        'message': 'Login successful',
        'access_token': access_token,
        'user': user.to_dict()
    }), 200


# ============================================================================
# PROJECT ROUTES
# ============================================================================

@app.route('/api/projects', methods=['GET'])
@jwt_required()
def get_projects():
    """Get all projects for current user"""
    user_id = get_jwt_identity()
    projects = Project.query.filter_by(user_id=user_id).all()
    
    return jsonify({
        'projects': [p.to_dict() for p in projects]
    }), 200


@app.route('/api/projects', methods=['POST'])
@jwt_required()
def create_project():
    """Create a new project"""
    user_id = get_jwt_identity()
    data = request.get_json()
    
    if not data.get('name'):
        return jsonify({'error': 'Project name is required'}), 400
    
    project = Project(
        user_id=user_id,
        name=data['name'],
        description=data.get('description', ''),
        repository=data.get('repository', '')
    )
    
    db.session.add(project)
    db.session.commit()
    
    return jsonify({
        'message': 'Project created successfully',
        'project': project.to_dict()
    }), 201


@app.route('/api/projects/<int:project_id>', methods=['GET'])
@jwt_required()
def get_project(project_id):
    """Get specific project details"""
    user_id = get_jwt_identity()
    project = Project.query.filter_by(id=project_id, user_id=user_id).first()
    
    if not project:
        return jsonify({'error': 'Project not found'}), 404
    
    return jsonify({
        'project': project.to_dict()
    }), 200


@app.route('/api/projects/<int:project_id>', methods=['DELETE'])
@jwt_required()
def delete_project(project_id):
    """Delete a project"""
    user_id = get_jwt_identity()
    project = Project.query.filter_by(id=project_id, user_id=user_id).first()
    
    if not project:
        return jsonify({'error': 'Project not found'}), 404
    
    db.session.delete(project)
    db.session.commit()
    
    return jsonify({'message': 'Project deleted successfully'}), 200


# ============================================================================
# ANALYSIS ROUTES
# ============================================================================

@app.route('/api/analyze', methods=['POST'])
@jwt_required()
def analyze_project():
    """Run ML analysis on project data"""
    user_id = get_jwt_identity()
    data = request.get_json()
    
    project_id = data.get('project_id')
    if not project_id:
        return jsonify({'error': 'Project ID required'}), 400
    
    project = Project.query.filter_by(id=project_id, user_id=user_id).first()
    if not project:
        return jsonify({'error': 'Project not found'}), 404
    
    # Extract metrics from data
    metrics = data.get('metrics', {})
    features = [
        metrics.get('commit_frequency', 0),
        metrics.get('contributor_activity', 0),
        metrics.get('issue_resolution_time', 0),
        metrics.get('code_churn', 0),
        metrics.get('open_issues_ratio', 0)
    ]
    
    # Predict risk
    risk_score = predictor.predict_risk(features)
    
    # Determine risk level
    if risk_score < 30:
        risk_level = 'low'
    elif risk_score < 60:
        risk_level = 'medium'
    else:
        risk_level = 'high'
    
    # Generate warnings and recommendations
    warnings = predictor.generate_warnings(features, risk_score)
    recommendations = predictor.generate_recommendations(features, warnings)
    feature_importance = predictor.get_feature_importance()
    
    # Create analysis record
    analysis = Analysis(
        project_id=project_id,
        risk_score=risk_score,
        risk_level=risk_level,
        metrics=metrics,
        feature_importance=feature_importance,
        warnings=warnings,
        recommendations=recommendations
    )
    
    db.session.add(analysis)
    
    # Update project
    project.risk_score = risk_score
    project.risk_level = risk_level
    project.last_analyzed = datetime.utcnow()
    
    # Create warning records for high severity issues
    if risk_level == 'high':
        for warning_msg in warnings[:2]:  # Top 2 warnings
            warning = Warning(
                project_id=project_id,
                severity='critical' if risk_score > 80 else 'high',
                message=warning_msg
            )
            db.session.add(warning)
    
    db.session.commit()
    
    return jsonify({
        'message': 'Analysis completed successfully',
        'analysis': analysis.to_dict()
    }), 200


@app.route('/api/projects/<int:project_id>/analyses', methods=['GET'])
@jwt_required()
def get_project_analyses(project_id):
    """Get all analyses for a project"""
    user_id = get_jwt_identity()
    project = Project.query.filter_by(id=project_id, user_id=user_id).first()
    
    if not project:
        return jsonify({'error': 'Project not found'}), 404
    
    analyses = Analysis.query.filter_by(project_id=project_id).order_by(Analysis.timestamp.desc()).all()
    
    return jsonify({
        'analyses': [a.to_dict() for a in analyses]
    }), 200


@app.route('/api/warnings', methods=['GET'])
@jwt_required()
def get_warnings():
    """Get all warnings for user's projects"""
    user_id = get_jwt_identity()
    user_projects = Project.query.filter_by(user_id=user_id).all()
    project_ids = [p.id for p in user_projects]
    
    warnings = Warning.query.filter(Warning.project_id.in_(project_ids)).order_by(Warning.timestamp.desc()).all()
    
    return jsonify({
        'warnings': [w.to_dict() for w in warnings]
    }), 200


@app.route('/api/warnings/<int:warning_id>/acknowledge', methods=['PUT'])
@jwt_required()
def acknowledge_warning(warning_id):
    """Acknowledge a warning"""
    warning = Warning.query.get(warning_id)
    
    if not warning:
        return jsonify({'error': 'Warning not found'}), 404
    
    warning.acknowledged = True
    db.session.commit()
    
    return jsonify({'message': 'Warning acknowledged'}), 200


# ============================================================================
# GITHUB INTEGRATION
# ============================================================================

@app.route('/api/github/analyze', methods=['POST'])
@jwt_required()
def analyze_github_repo():
    """Fetch and analyze GitHub repository data"""
    data = request.get_json()
    repo_url = data.get('repository')
    
    if not repo_url:
        return jsonify({'error': 'Repository URL required'}), 400
    
    # Extract owner and repo from URL
    # Expected format: https://github.com/owner/repo
    parts = repo_url.rstrip('/').split('/')
    if len(parts) < 2:
        return jsonify({'error': 'Invalid repository URL'}), 400
    
    owner = parts[-2]
    repo = parts[-1]
    
    # GitHub API token (should be set in environment)
    github_token = os.environ.get('GITHUB_TOKEN')
    headers = {'Authorization': f'token {github_token}'} if github_token else {}
    
    try:
        # Fetch repository data
        repo_response = requests.get(
            f'https://api.github.com/repos/{owner}/{repo}',
            headers=headers
        )
        
        # Fetch commits
        commits_response = requests.get(
            f'https://api.github.com/repos/{owner}/{repo}/commits',
            headers=headers
        )
        
        # Fetch issues
        issues_response = requests.get(
            f'https://api.github.com/repos/{owner}/{repo}/issues?state=all',
            headers=headers
        )
        
        # Fetch contributors
        contributors_response = requests.get(
            f'https://api.github.com/repos/{owner}/{repo}/contributors',
            headers=headers
        )
        
        # Calculate metrics
        repo_data = repo_response.json()
        commits_data = commits_response.json() if commits_response.status_code == 200 else []
        issues_data = issues_response.json() if issues_response.status_code == 200 else []
        contributors_data = contributors_response.json() if contributors_response.status_code == 200 else []
        
        open_issues = len([i for i in issues_data if i.get('state') == 'open'])
        closed_issues = len([i for i in issues_data if i.get('state') == 'closed'])
        
        metrics = {
            'commit_frequency': min(len(commits_data) / 7, 10),  # Commits per day (simplified)
            'contributor_activity': min((len(contributors_data) / 5) * 100, 100),
            'issue_resolution_time': 7.0,  # Would need more complex calculation
            'code_churn': 200,  # Would need commit diff analysis
            'open_issues_ratio': open_issues / max(open_issues + closed_issues, 1)
        }
        
        return jsonify({
            'message': 'GitHub data fetched successfully',
            'metrics': metrics,
            'repository_info': {
                'name': repo_data.get('name'),
                'description': repo_data.get('description'),
                'stars': repo_data.get('stargazers_count'),
                'forks': repo_data.get('forks_count')
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to fetch GitHub data: {str(e)}'}), 500


# ============================================================================
# UTILITY ROUTES
# ============================================================================

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.utcnow().isoformat()
    }), 200


@app.route('/api/stats', methods=['GET'])
@jwt_required()
def get_dashboard_stats():
    """Get dashboard statistics"""
    user_id = get_jwt_identity()
    projects = Project.query.filter_by(user_id=user_id).all()
    
    total_projects = len(projects)
    avg_risk = sum(p.risk_score for p in projects) / total_projects if total_projects > 0 else 0
    
    risk_distribution = {
        'low': len([p for p in projects if p.risk_level == 'low']),
        'medium': len([p for p in projects if p.risk_level == 'medium']),
        'high': len([p for p in projects if p.risk_level == 'high'])
    }
    
    project_ids = [p.id for p in projects]
    warnings = Warning.query.filter(Warning.project_id.in_(project_ids), Warning.acknowledged == False).all()
    
    return jsonify({
        'total_projects': total_projects,
        'average_risk_score': round(avg_risk, 2),
        'risk_distribution': risk_distribution,
        'active_warnings': len(warnings)
    }), 200


# ============================================================================
# DATABASE INITIALIZATION
# ============================================================================

@app.cli.command()
def init_db():
    """Initialize the database"""
    db.create_all()
    print("Database initialized successfully!")


@app.cli.command()
def seed_db():
    """Seed database with sample data"""
    # Create sample user
    password_hash = bcrypt.generate_password_hash('password123').decode('utf-8')
    user = User(
        username='demo_user',
        email='demo@example.com',
        password_hash=password_hash,
        role='developer'
    )
    db.session.add(user)
    db.session.commit()
    
    print("Database seeded successfully!")


# ============================================================================
# RUN APPLICATION
# ============================================================================

if __name__ == '__main__':
    # Create tables if they don't exist
    with app.app_context():
        db.create_all()
    
    # Run the application
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_ENV') == 'development'
    app.run(host='0.0.0.0', port=port, debug=debug)
