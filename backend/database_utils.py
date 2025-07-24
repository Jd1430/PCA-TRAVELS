from models import User, OTPToken
from database import db
from datetime import datetime
import json

def get_formatted_database_info():
    """
    Get formatted database information including table schemas and data
    """
    try:
        # Get all users
        users = User.query.all()
        users_data = []
        for user in users:
            users_data.append({
                'id': user.id,
                'name': user.name,
                'email': user.email,
                'password_hash': str(user.password_hash)[:20] + '...' if len(str(user.password_hash)) > 20 else str(user.password_hash),
                'created_at': user.created_at.isoformat() if user.created_at else None
            })
        
        # Get all OTP tokens
        otp_tokens = OTPToken.query.all()
        otp_data = []
        for otp in otp_tokens:
            otp_data.append({
                'id': otp.id,
                'email': otp.email,
                'token': otp.token,
                'created_at': otp.created_at.isoformat() if otp.created_at else None
            })
        
        # Database schema information
        schema_info = {
            'tables': {
                'user': {
                    'columns': [
                        {'name': 'id', 'type': 'INTEGER', 'primary_key': True, 'nullable': False},
                        {'name': 'name', 'type': 'VARCHAR(120)', 'primary_key': False, 'nullable': False},
                        {'name': 'email', 'type': 'VARCHAR(120)', 'primary_key': False, 'nullable': False, 'unique': True},
                        {'name': 'password_hash', 'type': 'VARCHAR(128)', 'primary_key': False, 'nullable': False},
                        {'name': 'created_at', 'type': 'DATETIME', 'primary_key': False, 'nullable': True}
                    ],
                    'row_count': len(users_data)
                },
                'otp_token': {
                    'columns': [
                        {'name': 'id', 'type': 'INTEGER', 'primary_key': True, 'nullable': False},
                        {'name': 'email', 'type': 'VARCHAR(120)', 'primary_key': False, 'nullable': False},
                        {'name': 'token', 'type': 'VARCHAR(6)', 'primary_key': False, 'nullable': False},
                        {'name': 'created_at', 'type': 'DATETIME', 'primary_key': False, 'nullable': True}
                    ],
                    'row_count': len(otp_data)
                }
            }
        }
        
        # Compile complete database info
        database_info = {
            'database_name': 'auth.db',
            'database_type': 'SQLite',
            'last_updated': datetime.now().isoformat(),
            'schema': schema_info,
            'data': {
                'users': users_data,
                'otp_tokens': otp_data
            },
            'statistics': {
                'total_tables': 2,
                'total_users': len(users_data),
                'total_otp_tokens': len(otp_data),
                'database_size': 'N/A'  # Could be calculated if needed
            }
        }
        
        return database_info
        
    except Exception as e:
        return {
            'error': str(e),
            'message': 'Failed to retrieve database information'
        }

def export_database_to_json(filename='database_export.json'):
    """
    Export database information to a JSON file
    """
    try:
        db_info = get_formatted_database_info()
        with open(filename, 'w') as f:
            json.dump(db_info, f, indent=2)
        return {'success': True, 'filename': filename}
    except Exception as e:
        return {'success': False, 'error': str(e)}

def get_database_summary():
    """
    Get a summary of database information
    """
    try:
        user_count = User.query.count()
        otp_count = OTPToken.query.count()
        
        # Get recent activity
        recent_users = User.query.order_by(User.created_at.desc()).limit(5).all()
        recent_otps = OTPToken.query.order_by(OTPToken.created_at.desc()).limit(5).all()
        
        summary = {
            'total_users': user_count,
            'total_otp_tokens': otp_count,
            'recent_users': [
                {
                    'name': user.name,
                    'email': user.email,
                    'created_at': user.created_at.isoformat() if user.created_at else None
                } for user in recent_users
            ],
            'recent_otp_tokens': [
                {
                    'email': otp.email,
                    'token': otp.token,
                    'created_at': otp.created_at.isoformat() if otp.created_at else None
                } for otp in recent_otps
            ]
        }
        
        return summary
        
    except Exception as e:
        return {'error': str(e)} 