
#!/bin/bash

# Script to help set up Cloud SQL database for CRM application
# This script provides the commands needed to set up Cloud SQL

echo "🗃️  Setting up Cloud SQL for CRM Application"
echo "==============================================="
echo ""

echo "This script will guide you through setting up Cloud SQL PostgreSQL"
echo "for your CRM application deployment on Google App Engine."
echo ""

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "❌ Google Cloud SDK (gcloud) is not installed."
    echo "Please install it from: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

echo "📋 Steps to set up Cloud SQL:"
echo ""

echo "1. Create a Cloud SQL PostgreSQL instance:"
echo "   gcloud sql instances create crm-db-instance \\"
echo "     --database-version=POSTGRES_15 \\"
echo "     --tier=db-f1-micro \\"
echo "     --region=us-central1"
echo ""

echo "2. Create a database for your CRM application:"
echo "   gcloud sql databases create crm_database \\"
echo "     --instance=crm-db-instance"
echo ""

echo "3. Create a database user:"
echo "   gcloud sql users create crm_user \\"
echo "     --instance=crm-db-instance \\"
echo "     --password=YOUR_SECURE_PASSWORD_HERE"
echo ""

echo "4. Get connection information:"
echo "   gcloud sql instances describe crm-db-instance"
echo ""

echo "5. Update your .env.production file with the Cloud SQL connection string:"
echo "   DATABASE_URL=\"postgresql://crm_user:YOUR_PASSWORD@/crm_database?host=/cloudsql/PROJECT_ID:us-central1:crm-db-instance\""
echo ""

echo "6. Enable Cloud SQL Admin API:"
echo "   gcloud services enable sqladmin.googleapis.com"
echo ""

echo "🔧 Alternative: Use your existing external database"
echo "If you want to keep using your current external PostgreSQL database,"
echo "just ensure it's accessible from Google Cloud Platform and update"
echo "the DATABASE_URL in .env.production accordingly."
echo ""

echo "📝 Notes:"
echo "- Replace PROJECT_ID with your actual Google Cloud project ID"
echo "- Choose a secure password and store it safely"
echo "- Consider using a higher tier for production workloads"
echo "- Make sure to configure firewall rules if using external database"
