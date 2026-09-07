"""
Seed script — populates Products, Customers, and 30 days of Transaction
history with realistic demo data, mirroring the frontend's earlier mock
data. Deliberately does NOT create a user account — sign up for real
through /auth/signup so your OTP setup goes through the actual flow
instead of being bypassed here.

Run with: python -m app.seed
"""
import random
from datetime import datetime, timedelta

from app.database import SessionLocal
from app.models.product import Product
from app.models.customer import Customer
from app.models.transaction import Transaction

random.seed(42)

SUPPLIERS = ["KigaliClean Supplies", "EcoWash Distributors", "Rwanda Hygiene Co.", "PureLine Imports"]

PRODUCTS = [
    ("Industrial Mop Set", "MOP-001", "Mops & Brooms", "pcs", 8, 10, 8500),
    ("Push Broom Heavy Duty", "MOP-002", "Mops & Brooms", "pcs", 45, 15, 6200),
    ("Microfiber Cloth Pack (12)", "MOP-003", "Mops & Brooms", "pack", 120, 30, 4500),
    ("Multi-Surface Detergent 5L", "CHM-001", "Detergents & Chemicals", "jerrycan", 6, 20, 12000),
    ("Floor Bleach 5L", "CHM-002", "Detergents & Chemicals", "jerrycan", 34, 15, 9500),
    ("Glass Cleaner Spray 750ml", "CHM-003", "Detergents & Chemicals", "bottle", 58, 20, 3200),
    ("Toilet Disinfectant 1L", "CHM-004", "Detergents & Chemicals", "bottle", 12, 25, 4800),
    ("Disposable Gloves (Box 100)", "PPE-001", "PPE & Safety", "box", 90, 20, 15000),
    ("Face Masks (Box 50)", "PPE-002", "PPE & Safety", "box", 75, 20, 9000),
    ("Safety Goggles", "PPE-003", "PPE & Safety", "pcs", 15, 10, 3500),
    ("Industrial Vacuum Cleaner", "EQP-001", "Machines & Equipment", "unit", 4, 3, 185000),
    ("Floor Polisher Machine", "EQP-002", "Machines & Equipment", "unit", 2, 3, 420000),
    ("Pressure Washer", "EQP-003", "Machines & Equipment", "unit", 3, 2, 265000),
    ("Paper Towel Rolls (Pack 6)", "PPR-001", "Paper & Disposables", "pack", 200, 50, 6800),
    ("Toilet Paper Rolls (Pack 24)", "PPR-002", "Paper & Disposables", "pack", 15, 40, 11500),
    ("Garbage Bags Roll (50pcs)", "PPR-003", "Paper & Disposables", "roll", 88, 30, 3800),
    ("Air Freshener Spray", "AFR-001", "Air Fresheners", "bottle", 64, 25, 4200),
    ("Automatic Air Freshener Dispenser", "AFR-002", "Air Fresheners", "unit", 9, 5, 28000),
]

CUSTOMERS = [
    ("Alice Uwimana", "0788123456", "home"),
    ("Kigali Heights Offices", "0788234567", "office"),
    ("Serena Hotel Kigali", "0788345678", "hotel"),
    ("King Faisal Hospital", "0788456789", "hospital"),
    ("Jean Bosco Habimana", "0788567890", "home"),
    ("Norrsken House Kigali", "0788678901", "office"),
    ("Radisson Blu Hotel", "0788789012", "hotel"),
    ("Rwanda Military Hospital", "0788890123", "hospital"),
    ("Marie Claire Mukamana", "0788901234", "home"),
    ("BK Group Headquarters", "0789012345", "office"),
    ("Ubumwe Grande Hotel", "0789123456", "hotel"),
    ("CHUK Hospital", "0789234567", "hospital"),
]


def run():
    db = SessionLocal()
    try:
        if db.query(Product).count() > 0:
            print("Database already has products — skipping seed to avoid duplicates.")
            return

        products = []
        for name, sku, category, unit, qty, reorder, price in PRODUCTS:
            p = Product(name=name, sku=sku, category=category, unit=unit,
                        quantity=qty, reorder_level=reorder, unit_price=price)
            db.add(p)
            products.append(p)
        db.flush()

        customers = []
        for name, phone, ctype in CUSTOMERS:
            c = Customer(name=name, phone=phone, type=ctype)
            db.add(c)
            customers.append(c)
        db.flush()

        # Note: like the original frontend mock data, this transaction
        # history is randomly generated independent of each product's
        # static quantity above — it's demo activity, not a ledger that
        # reconciles to current stock. Fine for testing UI and reports.
        today = datetime.utcnow()
        for days_ago in range(29, -1, -1):
            day = today - timedelta(days=days_ago)
            for _ in range(random.randint(2, 5)):
                product = random.choice(products)
                tx_type = "out" if random.random() > 0.48 else "in"
                tx_date = day.replace(hour=random.randint(8, 17), minute=random.randint(0, 59))

                if tx_type == "in":
                    quantity = random.randint(5, 40)
                    db.add(Transaction(
                        type="in", product_id=product.id, quantity=quantity,
                        unit_price=product.unit_price, supplier=random.choice(SUPPLIERS), date=tx_date,
                    ))
                else:
                    quantity = random.randint(1, 12)
                    customer = random.choice(customers)
                    db.add(Transaction(
                        type="out", product_id=product.id, quantity=quantity, unit_price=product.unit_price,
                        customer_id=customer.id, customer_name=customer.name,
                        customer_phone=customer.phone, customer_type=customer.type, date=tx_date,
                    ))

        db.commit()
        print(f"Seeded {len(products)} products, {len(customers)} customers, and 30 days of transactions.")
    finally:
        db.close()


if __name__ == "__main__":
    run()