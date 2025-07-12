#!/bin/bash
export PGDATA=/tmp/pg_data
export PGPORT=5432

# Clean up any existing setup
pkill postgres 2>/dev/null || true
rm -rf $PGDATA

# Initialize PostgreSQL
initdb -D $PGDATA

# Start PostgreSQL
pg_ctl -D $PGDATA -l /tmp/postgres.log start

# Wait for startup
sleep 3

# Create database and user
createdb coinfeedly
psql -d coinfeedly -c "CREATE USER coinfeedly_user WITH PASSWORD 'coinfeedly_pass';"
psql -d coinfeedly -c "GRANT ALL PRIVILEGES ON DATABASE coinfeedly TO coinfeedly_user;"
psql -d coinfeedly -c "GRANT ALL ON SCHEMA public TO coinfeedly_user;"

# Set environment variable
export DATABASE_URL="postgresql://coinfeedly_user:coinfeedly_pass@localhost:5432/coinfeedly"
echo "export DATABASE_URL='$DATABASE_URL'" >> ~/.bashrc

echo "PostgreSQL setup complete!"
echo "DATABASE_URL: $DATABASE_URL"
