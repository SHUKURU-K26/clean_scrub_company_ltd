from datetime import date as date_type
from typing import List

from pydantic import BaseModel

from app.schemas.transaction import TransactionOut


class ReportSummary(BaseModel):
    transaction_count: int
    stock_in_count: int
    stock_out_count: int
    total_in_value: float
    total_out_value: float
    net_value: float


class ReportTrendPoint(BaseModel):
    date: date_type
    stock_in: float
    stock_out: float


class ReportResponse(BaseModel):
    summary: ReportSummary
    trend: List[ReportTrendPoint]
    transactions: List[TransactionOut]