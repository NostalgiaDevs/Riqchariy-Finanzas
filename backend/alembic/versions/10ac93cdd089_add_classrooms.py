"""add_classrooms

Revision ID: 10ac93cdd089
Revises: aeeeb0e464a9
Create Date: 2026-09-25 21:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '10ac93cdd089'
down_revision: Union[str, Sequence[str], None] = 'aeeeb0e464a9'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table('classrooms',
    sa.Column('id', sa.UUID(), nullable=False),
    sa.Column('code', sa.String(), nullable=False),
    sa.Column('name', sa.String(), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('code')
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_table('classrooms')
