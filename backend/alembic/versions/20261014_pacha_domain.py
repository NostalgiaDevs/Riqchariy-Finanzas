"""Support the pure Pacha aggregate and alias login on the existing users table."""

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision = "20261014_pacha"
down_revision = "10ac93cdd089"
branch_labels = None
depends_on = None

MONEY_COLUMNS = (
    "wallet",
    "savings_goal",
    "savings_emergency",
    "savings_free",
    "wage_per_period",
    "goal_target",
    "goal_saved",
)


def upgrade():
    op.add_column("users", sa.Column("alias", sa.String(30), nullable=True))
    op.create_unique_constraint("uq_users_alias", "users", ["alias"])
    op.alter_column("users", "email", existing_type=sa.String(), nullable=True)
    for column in MONEY_COLUMNS:
        op.alter_column(
            "player_economy",
            column,
            existing_type=sa.Float(),
            type_=sa.Numeric(20, 2),
            postgresql_using=f"round({column}::numeric, 2)",
        )
    for column in ("pending_events", "active_missions"):
        op.add_column(
            "player_economy",
            sa.Column(
                column,
                postgresql.JSONB(),
                nullable=False,
                server_default=sa.text("'[]'::jsonb"),
            ),
        )
    for column in ("last_late_tick", "last_fun_tick"):
        op.add_column("player_economy", sa.Column(column, sa.Integer(), nullable=True))
    op.add_column(
        "player_economy",
        sa.Column(
            "unpaid_expenses",
            sa.Numeric(20, 2),
            nullable=False,
            server_default="0",
        ),
    )


def downgrade():
    # Refuse a downgrade that would silently discard alias-only accounts.
    connection = op.get_bind()
    if connection.execute(sa.text("SELECT count(*) FROM users WHERE email IS NULL")).scalar():
        raise RuntimeError("Alias-only users need email addresses before downgrading")
    for column in (
        "unpaid_expenses",
        "last_fun_tick",
        "last_late_tick",
        "active_missions",
        "pending_events",
    ):
        op.drop_column("player_economy", column)
    for column in MONEY_COLUMNS:
        op.alter_column("player_economy", column, type_=sa.Float(), existing_type=sa.Numeric(20, 2))
    op.alter_column("users", "email", existing_type=sa.String(), nullable=False)
    op.drop_constraint("uq_users_alias", "users", type_="unique")
    op.drop_column("users", "alias")
