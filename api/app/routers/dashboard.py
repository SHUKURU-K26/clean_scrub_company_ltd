from datetime import date, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.dependencies import get_db, get_current_user
from app.models.product import Product
from app.models.customer import Customer
from app.models.transaction import Transaction
from app.schemas.dashboard import (
    DashboardSummary, DashboardStats, TrendPoint,
    CategoryBreakdownItem, ClientTypeBreakdownItem, LowStockItem,
)
from app.services.serializers import serialize_transaction

router = APIRouter(prefix="/dashboard", tags=["dashboard"], dependencies=[Depends(get_current_user)])


def _pct_change(curr: float, prev: float) -> float:
    if prev == 0:
        return 100.0 if curr > 0 else 0.0
    return round(((curr - prev) / prev) * 100)


def _quantity_moved(db: Session, tx_type: str, on_date: date) -> int:
    total = db.query(func.coalesce(func.sum(Transaction.quantity), 0)).filter(
        Transaction.type == tx_type,
        func.date(Transaction.date) == on_date,
    ).scalar()
    return int(total)


@router.get("/summary", response_model=DashboardSummary)
def get_dashboard_summary(db: Session = Depends(get_db)):
    today = date.today()
    yesterday = today - timedelta(days=1)

    total_products = db.query(func.count(Product.id)).scalar()
    total_stock_value = float(db.query(func.coalesce(func.sum(Product.quantity * Product.cost_price), 0)).scalar())
    low_stock_count = db.query(func.count(Product.id)).filter(Product.quantity <= Product.reorder_level).scalar()
    total_customers = db.query(func.count(Customer.id)).scalar()

    today_in = _quantity_moved(db, "in", today)
    today_out = _quantity_moved(db, "out", today)
    yest_in = _quantity_moved(db, "in", yesterday)
    yest_out = _quantity_moved(db, "out", yesterday)

    stats = DashboardStats(
        total_products=total_products,
        total_stock_value=total_stock_value,
        low_stock_count=low_stock_count,
        total_customers=total_customers,
        today_stock_in=today_in,
        today_stock_out=today_out,
        stock_in_change=_pct_change(today_in, yest_in),
        stock_out_change=_pct_change(today_out, yest_out),
    )

    # Trend — last 30 days, zero-filled so the chart stays continuous
    # even on days with no recorded activity
    thirty_days_ago = today - timedelta(days=29)
    rows = db.query(
        func.date(Transaction.date).label("day"),
        Transaction.type,
        func.sum(Transaction.quantity).label("qty"),
    ).filter(func.date(Transaction.date) >= thirty_days_ago).group_by("day", Transaction.type).all()

    trend_map = {thirty_days_ago + timedelta(days=i): {"stock_in": 0, "stock_out": 0} for i in range(30)}
    for row in rows:
        if row.day in trend_map:
            trend_map[row.day]["stock_in" if row.type == "in" else "stock_out"] = int(row.qty)

    trend = [TrendPoint(date=d, **v) for d, v in sorted(trend_map.items())]

    category_rows = db.query(
        Product.category,
        func.coalesce(func.sum(Product.quantity * Product.cost_price), 0).label("value"),
    ).group_by(Product.category).order_by(func.sum(Product.quantity * Product.cost_price).desc()).all()
    category_breakdown = [CategoryBreakdownItem(name=r.category, value=float(r.value)) for r in category_rows]

    client_rows = db.query(
        Transaction.customer_type,
        func.coalesce(func.sum(Transaction.quantity), 0).label("value"),
    ).filter(Transaction.type == "out", Transaction.customer_type.isnot(None)).group_by(Transaction.customer_type).all()
    client_type_breakdown = [ClientTypeBreakdownItem(name=r.customer_type, value=int(r.value)) for r in client_rows]

    recent = db.query(Transaction).order_by(Transaction.date.desc()).limit(8).all()
    recent_transactions = [serialize_transaction(t) for t in recent]

    low_stock_products = db.query(Product).filter(Product.quantity <= Product.reorder_level).all()
    low_stock_products.sort(key=lambda p: (p.quantity / p.reorder_level) if p.reorder_level else 0)
    low_stock_items = [
        LowStockItem(id=str(p.id), name=p.name, quantity=p.quantity, reorder_level=p.reorder_level, unit=p.unit)
        for p in low_stock_products[:6]
    ]

    return DashboardSummary(
        stats=stats, trend=trend, category_breakdown=category_breakdown,
        client_type_breakdown=client_type_breakdown,
        recent_transactions=recent_transactions, low_stock_items=low_stock_items,
    )