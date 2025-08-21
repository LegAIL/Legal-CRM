
# 🚀 Google Cloud Run Deployment Guide - LawAre CRM

## 📋 Översikt

Denna guide hjälper dig att deploya din CRM-applikation till Google Cloud Run med Docker containers istället för Google App Engine.

## 🎯 Vad som har förberetts

### ✅ Filer som skapats för Cloud Run:
- `Dockerfile` - Multi-stage Docker build för NextJS
- `.dockerignore` - Exkluderar onödiga filer från Docker context
- `cloudbuild.yaml` - Google Cloud Build konfiguration
- `next.config.cloudrun.js` - NextJS-konfiguration optimerad för containers
- `.env.cloudrun` - Miljövariabel-template för Cloud Run

### ✅ Deployment-scripts:
- `scripts/setup-cloudrun.js` - Förberedelse-script
- `scripts/build-cloudrun.js` - Build-script för Cloud Run
- `scripts/deploy-cloudrun.js` - Deployment-script
- `scripts/test-docker.js` - Lokal Docker-test

## 🛠️ Förutsättningar

### 1. Installera Docker Desktop
- **Windows/Mac**: [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- **Linux**: `sudo apt-get install docker.io`

### 2. Installera Google Cloud SDK
```bash
# Installation på olika plattformar:
# Windows: Ladda ner från https://cloud.google.com/sdk/docs/install
# Mac: brew install --cask google-cloud-sdk
# Ubuntu/Debian: 
curl https://sdk.cloud.google.com | bash
exec -l $SHELL
```

### 3. Autentisera med Google Cloud
```bash
gcloud auth login
gcloud config set project DIN-PROJECT-ID
```

### 4. Aktivera nödvändiga tjänster
```bash
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
```

## 🏃 Snabb Deployment (Rekommenderat)

### Steg 1: Förbered miljön
```bash
cd laware_crm
node scripts/setup-cloudrun.js
```

### Steg 2: Uppdatera miljövariabler
Redigera `.env.production.local`:
```env
# Database - använd din databas-URL
DATABASE_URL="din-databas-url-här"

# NextAuth - kommer att uppdateras efter deployment
NEXTAUTH_URL="http://localhost:3000"  # Temp value för build
NEXTAUTH_SECRET="ditt-starka-lösenord-här"

NODE_ENV=production
PORT=3000
```

### Steg 3: Testa lokalt med Docker
```bash
node scripts/test-docker.js
```
Öppna http://localhost:3000 för att testa.

### Steg 4: Deploya till Cloud Run
```bash
# Alternativ 1: Direkta deployment (enklast)
gcloud run deploy laware-crm \
  --source . \
  --region europe-west1 \
  --allow-unauthenticated \
  --port 3000 \
  --memory 1Gi \
  --cpu 1

# Alternativ 2: Med Cloud Build (mer kontroll)
node scripts/deploy-cloudrun.js
```

### Steg 5: Uppdatera NEXTAUTH_URL
Efter successful deployment får du en URL som:
`https://laware-crm-xxxxx-ew.a.run.app`

Uppdatera din deployment med rätt URL:
```bash
gcloud run services update laware-crm \
  --region europe-west1 \
  --set-env-vars NEXTAUTH_URL=https://din-cloud-run-url
```

## 📦 Manuell Docker Build (Om automatiska script inte fungerar)

### 1. Förbered konfiguration
```bash
cp next.config.cloudrun.js next.config.js
cp .env.cloudrun .env.production.local
```

### 2. Uppdatera miljövariabler
Redigera `.env.production.local` med dina värden.

### 3. Bygg Docker image
```bash
docker build -t laware-crm .
```

### 4. Testa lokalt
```bash
docker run -p 3000:3000 --env-file .env.production.local laware-crm
```

### 5. Tag och pusha till Google Container Registry
```bash
docker tag laware-crm gcr.io/DIN-PROJECT-ID/laware-crm
docker push gcr.io/DIN-PROJECT-ID/laware-crm
```

### 6. Deploya till Cloud Run
```bash
gcloud run deploy laware-crm \
  --image gcr.io/DIN-PROJECT-ID/laware-crm \
  --region europe-west1 \
  --allow-unauthenticated \
  --port 3000 \
  --memory 1Gi \
  --cpu 1
```

## 🔧 Troubleshooting

### Build-fel
```bash
# Om NextJS build misslyckas:
npx prisma generate
yarn build

# Om Docker build misslyckas:
docker system prune -f
docker build --no-cache -t laware-crm .
```

### Environment-problem
```bash
# Kontrollera miljövariabler:
gcloud run services describe laware-crm --region europe-west1

# Uppdatera miljövariabler:
gcloud run services update laware-crm \
  --region europe-west1 \
  --set-env-vars KEY=VALUE
```

### Database-anslutning
Se till att:
- Databas-URL är korrekt
- Database accepterar anslutningar från Cloud Run
- Prisma migrations är körda

## 🚀 Optimeringar för Production

### Prestanda
```bash
# Öka resources för högre trafik:
gcloud run services update laware-crm \
  --region europe-west1 \
  --memory 2Gi \
  --cpu 2 \
  --max-instances 100
```

### Säkerhet
```bash
# Begränsa åtkomst:
gcloud run services update laware-crm \
  --region europe-west1 \
  --no-allow-unauthenticated

# Sätt up custom domain:
gcloud run domain-mappings create \
  --service laware-crm \
  --domain din-domain.com \
  --region europe-west1
```

### Monitoring
- Använd Cloud Logging: https://console.cloud.google.com/logs
- Sätt upp Cloud Monitoring alerts
- Konfigurera health checks via `/api/health` endpoint

## 🎉 Framgång!

Din CRM-applikation körs nu på Google Cloud Run med:
- ✅ Fullständig containerisering med Docker
- ✅ Automatisk skalning (0-100 instanser)
- ✅ HTTPS och custom domains support
- ✅ Prisma database-integration
- ✅ NextAuth.js autentisering
- ✅ Alla CRM-funktioner intakta

Cloud Run URL: `https://din-service-url.a.run.app`

## 📞 Support

Vid problem:
1. Kontrollera logs: `gcloud run services logs read laware-crm --region europe-west1`
2. Testa lokalt först med Docker
3. Verifiera att alla miljövariabler är korrekta
