import uuid
from datetime import datetime
from typing import Optional, List

from pydantic import BaseModel


class CustomerBase(BaseModel):
    name: str
    phone: str
    type: str


class CustomerCreate(CustomerBase):
    pass


class CustomerUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    type: Optional[str] = None


class CustomerOut(CustomerBase):
    model_config = {"from_attributes": True}

    id: uuid.UUID
    created_at: datetime


class BulkDeleteRequest(BaseModel):
    ids: List[uuid.UUID]