import uuid
from datetime import date
from typing import Optional, List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, func

from app.dependencies import get_db, get_current_user
from app.models.product import Product
from app.models.customer import Customer
from app.models.transaction import Transaction
from app.schemas.transaction import StockInCreate, StockOutCreate, TransactionOut, BulkDeleteRequest
from app.services.serializers import serialize_transaction


router = APIRouter(prefix="/transactions", tags=["transactions"], dependencies=[Depends(get_current_user)])


def _resolve_customer(db: Session, payload: StockOutCreate) -> Customer:
    if payload.customer_id:
        customer = db.query(Customer).filter(Customer.id == payload.customer_id).first()
        if not customer:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found")
        return customer

    if not (payload.customer_name and payload.customer_phone and payload.customer_type):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Provide customer_id, or customer_name + customer_phone + customer_type for a new customer",
        )

    customer = Customer(name=payload.customer_name, phone=payload.customer_phone, type=payload.customer_type)
    db.add(customer)
    db.flush()
    return customer


@router.get("", response_model=List[TransactionOut])
def list_transactions(
    type: Optional[str] = None,
    search: Optional[str] = None,
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
    min_amount: Optional[float] = None,
    max_amount: Optional[float] = None,
    db: Session = Depends(get_db),
):
    query = db.query(Transaction).join(Product)

    if type:
        query = query.filter(Transaction.type == type)
    if search:
        like = f"%{search}%"
        query = query.filter(or_(Product.name.ilike(like), Transaction.supplier.ilike(like), Transaction.customer_name.ilike(like)))
    if date_from:
        query = query.filter(Transaction.date >= date_from)
    if date_to:
        query = query.filter(Transaction.date <= date_to)

    results = query.order_by(Transaction.date.desc()).all()

    if min_amount is not None:
        results = [t for t in results if float(t.quantity * t.unit_price) >= min_amount]
    if max_amount is not None:
        results = [t for t in results if float(t.quantity * t.unit_price) <= max_amount]

    return [serialize_transaction(t) for t in results]


@router.get("/suppliers", response_model=List[str])
def list_suppliers(db: Session = Depends(get_db)):
    # Suppliers aren't a separate table — they're just the distinct names
    # already sitting on past Stock In entries. Ordered by most recently
    # used first, so likely matches surface quickest while typing.
    rows = (
        db.query(Transaction.supplier, func.max(Transaction.date).label("last_used"))
        .filter(Transaction.type == "in", Transaction.supplier.isnot(None))
        .group_by(Transaction.supplier)
        .order_by(func.max(Transaction.date).desc())
        .all()
    )
    return [r.supplier for r in rows]


@router.get("/{tx_id}", response_model=TransactionOut)
def get_transaction(tx_id: uuid.UUID, db: Session = Depends(get_db)):
    tx = db.query(Transaction).filter(Transaction.id == tx_id).first()
    if not tx:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Entry not found")
    return serialize_transaction(tx)


@router.post("/stock-in", response_model=TransactionOut, status_code=status.HTTP_201_CREATED)
def create_stock_in(payload: StockInCreate, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == payload.product_id).first()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    product.quantity += payload.quantity

    tx = Transaction(
        type="in", product_id=product.id, quantity=payload.quantity,
        unit_price=product.cost_price, supplier=payload.supplier, date=payload.date,
    )
    db.add(tx)
    db.commit()
    db.refresh(tx)
    return serialize_transaction(tx)


@router.post("/stock-out", response_model=TransactionOut, status_code=status.HTTP_201_CREATED)
def create_stock_out(payload: StockOutCreate, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == payload.product_id).first()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    if payload.quantity > product.quantity:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Only {product.quantity} {product.unit} available")

    customer = _resolve_customer(db, payload)
    product.quantity -= payload.quantity

    tx = Transaction(
        type="out", product_id=product.id, quantity=payload.quantity,
        unit_price=product.selling_price, cost_price_at_sale=product.cost_price,
        customer_id=customer.id, customer_name=customer.name, customer_phone=customer.phone,
        customer_type=customer.type, date=payload.date,
    )
    db.add(tx)
    db.commit()
    db.refresh(tx)
    return serialize_transaction(tx)


@router.put("/stock-in/{tx_id}", response_model=TransactionOut)
def update_stock_in(tx_id: uuid.UUID, payload: StockInCreate, db: Session = Depends(get_db)):
    tx = db.query(Transaction).filter(Transaction.id == tx_id, Transaction.type == "in").first()
    if not tx:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Entry not found")

    old_product = db.query(Product).filter(Product.id == tx.product_id).first()
    if old_product:
        old_product.quantity -= tx.quantity

    new_product = db.query(Product).filter(Product.id == payload.product_id).first()
    if not new_product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    new_product.quantity += payload.quantity

    tx.product_id = payload.product_id
    tx.quantity = payload.quantity
    tx.unit_price = new_product.cost_price
    tx.supplier = payload.supplier
    tx.date = payload.date

    db.commit()
    db.refresh(tx)
    return serialize_transaction(tx)


@router.put("/stock-out/{tx_id}", response_model=TransactionOut)
def update_stock_out(tx_id: uuid.UUID, payload: StockOutCreate, db: Session = Depends(get_db)):
    tx = db.query(Transaction).filter(Transaction.id == tx_id, Transaction.type == "out").first()
    if not tx:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Entry not found")

    new_product = db.query(Product).filter(Product.id == payload.product_id).first()
    if not new_product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    available = new_product.quantity + tx.quantity if payload.product_id == tx.product_id else new_product.quantity
    if payload.quantity > available:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Only {available} {new_product.unit} available")

    old_product = db.query(Product).filter(Product.id == tx.product_id).first()
    if old_product:
        old_product.quantity += tx.quantity

    customer = _resolve_customer(db, payload)
    new_product.quantity -= payload.quantity

    tx.product_id = payload.product_id
    tx.quantity = payload.quantity
    tx.unit_price = new_product.selling_price
    tx.cost_price_at_sale = new_product.cost_price
    tx.customer_id = customer.id
    tx.customer_name = customer.name
    tx.customer_phone = customer.phone
    tx.customer_type = customer.type
    tx.date = payload.date

    db.commit()
    db.refresh(tx)
    return serialize_transaction(tx)


def _revert_and_delete(db: Session, tx: Transaction):
    product = db.query(Product).filter(Product.id == tx.product_id).first()
    if product:
        if tx.type == "in":
            product.quantity = max(0, product.quantity - tx.quantity)
        else:
            product.quantity += tx.quantity
    db.delete(tx)


@router.delete("/{tx_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_transaction(tx_id: uuid.UUID, db: Session = Depends(get_db)):
    tx = db.query(Transaction).filter(Transaction.id == tx_id).first()
    if not tx:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Entry not found")

    _revert_and_delete(db, tx)
    db.commit()
    return None


@router.post("/bulk-delete", status_code=status.HTTP_204_NO_CONTENT)
def bulk_delete_transactions(payload: BulkDeleteRequest, db: Session = Depends(get_db)):
    transactions = db.query(Transaction).filter(Transaction.id.in_(payload.ids)).all()
    for tx in transactions:
        _revert_and_delete(db, tx)
    db.commit()
    return None