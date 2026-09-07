"""create initial tables

Revision ID: 6dd6d7776d83
Revises: 
Create Date: 2026-09-03 14:55:40.811381

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '6dd6d7776d83'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Rename existing unit_price to cost_price — preserves all current data
    op.alter_column('products', 'unit_price', new_column_name='cost_price')

    # Add selling_price, backfill from cost_price so nothing is left blank,
    # then require it going forward
    op.add_column('products', sa.Column('selling_price', sa.Numeric(12, 2), nullable=True))
    op.execute('UPDATE products SET selling_price = cost_price')
    op.alter_column('products', 'selling_price', nullable=False)

    # Snapshot of cost at the moment of a sale — only populated for
    # stock-out rows, used to calculate profit later without it drifting
    # if the product's cost price changes afterward
    op.add_column('transactions', sa.Column('cost_price_at_sale', sa.Numeric(12, 2), nullable=True))


def downgrade() -> None:
    op.drop_column('transactions', 'cost_price_at_sale')
    op.drop_column('products', 'selling_price')
    op.alter_column('products', 'cost_price', new_column_name='unit_price')