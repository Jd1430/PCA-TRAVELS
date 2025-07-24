import random
import os
from flask_mail import Mail, Message
from flask import current_app

mail = Mail()

def generate_otp(length=6):
    return ''.join(random.choices("0123456789", k=length))

def send_otp(email, otp):
    # Check if we're in development mode (no email config)
    if not current_app.config.get('MAIL_USERNAME') or os.getenv('FLASK_ENV') == 'development':
        # Development mode: log OTP to console instead of sending email
        print(f"\n{'='*50}")
        print(f"📧 OTP SENT TO: {email}")
        print(f"🔑 OTP CODE: {otp}")
        print(f"⏰ Valid for 10 minutes")
        print(f"{'='*50}\n")
        return True
    
    # Production mode: send actual email
    try:
        msg = Message("Your OTP Code",
                      sender=current_app.config['MAIL_USERNAME'],
                      recipients=[email])
        msg.body = f"Your OTP is: {otp}"
        mail.send(msg)
        return True
    except Exception as e:
        print(f"Email sending failed: {e}")
        # Fallback to console logging
        print(f"\n{'='*50}")
        print(f"📧 OTP SENT TO: {email}")
        print(f"🔑 OTP CODE: {otp}")
        print(f"⏰ Valid for 10 minutes")
        print(f"{'='*50}\n")
        return True
