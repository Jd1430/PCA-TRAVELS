from flask import Flask
from flask_cors import CORS
from database import db
from routes.auth_routes import auth_bp
from routes.database_routes import database_bp
from routes.tour_routes import tour_bp
from routes.booking_routes import booking_bp
from routes.destination_routes import destination_bp
from routes.vehicle_routes import vehicle_bp
from routes.vehicle_booking_routes import vehicle_booking_bp
import os
from sqlalchemy import event
from sqlalchemy.engine import Engine

app = Flask(__name__)
CORS(app)

# Ensure instance directory exists
instance_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'instance')
if not os.path.exists(instance_path):
    os.makedirs(instance_path)

# Database configuration
db_path = os.path.join(instance_path, 'auth.db')
app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{db_path}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'your-secret-key-here')

# Initialize extensions
db.init_app(app)

# Register blueprints
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(database_bp, url_prefix='/api/database')
app.register_blueprint(tour_bp, url_prefix='/api/tours')
app.register_blueprint(booking_bp, url_prefix='/api/bookings')
app.register_blueprint(destination_bp, url_prefix='/api/destinations')
app.register_blueprint(vehicle_bp, url_prefix='/api/vehicles')
app.register_blueprint(vehicle_booking_bp, url_prefix='/api/vehicle-bookings')

@event.listens_for(Engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record):
    cursor = dbapi_connection.cursor()
    cursor.execute("PRAGMA foreign_keys=ON")
    cursor.close()

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)
