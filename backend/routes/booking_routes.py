from flask import Blueprint, jsonify, request
from models import db, Booking, Tour, TourDate, User
from routes.auth_routes import token_required, admin_required
from datetime import datetime

booking_bp = Blueprint('booking_bp', __name__)

@booking_bp.route('', methods=['GET'])
@booking_bp.route('/', methods=['GET'])
@token_required
def get_user_bookings(current_user):
    try:
        bookings = Booking.query.filter_by(user_id=current_user.id).all()
        return jsonify({
            'status': 'success',
            'bookings': [{
                'id': booking.id,
                'tour': {
                    'id': booking.tour.id,
                    'name': booking.tour.name,
                    'image_url': booking.tour.image_url,
                    'destination': booking.tour.destination.name
                },
                'departure_date': booking.tour_date.departure_date.isoformat(),
                'number_of_participants': booking.number_of_participants,
                'total_price': booking.total_price,
                'booking_status': booking.booking_status,
                'payment_status': booking.payment_status,
                'special_requests': booking.special_requests,
                'created_at': booking.created_at.isoformat()
            } for booking in bookings]
        }), 200
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@booking_bp.route('/<int:booking_id>', methods=['GET'])
@token_required
def get_booking(current_user, booking_id):
    try:
        booking = Booking.query.get_or_404(booking_id)
        
        # Check if the booking belongs to the current user or if user is admin
        if booking.user_id != current_user.id and not current_user.is_admin:
            return jsonify({'status': 'error', 'message': 'Unauthorized access'}), 403
        
        return jsonify({
            'status': 'success',
            'booking': {
                'id': booking.id,
                'tour': {
                    'id': booking.tour.id,
                    'name': booking.tour.name,
                    'description': booking.tour.description,
                    'image_url': booking.tour.image_url,
                    'destination': {
                        'name': booking.tour.destination.name,
                        'country': booking.tour.destination.country
                    },
                    'duration_days': booking.tour.duration_days,
                    'included_services': booking.tour.included_services
                },
                'departure_date': booking.tour_date.departure_date.isoformat(),
                'number_of_participants': booking.number_of_participants,
                'total_price': booking.total_price,
                'booking_status': booking.booking_status,
                'payment_status': booking.payment_status,
                'special_requests': booking.special_requests,
                'created_at': booking.created_at.isoformat()
            }
        }), 200
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@booking_bp.route('', methods=['POST'])
@booking_bp.route('/', methods=['POST'])
@token_required
def create_booking(current_user):
    try:
        data = request.get_json()
        
        # Validate tour date
        tour_date = TourDate.query.get_or_404(data['tour_date_id'])
        
        # Check if enough seats are available
        if tour_date.available_seats < data['number_of_participants']:
            return jsonify({
                'status': 'error',
                'message': f'Not enough seats available. Only {tour_date.available_seats} seats left'
            }), 400
        
        # Calculate total price
        total_price = tour_date.tour.price * tour_date.price_modifier * data['number_of_participants']
        
        # Create booking
        new_booking = Booking(
            user_id=current_user.id,
            tour_id=tour_date.tour_id,
            tour_date_id=tour_date.id,
            number_of_participants=data['number_of_participants'],
            total_price=total_price,
            special_requests=data.get('special_requests', '')
        )
        
        # Update available seats
        tour_date.available_seats -= data['number_of_participants']
        
        db.session.add(new_booking)
        db.session.commit()
        
        return jsonify({
            'status': 'success',
            'message': 'Booking created successfully',
            'booking_id': new_booking.id
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'status': 'error', 'message': str(e)}), 500

@booking_bp.route('/<int:booking_id>', methods=['PUT'])
@token_required
def update_booking(current_user, booking_id):
    try:
        booking = Booking.query.get_or_404(booking_id)
        
        # Check if the booking belongs to the current user or if user is admin
        if booking.user_id != current_user.id and not current_user.is_admin:
            return jsonify({'status': 'error', 'message': 'Unauthorized access'}), 403
        
        data = request.get_json()
        
        # Update allowed fields
        if 'special_requests' in data:
            booking.special_requests = data['special_requests']
        
        # Admin only updates
        if current_user.is_admin:
            if 'booking_status' in data:
                booking.booking_status = data['booking_status']
            if 'payment_status' in data:
                booking.payment_status = data['payment_status']
        
        db.session.commit()
        return jsonify({'status': 'success', 'message': 'Booking updated successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'status': 'error', 'message': str(e)}), 500

@booking_bp.route('/<int:booking_id>/cancel', methods=['POST'])
@token_required
def cancel_booking(current_user, booking_id):
    try:
        booking = Booking.query.get_or_404(booking_id)
        
        # Check if the booking belongs to the current user or if user is admin
        if booking.user_id != current_user.id and not current_user.is_admin:
            return jsonify({'status': 'error', 'message': 'Unauthorized access'}), 403
        
        # Check if booking can be cancelled
        if booking.booking_status == 'cancelled':
            return jsonify({'status': 'error', 'message': 'Booking is already cancelled'}), 400
        
        # Update booking status
        booking.booking_status = 'cancelled'
        
        # Return seats to available pool
        tour_date = booking.tour_date
        tour_date.available_seats += booking.number_of_participants
        
        db.session.commit()
        return jsonify({'status': 'success', 'message': 'Booking cancelled successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'status': 'error', 'message': str(e)}), 500

@booking_bp.route('/admin/bookings', methods=['GET'])
@admin_required
def get_all_bookings():
    try:
        bookings = Booking.query.all()
        return jsonify({
            'status': 'success',
            'bookings': [{
                'id': booking.id,
                'user': {
                    'id': booking.user.id,
                    'name': booking.user.name,
                    'email': booking.user.email
                },
                'tour': {
                    'id': booking.tour.id,
                    'name': booking.tour.name
                },
                'departure_date': booking.tour_date.departure_date.isoformat(),
                'number_of_participants': booking.number_of_participants,
                'total_price': booking.total_price,
                'booking_status': booking.booking_status,
                'payment_status': booking.payment_status,
                'created_at': booking.created_at.isoformat()
            } for booking in bookings]
        }), 200
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500 