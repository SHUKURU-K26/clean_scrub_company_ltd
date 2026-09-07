from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.dependencies import get_db, get_current_user
from app.models.product import Product
from app.models.transaction import Transaction
from app.schemas.report import ReportResponse, ReportSummary, ReportTrendPoint
from app.services.serializers import serialize_transaction

router = APIRouter(prefix="/reports", tags=["reports"], dependencies=[Depends(get_current_user)])


@router.get("", response_model=ReportResponse)
def get_report(
    type: Optional[str] = None,
    search: Optional[str] = None,
    category: Optional[str] = None,
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
    min_amount: Optional[float] = None,
    max_amount: Optional[float] = None,
    db: Session = Depends(get_db),
):
    query = db.query(Transaction).join(Product)

    if type and type != "all":
        query = query.filter(Transaction.type == type)
    if category:
        query = query.filter(Product.category == category)
    if search:
        like = f"%{search}%"
        query = query.filter(or_(Product.name.ilike(like), Transaction.supplier.ilike(like), Transaction.customer_name.ilike(like)))
    if date_from:
        query = query.filter(Transaction.date >= date_from)
    if date_to:
        query = query.filter(Transaction.date <= date_to)

    transactions = query.order_by(Transaction.date.desc()).all()

    if min_amount is not None:
        transactions = [t for t in transactions if float(t.quantity * t.unit_price) >= min_amount]
    if max_amount is not None:
        transactions = [t for t in transactions if float(t.quantity * t.unit_price) <= max_amount]

    stock_in = [t for t in transactions if t.type == "in"]
    stock_out = [t for t in transactions if t.type == "out"]
    total_in_value = sum(float(t.quantity * t.unit_price) for t in stock_in)
    total_out_value = sum(float(t.quantity * t.unit_price) for t in stock_out)

    summary = ReportSummary(
        transaction_count=len(transactions), stock_in_count=len(stock_in), stock_out_count=len(stock_out),
        total_in_value=total_in_value, total_out_value=total_out_value, net_value=total_in_value - total_out_value,
    )

    trend_map = {}
    for t in transactions:
        d = t.date.date() if hasattr(t.date, "date") else t.date
        if d not in trend_map:
            trend_map[d] = {"stock_in": 0.0, "stock_out": 0.0}
        value = float(t.quantity * t.unit_price)
        trend_map[d]["stock_in" if t.type == "in" else "stock_out"] += value

    trend = [ReportTrendPoint(date=d, **v) for d, v in sorted(trend_map.items())]

    return ReportResponse(summary=summary, trend=trend, transactions=[serialize_transaction(t) for t in transactions])