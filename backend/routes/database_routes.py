from flask import Blueprint, jsonify
from models import db

database_bp = Blueprint('database_bp', __name__)

@database_bp.route('/info', methods=['GET'])
def get_database_info():
    try:
        # Get database statistics
        user_count = db.session.execute('SELECT COUNT(*) FROM user').scalar()
        tour_count = db.session.execute('SELECT COUNT(*) FROM tour').scalar()
        booking_count = db.session.execute('SELECT COUNT(*) FROM booking').scalar()
        destination_count = db.session.execute('SELECT COUNT(*) FROM destination').scalar()

        return jsonify({
            'status': 'success',
            'database_name': 'auth.db',
            'database_type': 'SQLite',
            'last_updated': None,  # You can add this if needed
            'statistics': {
                'total_users': user_count,
                'total_tours': tour_count,
                'total_bookings': booking_count,
                'total_destinations': destination_count
            }
        }), 200
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500 