"""add cost and selling price

Revision ID: d29b6a090607
Revises: 6dd6d7776d83
Create Date: 2026-09-05 14:18:11.073664

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'd29b6a090607'
down_revision: Union[str, Sequence[str], None] = '6dd6d7776d83'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.alter_column('products', 'unit_price', new_column_name='cost_price')

    op.add_column('products', sa.Column('selling_price', sa.Numeric(12, 2), nullable=True))
    op.execute('UPDATE products SET selling_price = cost_price')
    op.alter_column('products', 'selling_price', nullable=False)

    op.add_column('transactions', sa.Column('cost_price_at_sale', sa.Numeric(12, 2), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('transactions', 'cost_price_at_sale')
    op.drop_column('products', 'selling_price')
    op.alter_column('products', 'cost_price', new_column_name='unit_price')