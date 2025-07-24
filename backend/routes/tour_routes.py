from flask import Blueprint, jsonify, request
from models import db, Tour, Destination, TourDate, Booking, Review
from datetime import datetime
from routes.auth_routes import token_required, admin_required
import json

tour_bp = Blueprint('tour_bp', __name__)

@tour_bp.route('', methods=['GET'])
@tour_bp.route('/', methods=['GET'])
def get_tours():
    try:
        tours = Tour.query.all()
        return jsonify({
            'status': 'success',
            'tours': [{
                'id': tour.id,
                'name': tour.name,
                'description': tour.description,
                'destination': {
                    'id': tour.destination.id,
                    'name': tour.destination.name,
                    'country': tour.destination.country
                },
                'duration_days': tour.duration_days,
                'price': tour.price,
                'image_url': tour.image_url,
                'available_dates': [{
                    'id': date.id,
                    'departure_date': date.departure_date.isoformat(),
                    'available_seats': date.available_seats,
                    'price': tour.price * date.price_modifier
                } for date in tour.departure_dates if date.available_seats > 0]
            } for tour in tours]
        }), 200
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@tour_bp.route('/<int:tour_id>', methods=['GET'])
def get_tour(tour_id):
    try:
        tour = Tour.query.get_or_404(tour_id)
        reviews = [{
            'id': review.id,
            'rating': review.rating,
            'comment': review.comment,
            'user_name': review.user.name,
            'created_at': review.created_at.isoformat()
        } for review in tour.reviews]

        return jsonify({
            'status': 'success',
            'tour': {
                'id': tour.id,
                'name': tour.name,
                'description': tour.description,
                'destination': {
                    'id': tour.destination.id,
                    'name': tour.destination.name,
                    'country': tour.destination.country,
                    'state': tour.destination.state,
                    'city': tour.destination.city
                },
                'duration_days': tour.duration_days,
                'price': tour.price,
                'image_url': tour.image_url,
                'included_services': json.loads(tour.included_services) if tour.included_services else [],
                'itinerary': json.loads(tour.itinerary) if tour.itinerary else [],
                'max_participants': tour.max_participants,
                'available_dates': [{
                    'id': date.id,
                    'departure_date': date.departure_date.isoformat(),
                    'available_seats': date.available_seats,
                    'price': tour.price * date.price_modifier
                } for date in tour.departure_dates],
                'reviews': reviews,
                'average_rating': sum(r['rating'] for r in reviews) / len(reviews) if reviews else 0
            }
        }), 200
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@tour_bp.route('', methods=['POST'])
@tour_bp.route('/', methods=['POST'])
@admin_required
def create_tour():
    try:
        data = request.get_json()
        
        # Create new tour
        new_tour = Tour(
            name=data['name'],
            description=data['description'],
            destination_id=data['destination_id'],
            duration_days=data['duration_days'],
            price=data['price'],
            image_url=data.get('image_url'),
            included_services=json.dumps(data.get('included_services', [])),
            itinerary=json.dumps(data.get('itinerary', [])),
            max_participants=data.get('max_participants')
        )
        
        db.session.add(new_tour)
        
        # Add tour dates if provided
        if 'departure_dates' in data:
            for date_data in data['departure_dates']:
                tour_date = TourDate(
                    departure_date=datetime.fromisoformat(date_data['date']),
                    available_seats=date_data['available_seats'],
                    price_modifier=date_data.get('price_modifier', 1.0),
                    tour=new_tour
                )
                db.session.add(tour_date)
        
        db.session.commit()
        return jsonify({'status': 'success', 'message': 'Tour created successfully', 'tour_id': new_tour.id}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'status': 'error', 'message': str(e)}), 500

@tour_bp.route('/<int:tour_id>', methods=['PUT'])
@admin_required
def update_tour(tour_id):
    try:
        tour = Tour.query.get_or_404(tour_id)
        data = request.get_json()
        
        # Update tour details
        for key in ['name', 'description', 'destination_id', 'duration_days', 'price', 'image_url', 'max_participants']:
            if key in data:
                setattr(tour, key, data[key])
        
        if 'included_services' in data:
            tour.included_services = json.dumps(data['included_services'])
        if 'itinerary' in data:
            tour.itinerary = json.dumps(data['itinerary'])
        
        db.session.commit()
        return jsonify({'status': 'success', 'message': 'Tour updated successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'status': 'error', 'message': str(e)}), 500

@tour_bp.route('/<int:tour_id>', methods=['DELETE'])
@admin_required
def delete_tour(tour_id):
    try:
        tour = Tour.query.get_or_404(tour_id)
        db.session.delete(tour)
        db.session.commit()
        return jsonify({'status': 'success', 'message': 'Tour deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'status': 'error', 'message': str(e)}), 500

@tour_bp.route('/<int:tour_id>/reviews', methods=['POST'])
@token_required
def add_review(current_user, tour_id):
    try:
        data = request.get_json()
        
        # Check if user has booked this tour
        booking = Booking.query.filter_by(
            user_id=current_user.id,
            tour_id=tour_id,
            booking_status='confirmed'
        ).first()
        
        if not booking:
            return jsonify({'status': 'error', 'message': 'You must book and complete the tour before reviewing'}), 403
        
        # Check if user has already reviewed this tour
        existing_review = Review.query.filter_by(
            user_id=current_user.id,
            tour_id=tour_id
        ).first()
        
        if existing_review:
            return jsonify({'status': 'error', 'message': 'You have already reviewed this tour'}), 400
        
        new_review = Review(
            user_id=current_user.id,
            tour_id=tour_id,
            rating=data['rating'],
            comment=data.get('comment', '')
        )
        
        db.session.add(new_review)
        db.session.commit()
        
        return jsonify({'status': 'success', 'message': 'Review added successfully'}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'status': 'error', 'message': str(e)}), 500 