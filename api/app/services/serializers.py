from app.models.transaction import Transaction
from app.schemas.transaction import TransactionOut


def serialize_transaction(tx: Transaction) -> TransactionOut:
    return TransactionOut(
        id=tx.id, type=tx.type, product_id=tx.product_id,
        product_name=tx.product.name, category=tx.product.category,
        quantity=tx.quantity, unit_price=float(tx.unit_price),
        cost_price_at_sale=float(tx.cost_price_at_sale) if tx.cost_price_at_sale is not None else None,
        supplier=tx.supplier,
        customer_id=tx.customer_id, customer_name=tx.customer_name,
        customer_phone=tx.customer_phone, customer_type=tx.customer_type,
        date=tx.date, created_at=tx.created_at,
    )