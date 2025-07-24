from datetime import datetime
from database import db

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    phone = db.Column(db.String(20))
    address = db.Column(db.String(200))
    is_admin = db.Column(db.Boolean, default=False)
    bookings = db.relationship('Booking', backref='user', lazy=True)
    reviews = db.relationship('Review', backref='user', lazy=True)
    vehicle_bookings = db.relationship('VehicleBooking', backref='user', lazy=True)

class OTPToken(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), nullable=False)
    token = db.Column(db.String(6), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Destination(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    description = db.Column(db.Text)
    image_url = db.Column(db.String(500))
    country = db.Column(db.String(100), nullable=False)
    state = db.Column(db.String(100))
    city = db.Column(db.String(100))
    tours = db.relationship('Tour', backref='destination', lazy=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Tour(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    destination_id = db.Column(db.Integer, db.ForeignKey('destination.id'), nullable=False)
    duration_days = db.Column(db.Integer, nullable=False)
    price = db.Column(db.Float, nullable=False)
    image_url = db.Column(db.String(500))
    included_services = db.Column(db.Text)  # Stored as JSON string
    itinerary = db.Column(db.Text)  # Stored as JSON string
    max_participants = db.Column(db.Integer)
    bookings = db.relationship('Booking', backref='tour', lazy=True)
    reviews = db.relationship('Review', backref='tour', lazy=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    departure_dates = db.relationship('TourDate', backref='tour', lazy=True)

class TourDate(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    tour_id = db.Column(db.Integer, db.ForeignKey('tour.id'), nullable=False)
    departure_date = db.Column(db.DateTime, nullable=False)
    available_seats = db.Column(db.Integer, nullable=False)
    price_modifier = db.Column(db.Float, default=1.0)  # For seasonal pricing
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Booking(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    tour_id = db.Column(db.Integer, db.ForeignKey('tour.id'), nullable=False)
    tour_date_id = db.Column(db.Integer, db.ForeignKey('tour_date.id'), nullable=False)
    number_of_participants = db.Column(db.Integer, nullable=False)
    total_price = db.Column(db.Float, nullable=False)
    booking_status = db.Column(db.String(20), default='pending')  # pending, confirmed, cancelled
    payment_status = db.Column(db.String(20), default='pending')  # pending, paid, refunded
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    special_requests = db.Column(db.Text)
    tour_date = db.relationship('TourDate', backref='bookings', lazy=True)

class Review(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    tour_id = db.Column(db.Integer, db.ForeignKey('tour.id'), nullable=False)
    rating = db.Column(db.Integer, nullable=False)  # 1-5 stars
    comment = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, onupdate=datetime.utcnow)

# --- Vehicle Booking System ---
class Vehicle(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    type = db.Column(db.String(50), nullable=False)  # e.g., car, bus
    description = db.Column(db.Text)
    image_url = db.Column(db.String(500))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    bookings = db.relationship('VehicleBooking', backref='vehicle', lazy=True, cascade="all, delete-orphan")

class VehicleBooking(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    vehicle_id = db.Column(db.Integer, db.ForeignKey('vehicle.id', ondelete='CASCADE'), nullable=False)
    # Deprecated: date = db.Column(db.Date, nullable=False)
    from_date = db.Column(db.Date, nullable=False)
    to_date = db.Column(db.Date, nullable=True)  # If null or same as from_date, it's a single-day booking
    time = db.Column(db.String(20), nullable=True)  # For single-day bookings (e.g., '10:00', '14:30')
    status = db.Column(db.String(20), default='pending')  # pending, approved, rejected
    from_place = db.Column(db.String(120), nullable=False)
    to_place = db.Column(db.String(120), nullable=False)
    travel_details = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
