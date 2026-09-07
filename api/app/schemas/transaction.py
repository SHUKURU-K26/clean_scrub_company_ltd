import uuid
from datetime import date, datetime
from typing import Optional, List

from pydantic import BaseModel, Field


class StockInCreate(BaseModel):
    product_id: uuid.UUID
    quantity: int = Field(gt=0)
    supplier: str = Field(min_length=2)
    date: date


class StockOutCreate(BaseModel):
    product_id: uuid.UUID
    quantity: int = Field(gt=0)
    date: date

    # Either provide customer_id (existing customer) OR all three of the
    # fields below (creates a new customer) — validated in the router since
    # it's a cross-field rule, not a single-field one
    customer_id: Optional[uuid.UUID] = None
    customer_name: Optional[str] = None
    customer_phone: Optional[str] = None
    customer_type: Optional[str] = None


class TransactionOut(BaseModel):
    id: uuid.UUID
    type: str
    product_id: uuid.UUID
    product_name: str
    category: str
    quantity: int
    unit_price: float
    cost_price_at_sale: Optional[float] = None
    supplier: Optional[str] = None
    customer_id: Optional[uuid.UUID] = None
    customer_name: Optional[str] = None
    customer_phone: Optional[str] = None
    customer_type: Optional[str] = None
    date: datetime
    created_at: datetime


class BulkDeleteRequest(BaseModel):
    ids: List[uuid.UUID]