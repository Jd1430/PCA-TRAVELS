from flask import Blueprint, jsonify, request
from models import db, Vehicle, VehicleBooking, User
from routes.auth_routes import token_required, admin_required
from datetime import datetime, date

vehicle_bp = Blueprint('vehicle_bp', __name__)

# --- Vehicle CRUD (Admin Only) ---
@vehicle_bp.route('', methods=['GET'])
@vehicle_bp.route('/', methods=['GET'])
def get_vehicles():
    vehicles = Vehicle.query.all()
    return jsonify({
        'vehicles': [
            {
                'id': v.id,
                'name': v.name,
                'type': v.type,
                'description': v.description,
                'image_url': v.image_url,
                'created_at': v.created_at.isoformat()
            } for v in vehicles
        ]
    })

@vehicle_bp.route('/<int:vehicle_id>', methods=['GET'])
def get_vehicle(vehicle_id):
    v = Vehicle.query.get_or_404(vehicle_id)
    return jsonify({
        'vehicle': {
            'id': v.id,
            'name': v.name,
            'type': v.type,
            'description': v.description,
            'image_url': v.image_url,
            'created_at': v.created_at.isoformat()
        }
    })

@vehicle_bp.route('', methods=['POST'])
@vehicle_bp.route('/', methods=['POST'])
@admin_required
def create_vehicle():
    data = request.get_json()
    v = Vehicle(
        name=data['name'],
        type=data['type'],
        description=data.get('description'),
        image_url=data.get('image_url')
    )
    db.session.add(v)
    db.session.commit()
    return jsonify({'message': 'Vehicle added', 'vehicle_id': v.id}), 201

@vehicle_bp.route('/<int:vehicle_id>', methods=['PUT'])
@admin_required
def update_vehicle(vehicle_id):
    v = Vehicle.query.get_or_404(vehicle_id)
    data = request.get_json()
    for key in ['name', 'type', 'description', 'image_url']:
        if key in data:
            setattr(v, key, data[key])
    db.session.commit()
    return jsonify({'message': 'Vehicle updated'})

@vehicle_bp.route('/<int:vehicle_id>', methods=['DELETE'])
@admin_required
def delete_vehicle(vehicle_id):
    v = Vehicle.query.get_or_404(vehicle_id)
    db.session.delete(v)
    db.session.commit()
    return jsonify({'message': 'Vehicle deleted'})

# --- Vehicle Calendar ---
@vehicle_bp.route('/<int:vehicle_id>/calendar', methods=['GET'])
def vehicle_calendar(vehicle_id):
    bookings = VehicleBooking.query.filter_by(vehicle_id=vehicle_id, status='approved').all()
    booked_dates = [b.date.isoformat() for b in bookings]
    return jsonify({'booked_dates': booked_dates}) 