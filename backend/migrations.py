from app import app
from database import db
from models import User, Destination, Tour, TourDate, Booking, Review
from datetime import datetime, timedelta
from werkzeug.security import generate_password_hash
import json
from sqlalchemy import text
import os
from dotenv import load_dotenv
load_dotenv()

def init_db():
    with app.app_context():
        # Create tables
        db.create_all()

        # Create admin user
        admin = User(
            name='Admin User',
            email=os.environ.get('ADMIN_EMAIL', 'admin@sureshatravels.com'),
            password_hash=generate_password_hash(os.environ.get('ADMIN_PASSWORD', 'admin123')),
            is_admin=True
        )
        db.session.add(admin)

        # Create sample destinations
        destinations = [
            Destination(
                name='Taj Mahal',
                description='One of the seven wonders of the world, the Taj Mahal is a stunning symbol of eternal love.',
                country='India',
                state='Uttar Pradesh',
                city='Agra',
                image_url='https://source.unsplash.com/800x600/?taj-mahal'
            ),
            Destination(
                name='Mysore Palace',
                description='A historical palace and royal residence, known for its stunning architecture and rich history.',
                country='India',
                state='Karnataka',
                city='Mysore',
                image_url='https://source.unsplash.com/800x600/?mysore-palace'
            ),
            Destination(
                name='Kerala Backwaters',
                description='Serene waterways surrounded by lush greenery, perfect for houseboat cruises.',
                country='India',
                state='Kerala',
                city='Alleppey',
                image_url='https://source.unsplash.com/800x600/?kerala-backwaters'
            )
        ]
        
        for dest in destinations:
            db.session.add(dest)
        
        db.session.commit()

        # Create sample tours
        tours = [
            {
                'name': 'Taj Mahal Sunrise Tour',
                'description': 'Experience the majestic Taj Mahal at sunrise, followed by a guided tour of Agra Fort.',
                'destination_id': 1,
                'duration_days': 2,
                'price': 199.99,
                'included_services': json.dumps([
                    'Hotel accommodation',
                    'Breakfast and dinner',
                    'Professional guide',
                    'Transport',
                    'Entry tickets'
                ]),
                'itinerary': json.dumps([
                    'Day 1: Arrival in Agra, evening visit to local markets',
                    'Day 2: Sunrise Taj Mahal visit, Agra Fort tour, departure'
                ]),
                'max_participants': 15
            },
            {
                'name': 'Royal Mysore Experience',
                'description': 'Explore the grandeur of Mysore Palace and surrounding attractions.',
                'destination_id': 2,
                'duration_days': 3,
                'price': 299.99,
                'included_services': json.dumps([
                    'Luxury hotel stay',
                    'All meals',
                    'Guide services',
                    'Local transport',
                    'Cultural show tickets'
                ]),
                'itinerary': json.dumps([
                    'Day 1: Palace tour and light show',
                    'Day 2: Chamundi Hills and local crafts',
                    'Day 3: Brindavan Gardens and departure'
                ]),
                'max_participants': 20
            },
            {
                'name': 'Kerala Backwater Cruise',
                'description': 'Relax on a traditional houseboat while exploring the beautiful backwaters.',
                'destination_id': 3,
                'duration_days': 4,
                'price': 399.99,
                'included_services': json.dumps([
                    'Houseboat stay',
                    'All meals on board',
                    'Village visits',
                    'Cultural performances',
                    'Airport transfers'
                ]),
                'itinerary': json.dumps([
                    'Day 1: Arrival and houseboat check-in',
                    'Day 2: Backwater cruise and village visits',
                    'Day 3: Ayurvedic spa and cultural shows',
                    'Day 4: Morning cruise and departure'
                ]),
                'max_participants': 12
            }
        ]

        for tour_data in tours:
            tour = Tour(**tour_data)
            db.session.add(tour)
            
            # Add tour dates for next 3 months
            start_date = datetime.now() + timedelta(days=7)
            for i in range(6):  # 2 dates per month
                tour_date = TourDate(
                    tour=tour,
                    departure_date=start_date + timedelta(days=i*15),
                    available_seats=tour.max_participants,
                    price_modifier=1.0 if i % 2 == 0 else 1.2  # Peak season pricing
                )
                db.session.add(tour_date)
        
        db.session.commit()

def migrate_vehicle_booking_dates():
    from models import db, VehicleBooking
    from sqlalchemy import text
    # Add new columns if they don't exist
    try:
        db.session.execute(text('ALTER TABLE vehicle_booking ADD COLUMN from_date DATE'))
    except Exception:
        pass
    try:
        db.session.execute(text('ALTER TABLE vehicle_booking ADD COLUMN to_date DATE'))
    except Exception:
        pass
    try:
        db.session.execute(text('ALTER TABLE vehicle_booking ADD COLUMN time VARCHAR(20)'))
    except Exception:
        pass
    # The old 'date' column does not exist, so we skip copying data
        db.session.commit()

if __name__ == '__main__':
    with app.app_context():
        migrate_vehicle_booking_dates() 