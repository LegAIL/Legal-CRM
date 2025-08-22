
import sqlalchemy

# Database connection URL
DATABASE_URL = "postgresql://role_8dcaff960:iVsZmKs73Jr99UGbHApJraa2VEojT8MS@db-8dcaff960.db001.hosteddb.reai.io:5432/8dcaff960?sslmode=require"

def test_database_connection():
    """
    Tests the connection to the PostgreSQL database using SQLAlchemy.
    """
    try:
        # Create the SQLAlchemy engine with SSL requirement
        engine = sqlalchemy.create_engine(
            DATABASE_URL,
            connect_args={"sslmode": "require"}
        )

        # Establish a connection and execute a test query
        with engine.connect() as connection:
            print("Successfully connected to the reai.io database.")
            result = connection.execute(sqlalchemy.text("SELECT 1"))
            for row in result:
                print(f"Test query successful. Result: {row[0]}")

    except Exception as e:
        # Handle and print any errors
        print(f"An error occurred while connecting to the reai.io database: {e}")

if __name__ == "__main__":
    test_database_connection()
