from alembic import op
import sqlalchemy as sa


revision = 'add_campus_to_users'
down_revision = '7d7764a7f4d8'
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.add_column(sa.Column('campus', sa.String(length=50), nullable=True))


def downgrade():
    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.drop_column('campus')