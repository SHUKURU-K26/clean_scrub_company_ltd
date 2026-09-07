import uuid
from datetime import datetime

from sqlalchemy import Column, String, Integer, Numeric, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.database import Base


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    type = Column(String, nullable=False)  # 'in' | 'out'

    product_id = Column(UUID(as_uuid=True), ForeignKey("products.id"), nullable=False)
    quantity = Column(Integer, nullable=False)

    # For 'in': snapshot of cost_price (money spent restocking).
    # For 'out': snapshot of selling_price (revenue charged to the customer).
    unit_price = Column(Numeric(12, 2), nullable=False)

    # Only populated for 'out' — the cost snapshot at the moment of sale,
    # so profit (unit_price - cost_price_at_sale) reflects the real margin
    # at that time, even if the product's cost price changes later
    cost_price_at_sale = Column(Numeric(12, 2), nullable=True)

    supplier = Column(String, nullable=True)

    customer_id = Column(UUID(as_uuid=True), ForeignKey("customers.id"), nullable=True)
    customer_name = Column(String, nullable=True)
    customer_phone = Column(String, nullable=True)
    customer_type = Column(String, nullable=True)

    date = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    product = relationship("Product", backref="transactions")
    customer = relationship("Customer", backref="transactions")