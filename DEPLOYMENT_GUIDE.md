
# 🚀 Google App Engine Deployment Guide för CRM-applikationen

Denna guide hjälper dig att deploya din CRM-applikation till Google App Engine (GAE).

## 📋 Förberedelser

### 1. Google Cloud Setup

Först, se till att du har:
- Ett Google Cloud-projekt skapat
- Google Cloud SDK installerat på din dator
- Fakturering aktiverad för ditt projekt

```bash
# Installera Google Cloud SDK (om inte redan gjort)
# Följ instruktionerna på: https://cloud.google.com/sdk/docs/install

# Logga in och sätt ditt projekt
gcloud auth login
gcloud config set project DIN-PROJECT-ID
```

### 2. Aktivera nödvändiga API:er

```bash
# Aktivera App Engine och Cloud SQL APIs
gcloud services enable appengine.googleapis.com
gcloud services enable sqladmin.googleapis.com
```

### 3. Initiera App Engine (första gången)

```bash
# Skapa App Engine-applikation (välj region)
gcloud app create --region=europe-west1
```

## 🗄️ Databas-setup

### Alternativ 1: Använd befintlig extern databas (Rekommenderat för test)

Din app använder redan en extern PostgreSQL-databas. För enkel testning kan du fortsätta använda denna:

1. Uppdatera `.env.production` med rätt värden:
```bash
# Kopiera och uppdatera produktionsmiljövariabler
cp .env.production .env.production.local

# Redigera .env.production.local med dina värden:
# DATABASE_URL="din-befintliga-databas-url"
# NEXTAUTH_URL="https://DIN-PROJECT-ID.ey.r.appspot.com"
# NEXTAUTH_SECRET="generera-ny-säker-nyckel"
```

2. Generera en ny NEXTAUTH_SECRET för produktion:
```bash
openssl rand -base64 32
```

### Alternativ 2: Sätt upp Cloud SQL (För produktionsmiljö)

```bash
# Kör setup-scriptet för Cloud SQL
chmod +x scripts/setup-cloud-sql.sh
./scripts/setup-cloud-sql.sh
```

## 🔧 Förbered för deployment

### 1. Kör förberedelsescript

```bash
# Gör scriptet körbart och kör det
chmod +x scripts/prepare-gae-deployment.js
node scripts/prepare-gae-deployment.js
```

Detta script kommer att:
- Skapa GAE-specifik Next.js-konfiguration
- Uppdatera package.json med deployment-scripts
- Verifiera miljövariabler

### 2. Uppdatera miljövariabler

Redigera `.env.production.local` med dina produktionsvärden:

```env
# Databas (använd din befintliga eller ny Cloud SQL)
DATABASE_URL="postgresql://..."

# NextAuth konfiguration
NEXTAUTH_URL="https://DIN-PROJECT-ID.ey.r.appspot.com"
NEXTAUTH_SECRET="din-nya-säkra-nyckel-här"

# Node miljö
NODE_ENV=production
```

### 3. Uppdatera app.yaml

Redigera `app.yaml` och uppdatera env_variables-sektionen med dina faktiska värden:

```yaml
env_variables:
  NODE_ENV: production
  DATABASE_URL: "din-databas-url"
  NEXTAUTH_URL: "https://DIN-PROJECT-ID.ey.r.appspot.com"
  NEXTAUTH_SECRET: "din-säkra-nyckel"
```

## 🚢 Deploy till GAE

### 1. Bygg och deploya

```bash
# Förbered, bygg och deploya med ett kommando
npm run deploy:gae
```

Eller steg för steg:

```bash
# 1. Förbered för GAE (kopierar GAE-config)
npm run build:gae

# 2. Deploya till GAE
gcloud app deploy --quiet

# 3. Öppna i webbläsaren
gcloud app browse
```

### 2. Migrera databas (första gången)

Om du använder ny Cloud SQL-databas:

```bash
# SSH till GAE för att köra migrationer (om behövs)
gcloud app deploy --quiet
# Eller kör prisma migrate lokalt mot Cloud SQL
```

## 🔍 Testa deployment

### 1. Kontrollera hälsostatus

```bash
# Testa health check endpoint
curl https://DIN-PROJECT-ID.ey.r.appspot.com/api/health
```

### 2. Testa applikationen

1. Gå till din GAE-URL: `https://DIN-PROJECT-ID.ey.r.appspot.com`
2. Logga in med testkontot: `john@doe.com` / `johndoe123`
3. Testa huvudfunktionerna:
   - Dashboard
   - Skapa ärendens (Cases)
   - Tidsregistrering
   - Användarhantering

## 📊 Monitorering och loggar

### Visa loggar

```bash
# Se senaste loggarna
gcloud app logs tail -s default

# Filtrera efter fel
gcloud app logs read --severity>=ERROR
```

### Övervaka prestanda

Besök Google Cloud Console:
- App Engine → Versioner
- App Engine → Instanser  
- Operations → Logging

## 🔧 Felsökning

### Vanliga problem och lösningar

1. **Database connection errors**
   - Kontrollera DATABASE_URL i app.yaml
   - Verifiera att databastjänsten är tillgänglig

2. **NextAuth errors**
   - Kontrollera NEXTAUTH_URL och NEXTAUTH_SECRET
   - Se till att URL:en matchar din GAE-domän

3. **Build errors**
   - Kontrollera att alla dependencies är installerade
   - Verifiera att Prisma-schemat är korrekt

4. **Permission errors**
   - Kontrollera IAM-roller för ditt Google Cloud-konto
   - Se till att App Engine och SQL-API:er är aktiverade

### Rollback deployment

```bash
# Lista versioner
gcloud app versions list

# Växla till tidigare version
gcloud app versions migrate TIDIGARE-VERSION
```

## 📝 Underhåll

### Uppdatera applikationen

```bash
# För framtida deployments
npm run deploy:gae
```

### Backup av databas (om Cloud SQL)

```bash
# Skapa backup
gcloud sql backups create --instance=crm-db-instance
```

## ⚡ Prestandaoptimering

För produktionsmiljö, överväg att:
1. Uppgradera GAE-instanstyp i `app.yaml`
2. Konfigurera CDN för statiska filer
3. Aktivera caching för API:er
4. Optimera databasqueries

---

## 🆘 Support

Om du stöter på problem:
1. Kontrollera loggarna: `gcloud app logs tail`
2. Verifiera konfigurationen med förberedelsescriptet
3. Testa lokalt först: `npm run preview:gae`

**Lycka till med din deployment! 🎉**
