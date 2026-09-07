from datetime import date as date_type
from typing import List

from pydantic import BaseModel

from app.schemas.transaction import TransactionOut


class DashboardStats(BaseModel):
    total_products: int
    total_stock_value: float
    low_stock_count: int
    total_customers: int
    today_stock_in: int
    today_stock_out: int
    stock_in_change: float
    stock_out_change: float


class TrendPoint(BaseModel):
    date: date_type
    stock_in: int
    stock_out: int


class CategoryBreakdownItem(BaseModel):
    name: str
    value: float


class ClientTypeBreakdownItem(BaseModel):
    name: str
    value: int


class LowStockItem(BaseModel):
    id: str
    name: str
    quantity: int
    reorder_level: int
    unit: str


class DashboardSummary(BaseModel):
    stats: DashboardStats
    trend: List[TrendPoint]
    category_breakdown: List[CategoryBreakdownItem]
    client_type_breakdown: List[ClientTypeBreakdownItem]
    recent_transactions: List[TransactionOut]
    low_stock_items: List[LowStockItem]