from flask import Blueprint, jsonify, request
from models import db, Vehicle, VehicleBooking, User
from routes.auth_routes import token_required, admin_required
from datetime import datetime, date

vehicle_booking_bp = Blueprint('vehicle_booking_bp', __name__)

# User requests a booking
@vehicle_booking_bp.route('', methods=['POST'])
@vehicle_booking_bp.route('/', methods=['POST'])
@token_required
def request_vehicle_booking(current_user):
    data = request.get_json()
    vehicle_id = data['vehicle_id']
    from_date = datetime.strptime(data['from_date'], '%Y-%m-%d').date()
    to_date = data.get('to_date')
    if to_date:
        to_date = datetime.strptime(to_date, '%Y-%m-%d').date()
    else:
        to_date = from_date
    time = data.get('time')  # Only for single-day bookings
    from_place = data.get('from_place')
    to_place = data.get('to_place')
    travel_details = data.get('travel_details', '')
    if not from_place or not to_place:
        return jsonify({'status': 'error', 'message': 'From and To places are required'}), 400
    # Check for overlapping bookings
    overlap = VehicleBooking.query.filter(
        VehicleBooking.vehicle_id == vehicle_id,
        VehicleBooking.status == 'approved',
        VehicleBooking.from_date <= to_date,
        VehicleBooking.to_date >= from_date
    ).first()
    if overlap:
        return jsonify({'status': 'error', 'message': 'Vehicle already booked for these dates'}), 400
    booking = VehicleBooking(
        user_id=current_user.id,
        vehicle_id=vehicle_id,
        from_date=from_date,
        to_date=to_date,
        time=time,
        status='pending',
        from_place=from_place,
        to_place=to_place,
        travel_details=travel_details
    )
    db.session.add(booking)
    db.session.commit()
    return jsonify({'status': 'success', 'message': 'Booking request sent', 'booking_id': booking.id}), 201

# User: see own bookings; Admin: see all
@vehicle_booking_bp.route('', methods=['GET'])
@vehicle_booking_bp.route('/', methods=['GET'])
@token_required
def get_vehicle_bookings(current_user):
    if current_user.is_admin:
        bookings = VehicleBooking.query.all()
    else:
        bookings = VehicleBooking.query.filter_by(user_id=current_user.id).all()
    return jsonify({
        'bookings': [
            {
                'id': b.id,
                'user': {'id': b.user.id, 'name': b.user.name, 'email': b.user.email},
                'vehicle': {'id': b.vehicle.id, 'name': b.vehicle.name, 'type': b.vehicle.type},
                'from_date': b.from_date.isoformat() if b.from_date else None,
                'to_date': b.to_date.isoformat() if b.to_date else None,
                'time': b.time,
                'status': b.status,
                'from_place': b.from_place,
                'to_place': b.to_place,
                'travel_details': b.travel_details,
                'created_at': b.created_at.isoformat()
            } for b in bookings
        ]
    })

# Admin or user can update booking (admin: status, user: date)
@vehicle_booking_bp.route('/<int:booking_id>', methods=['PATCH'])
@token_required
def update_vehicle_booking(current_user, booking_id):
    data = request.get_json()
    booking = VehicleBooking.query.get_or_404(booking_id)

    # Admin can approve/reject/cancel and update dates/times
    if current_user.is_admin:
        updated = False
        if 'status' in data and data['status'] in ['approved', 'rejected', 'cancelled']:
            booking.status = data['status']
            updated = True
        if 'from_date' in data:
            try:
                booking.from_date = datetime.strptime(data['from_date'], '%Y-%m-%d').date()
                updated = True
            except Exception as e:
                return jsonify({'status': 'error', 'message': str(e)}), 400
        if 'to_date' in data:
            try:
                booking.to_date = datetime.strptime(data['to_date'], '%Y-%m-%d').date()
                updated = True
            except Exception as e:
                return jsonify({'status': 'error', 'message': str(e)}), 400
        if 'time' in data:
            booking.time = data['time']
            updated = True
        if updated:
            db.session.commit()
            return jsonify({'status': 'success', 'message': 'Booking updated by admin'}), 200
        return jsonify({'status': 'error', 'message': 'No valid fields to update'}), 400

    # User can only update their own booking's dates/times or cancel
    if booking.user_id != current_user.id:
        return jsonify({'status': 'error', 'message': 'Unauthorized'}), 403
    updated = False
    if 'from_date' in data:
        try:
            booking.from_date = datetime.strptime(data['from_date'], '%Y-%m-%d').date()
            updated = True
        except Exception as e:
            return jsonify({'status': 'error', 'message': str(e)}), 400
    if 'to_date' in data:
        try:
            booking.to_date = datetime.strptime(data['to_date'], '%Y-%m-%d').date()
            updated = True
        except Exception as e:
            return jsonify({'status': 'error', 'message': str(e)}), 400
    if 'time' in data:
        booking.time = data['time']
        updated = True
    if updated:
        booking.status = 'pending'  # Set status to pending on reschedule
        db.session.commit()
        return jsonify({'status': 'success', 'message': 'Booking updated. Please wait for approval.'}), 200
    if 'status' in data and data['status'] == 'cancelled':
        booking.status = 'cancelled'
        db.session.commit()
        return jsonify({'status': 'success', 'message': 'Booking cancelled.'}), 200
    return jsonify({'status': 'error', 'message': 'Only dates, time, or cancellation can be updated by user.'}), 400 