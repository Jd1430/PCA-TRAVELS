import os
import unittest
from app import app
from database import db
from models import User, Destination, Tour, TourDate, Booking, Review
from datetime import datetime, timedelta
import json
from werkzeug.security import generate_password_hash

class TestBackend(unittest.TestCase):
    def setUp(self):
        # Configure test database
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///instance/test.db'
        app.config['TESTING'] = True
        self.client = app.test_client()

        with app.app_context():
            # Create test database and tables
            if not os.path.exists('instance'):
                os.makedirs('instance')
            db.create_all()

            # Create test admin user
            admin = User(
                name='Test Admin',
                email='admin@test.com',
                password_hash=generate_password_hash('test123'),
                is_admin=True
            )
            db.session.add(admin)
            db.session.commit()

    def tearDown(self):
        with app.app_context():
            db.session.remove()
            db.drop_all()

    def test_register_user(self):
        response = self.client.post('/api/auth/register', json={
            'name': 'Test User',
            'email': 'test@test.com',
            'password': 'test123'
        })
        self.assertEqual(response.status_code, 201)
        self.assertIn('success', response.json['message'].lower())

    def test_login_user(self):
        # First register a user
        self.client.post('/api/auth/register', json={
            'name': 'Test User',
            'email': 'test@test.com',
            'password': 'test123'
        })

        # Then try to login
        response = self.client.post('/api/auth/login', json={
            'email': 'test@test.com',
            'password': 'test123'
        })
        self.assertEqual(response.status_code, 200)
        self.assertIn('token', response.json)

    def test_create_destination(self):
        # Login as admin
        login_response = self.client.post('/api/auth/login', json={
            'email': 'admin@test.com',
            'password': 'test123'
        })
        token = login_response.json['token']

        # Create destination
        response = self.client.post(
            '/api/destinations',
            json={
                'name': 'Test Destination',
                'description': 'A test destination',
                'country': 'Test Country',
                'state': 'Test State',
                'city': 'Test City'
            },
            headers={'Authorization': f'Bearer {token}'}
        )
        self.assertEqual(response.status_code, 201)
        self.assertIn('success', response.json['message'].lower())

    def test_create_tour(self):
        # Login as admin
        login_response = self.client.post('/api/auth/login', json={
            'email': 'admin@test.com',
            'password': 'test123'
        })
        token = login_response.json['token']

        # Create destination first
        dest_response = self.client.post(
            '/api/destinations',
            json={
                'name': 'Test Destination',
                'description': 'A test destination',
                'country': 'Test Country',
                'state': 'Test State',
                'city': 'Test City'
            },
            headers={'Authorization': f'Bearer {token}'}
        )
        destination_id = dest_response.json['destination_id']

        # Create tour
        response = self.client.post(
            '/api/tours',
            json={
                'name': 'Test Tour',
                'description': 'A test tour',
                'destination_id': destination_id,
                'duration_days': 5,
                'price': 999.99,
                'included_services': ['Service 1', 'Service 2'],
                'itinerary': ['Day 1: Test', 'Day 2: Test'],
                'max_participants': 20,
                'departure_dates': [
                    {
                        'date': (datetime.now() + timedelta(days=30)).isoformat(),
                        'available_seats': 20
                    }
                ]
            },
            headers={'Authorization': f'Bearer {token}'}
        )
        self.assertEqual(response.status_code, 201)
        self.assertIn('success', response.json['message'].lower())

    def test_create_booking(self):
        # Create user and get token
        self.client.post('/api/auth/register', json={
            'name': 'Test User',
            'email': 'test@test.com',
            'password': 'test123'
        })
        login_response = self.client.post('/api/auth/login', json={
            'email': 'test@test.com',
            'password': 'test123'
        })
        token = login_response.json['token']

        # Create destination and tour (using admin token)
        admin_login = self.client.post('/api/auth/login', json={
            'email': 'admin@test.com',
            'password': 'test123'
        })
        admin_token = admin_login.json['token']

        # Create destination
        dest_response = self.client.post(
            '/api/destinations',
            json={
                'name': 'Test Destination',
                'description': 'A test destination',
                'country': 'Test Country'
            },
            headers={'Authorization': f'Bearer {admin_token}'}
        )
        destination_id = dest_response.json['destination_id']

        # Create tour
        tour_response = self.client.post(
            '/api/tours',
            json={
                'name': 'Test Tour',
                'description': 'A test tour',
                'destination_id': destination_id,
                'duration_days': 5,
                'price': 999.99,
                'max_participants': 20,
                'departure_dates': [
                    {
                        'date': (datetime.now() + timedelta(days=30)).isoformat(),
                        'available_seats': 20
                    }
                ]
            },
            headers={'Authorization': f'Bearer {admin_token}'}
        )
        tour_id = tour_response.json['tour_id']

        # Get tour dates
        tour_detail = self.client.get(f'/api/tours/{tour_id}').json
        tour_date_id = tour_detail['tour']['available_dates'][0]['id']

        # Create booking
        response = self.client.post(
            '/api/bookings',
            json={
                'tour_date_id': tour_date_id,
                'number_of_participants': 2
            },
            headers={'Authorization': f'Bearer {token}'}
        )
        self.assertEqual(response.status_code, 201)
        self.assertIn('success', response.json['message'].lower())

if __name__ == '__main__':
    unittest.main() 