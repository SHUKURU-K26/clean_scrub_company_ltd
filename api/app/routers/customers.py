import uuid
from typing import Optional, List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.dependencies import get_db, get_current_user
from app.models.customer import Customer
from app.schemas.customer import CustomerCreate, CustomerUpdate, CustomerOut, BulkDeleteRequest

router = APIRouter(prefix="/customers", tags=["customers"], dependencies=[Depends(get_current_user)])


@router.get("", response_model=List[CustomerOut])
def list_customers(search: Optional[str] = None, type: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Customer)

    if search:
        like = f"%{search}%"
        query = query.filter(or_(Customer.name.ilike(like), Customer.phone.ilike(like)))

    if type:
        query = query.filter(Customer.type == type)

    return query.order_by(Customer.created_at.desc()).all()


@router.post("", response_model=CustomerOut, status_code=status.HTTP_201_CREATED)
def create_customer(payload: CustomerCreate, db: Session = Depends(get_db)):
    customer = Customer(**payload.model_dump())
    db.add(customer)
    db.commit()
    db.refresh(customer)
    return customer


@router.get("/{customer_id}", response_model=CustomerOut)
def get_customer(customer_id: uuid.UUID, db: Session = Depends(get_db)):
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found")
    return customer


@router.put("/{customer_id}", response_model=CustomerOut)
def update_customer(customer_id: uuid.UUID, payload: CustomerUpdate, db: Session = Depends(get_db)):
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(customer, field, value)

    db.commit()
    db.refresh(customer)
    return customer


@router.delete("/{customer_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_customer(customer_id: uuid.UUID, db: Session = Depends(get_db)):
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found")

    # Deliberately NOT cascading to transactions — past Stock Out records keep
    # their own copy of customer_name/phone/type, so history stays intact
    # even after the customer record itself is gone. Same reasoning as the
    # frontend store had.
    db.delete(customer)
    db.commit()
    return None


@router.post("/bulk-delete", status_code=status.HTTP_204_NO_CONTENT)
def bulk_delete_customers(payload: BulkDeleteRequest, db: Session = Depends(get_db)):
    db.query(Customer).filter(Customer.id.in_(payload.ids)).delete(synchronize_session=False)
    db.commit()
    return None