from flask import Blueprint, jsonify, request
from models import db, Destination, Tour
from routes.auth_routes import admin_required

destination_bp = Blueprint('destination_bp', __name__)

@destination_bp.route('', methods=['GET'])
@destination_bp.route('/', methods=['GET'])
def get_destinations():
    try:
        destinations = Destination.query.all()
        return jsonify({
            'status': 'success',
            'destinations': [{
                'id': dest.id,
                'name': dest.name,
                'description': dest.description,
                'image_url': dest.image_url,
                'country': dest.country,
                'state': dest.state,
                'city': dest.city,
                'tour_count': len(dest.tours)
            } for dest in destinations]
        }), 200
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@destination_bp.route('/<int:destination_id>', methods=['GET'])
def get_destination(destination_id):
    try:
        destination = Destination.query.get_or_404(destination_id)
        tours = [{
            'id': tour.id,
            'name': tour.name,
            'duration_days': tour.duration_days,
            'price': tour.price,
            'image_url': tour.image_url,
            'available_dates_count': len([date for date in tour.departure_dates if date.available_seats > 0])
        } for tour in destination.tours]

        return jsonify({
            'status': 'success',
            'destination': {
                'id': destination.id,
                'name': destination.name,
                'description': destination.description,
                'image_url': destination.image_url,
                'country': destination.country,
                'state': destination.state,
                'city': destination.city,
                'tours': tours
            }
        }), 200
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@destination_bp.route('', methods=['POST'])
@destination_bp.route('/', methods=['POST'])
@admin_required
def create_destination():
    try:
        data = request.get_json()
        
        new_destination = Destination(
            name=data['name'],
            description=data['description'],
            image_url=data.get('image_url'),
            country=data['country'],
            state=data.get('state'),
            city=data.get('city')
        )
        
        db.session.add(new_destination)
        db.session.commit()
        
        return jsonify({
            'status': 'success',
            'message': 'Destination created successfully',
            'destination_id': new_destination.id
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'status': 'error', 'message': str(e)}), 500

@destination_bp.route('/<int:destination_id>', methods=['PUT'])
@admin_required
def update_destination(destination_id):
    try:
        destination = Destination.query.get_or_404(destination_id)
        data = request.get_json()
        
        # Update fields
        for key in ['name', 'description', 'image_url', 'country', 'state', 'city']:
            if key in data:
                setattr(destination, key, data[key])
        
        db.session.commit()
        return jsonify({'status': 'success', 'message': 'Destination updated successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'status': 'error', 'message': str(e)}), 500

@destination_bp.route('/<int:destination_id>', methods=['DELETE'])
@admin_required
def delete_destination(destination_id):
    try:
        destination = Destination.query.get_or_404(destination_id)
        
        # Check if destination has any tours
        if destination.tours:
            return jsonify({
                'status': 'error',
                'message': 'Cannot delete destination with existing tours. Delete the tours first.'
            }), 400
        
        db.session.delete(destination)
        db.session.commit()
        return jsonify({'status': 'success', 'message': 'Destination deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'status': 'error', 'message': str(e)}), 500

@destination_bp.route('/search', methods=['GET'])
def search_destinations():
    try:
        query = request.args.get('q', '').lower()
        country = request.args.get('country')
        
        # Base query
        destinations = Destination.query
        
        # Apply filters
        if query:
            destinations = destinations.filter(
                (db.func.lower(Destination.name).contains(query)) |
                (db.func.lower(Destination.description).contains(query)) |
                (db.func.lower(Destination.city).contains(query))
            )
        
        if country:
            destinations = destinations.filter(Destination.country == country)
        
        # Execute query
        results = destinations.all()
        
        return jsonify({
            'status': 'success',
            'destinations': [{
                'id': dest.id,
                'name': dest.name,
                'description': dest.description,
                'image_url': dest.image_url,
                'country': dest.country,
                'state': dest.state,
                'city': dest.city,
                'tour_count': len(dest.tours)
            } for dest in results]
        }), 200
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500 