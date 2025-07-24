from flask import Blueprint, request, jsonify
from models import db, User, OTPToken
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
import datetime
from functools import wraps
import os
import random

auth_bp = Blueprint('auth_bp', __name__)

# Authentication decorator
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            token = request.headers['Authorization'].split(' ')[1]
        
        if not token:
            return jsonify({'message': 'Token is missing'}), 401

        try:
            data = jwt.decode(token, os.environ.get('SECRET_KEY', 'your-secret-key-here'), algorithms=["HS256"])
            current_user = User.query.get(data['user_id'])
            if not current_user:
                return jsonify({'message': 'Invalid token'}), 401
        except:
            return jsonify({'message': 'Invalid token'}), 401

        return f(current_user, *args, **kwargs)
    return decorated

# Admin required decorator
def admin_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            token = request.headers['Authorization'].split(' ')[1]
        
        if not token:
            return jsonify({'message': 'Token is missing'}), 401

        try:
            data = jwt.decode(token, os.environ.get('SECRET_KEY', 'your-secret-key-here'), algorithms=["HS256"])
            current_user = User.query.get(data['user_id'])
            if not current_user or not current_user.is_admin:
                return jsonify({'message': 'Admin privileges required'}), 403
        except:
            return jsonify({'message': 'Invalid token'}), 401

        return f(*args, **kwargs)
    return decorated

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()

    if not all(k in data for k in ('name', 'email', 'password')):
        return jsonify({'message': 'Missing required fields'}), 400

    if User.query.filter_by(email=data['email']).first():
        return jsonify({'message': 'Email already registered'}), 400

    hashed_password = generate_password_hash(data['password'])
    new_user = User(
        name=data['name'],
        email=data['email'],
        password_hash=hashed_password,
        phone=data.get('phone'),
        address=data.get('address')
    )

    db.session.add(new_user)
    db.session.commit()

    # Generate JWT token for the new user
    token = jwt.encode({
        'user_id': new_user.id,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(days=7)
    }, os.environ.get('SECRET_KEY', 'your-secret-key-here'))

    return jsonify({
        'token': token,
        'user': {
            'id': new_user.id,
            'name': new_user.name,
            'email': new_user.email,
            'is_admin': new_user.is_admin
        }
    }), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()

    if not all(k in data for k in ('email', 'password')):
        return jsonify({'message': 'Missing required fields'}), 400

    user = User.query.filter_by(email=data['email']).first()

    if not user or not check_password_hash(user.password_hash, data['password']):
        return jsonify({'message': 'Invalid email or password'}), 401

    token = jwt.encode({
        'user_id': user.id,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(days=7)
    }, os.environ.get('SECRET_KEY', 'your-secret-key-here'))

    return jsonify({
        'token': token,
        'user': {
            'id': user.id,
            'name': user.name,
            'email': user.email,
            'is_admin': user.is_admin
        }
    })

@auth_bp.route('/me', methods=['GET'])
@token_required
def get_user_details(current_user):
    return jsonify({
        'user': {
            'id': current_user.id,
            'name': current_user.name,
            'email': current_user.email,
            'phone': current_user.phone,
            'address': current_user.address,
            'is_admin': current_user.is_admin
        }
    })

@auth_bp.route('/me', methods=['PUT'])
@token_required
def update_user_details(current_user):
    data = request.get_json()

    if 'name' in data:
        current_user.name = data['name']
    if 'phone' in data:
        current_user.phone = data['phone']
    if 'address' in data:
        current_user.address = data['address']

    db.session.commit()

    return jsonify({'message': 'User details updated successfully'})

@auth_bp.route('/change-password', methods=['POST'])
@token_required
def change_password(current_user):
    data = request.get_json()

    if not all(k in data for k in ('old_password', 'new_password')):
        return jsonify({'message': 'Missing required fields'}), 400

    if not check_password_hash(current_user.password_hash, data['old_password']):
        return jsonify({'message': 'Invalid current password'}), 401

    current_user.password_hash = generate_password_hash(data['new_password'])
    db.session.commit()

    return jsonify({'message': 'Password changed successfully'})

@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    data = request.get_json()

    if 'email' not in data:
        return jsonify({'message': 'Email is required'}), 400

    user = User.query.filter_by(email=data['email']).first()
    if not user:
        return jsonify({'message': 'Email not found'}), 404

    # Generate OTP
    otp = ''.join([str(random.randint(0, 9)) for _ in range(6)])
    
    # Save OTP
    token = OTPToken(email=user.email, token=otp)
    db.session.add(token)
    db.session.commit()

    # In a real application, send this via email
    return jsonify({'message': 'Password reset instructions sent to email'})

@auth_bp.route('/reset-password', methods=['POST'])
def reset_password():
    data = request.get_json()

    if not all(k in data for k in ('email', 'token', 'new_password')):
        return jsonify({'message': 'Missing required fields'}), 400

    token = OTPToken.query.filter_by(
        email=data['email'],
        token=data['token']
    ).first()

    if not token:
        return jsonify({'message': 'Invalid or expired token'}), 400

    user = User.query.filter_by(email=data['email']).first()
    if not user:
        return jsonify({'message': 'User not found'}), 404

    user.password_hash = generate_password_hash(data['new_password'])
    db.session.delete(token)
    db.session.commit()

    return jsonify({'message': 'Password reset successfully'})

# --- Admin: List all users ---
@auth_bp.route('/admin/users', methods=['GET'])
@admin_required
def get_all_users():
    users = User.query.all()
    user_list = [
        {
            'id': user.id,
            'name': user.name,
            'email': user.email,
            'phone': user.phone,
            'is_admin': user.is_admin,
            'created_at': user.created_at.strftime('%Y-%m-%d %H:%M:%S') if user.created_at else None
        }
        for user in users
    ]
    return jsonify({'users': user_list}), 200

# --- Admin: Delete a user ---
@auth_bp.route('/admin/users/<int:user_id>', methods=['DELETE'])
@admin_required
def delete_user(user_id):
    from models import User, db
    user = User.query.get(user_id)
    if not user:
        return jsonify({'message': 'User not found'}), 404
    db.session.delete(user)
    db.session.commit()
    return jsonify({'message': 'User deleted'}), 200

# --- Admin: Toggle admin status ---
@auth_bp.route('/admin/users/<int:user_id>/toggle-admin', methods=['PATCH'])
@admin_required
def toggle_admin_status(user_id):
    from models import User, db
    user = User.query.get(user_id)
    if not user:
        return jsonify({'message': 'User not found'}), 404
    user.is_admin = not user.is_admin
    db.session.commit()
    return jsonify({'message': 'Admin status updated', 'is_admin': user.is_admin}), 200
