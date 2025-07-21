# Rijschool Planning Systeem

Dit is een webapplicatie voor het beheren van een rijschool, inclusief leerlingen, instructeurs, planning, facturatie en meer.

## Technologieën

**Frontend:**
- Next.js (React)
- TypeScript
- Tailwind CSS
- shadcn/ui

**Backend:**
- Node.js
- Express.js
- MongoDB (via Mongoose)
- JWT voor authenticatie

## Setup (Lokaal)

### 1. Backend Setup

Navigeer naar de `backend` map:
\`\`\`bash
cd backend
\`\`\`

Installeer de Node.js afhankelijkheden:
\`\`\`bash
npm install
\`\`\`

Maak een `.env` bestand aan in de `backend` map en voeg de volgende variabelen toe:
\`\`\`
MONGO_URI=jouw_mongodb_connection_string
JWT_SECRET=een_geheime_sleutel_voor_jwt
PORT=5000
\`\`\`
Vervang `jouw_mongodb_connection_string` met de URI van je MongoDB database (bijv. van MongoDB Atlas).

Start de backend server:
\`\`\`bash
npm run dev
\`\`\`
De backend zal standaard draaien op `http://localhost:5000`.

### 2. Database Seeding (Optioneel)

Om testdata in je database te plaatsen, navigeer naar de `backend` map en voer het seed-script uit:
\`\`\`bash
node scripts/seed.js
\`\`\`
**Let op:** Dit script zal bestaande data in de `Student`, `Instructeur`, `Les` en `User` collecties verwijderen voordat nieuwe testdata wordt toegevoegd.

### 3. Frontend Setup

Navigeer terug naar de root van het project:
\`\`\`bash
cd ..
\`\`\`

Installeer de frontend afhankelijkheden:
\`\`\`bash
npm install
\`\`\`

Maak een `.env.local` bestand aan in de root van het project en voeg de volgende variabele toe:
\`\`\`
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
\`\`\`
Zorg ervoor dat de URL overeenkomt met de poort waarop je backend draait.

Start de Next.js ontwikkelserver:
\`\`\`bash
npm run dev
\`\`\`
De frontend zal standaard draaien op `http://localhost:3000`.

## Deployment naar Vercel

Voor deployment naar Vercel, zorg ervoor dat je de omgevingsvariabelen (`MONGO_URI`, `JWT_SECRET`, `PORT` voor de backend en `NEXT_PUBLIC_BACKEND_URL` voor de frontend) configureert in de Vercel projectinstellingen.

Voor de `NEXT_PUBLIC_BACKEND_URL` in Vercel, moet je de URL van je gedeployde backend API gebruiken (bijv. `https://jouw-backend-api.vercel.app/api`).

## Functionaliteiten

- **Leerlingenbeheer:** Toevoegen, bewerken, verwijderen en bekijken van leerlinggegevens.
- **Instructeursbeheer:** Toevoegen, bewerken, verwijderen en bekijken van instructeurgegevens.
- **Planning:** Overzicht van lessen en afspraken (nog te integreren met backend).
- **Facturatie:** Facturen aanmaken, beheren, PDF genereren en email functionaliteit.
- **Authenticatie:** Gebruikersregistratie en login (basis implementatie).
- **Dashboard:** Overzicht van belangrijke statistieken.
- **Voertuigenbeheer:** Beheer van voertuigen.
- **Examens:** Beheer van examens.
- **Instellingen:** Algemene rijschoolinstellingen.

## Toekomstige uitbreidingen (Work Items)

- Database integratie voor alle modules.
- Uitgebreid authenticatiesysteem met rollen en rechten.
- Notificaties (bijv. SMS/WhatsApp integratie).
- Uitgebreide rapportage en statistieken.
- Mobiele app versie.
- Financieel systeem (uitgebreider dan alleen facturatie).
- Leskaart systeem.
\`\`\`
