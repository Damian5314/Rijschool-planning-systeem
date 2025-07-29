# Rijschool Plansysteem

Dit is een plansysteem voor een rijschool, gebouwd met Next.js en een Node.js/Express backend met MongoDB.

## Features

-   **Gebruikersbeheer**: Aanmelden, inloggen, rollen (admin, gebruiker).
-   **Instructeursbeheer**: Toevoegen, bewerken, verwijderen van instructeurs.
-   **Leerlingenbeheer**: Toevoegen, bewerken, verwijderen van leerlingen, inclusief lesgeschiedenis en financiële gegevens.
-   **Voertuigenbeheer**: Toevoegen, bewerken, verwijderen van voertuigen met onderhoudsgegevens.
-   **Lesplanning**: Plannen van lessen met instructeurs, leerlingen en voertuigen.
-   **Facturatie**: Genereren en beheren van facturen (mock data voor nu).
-   **Statistieken**: Overzicht van lessen, leerlingen en instructeurs.
-   **Instellingen**: Beheer van rijschoolgegevens en systeeminstellingen.

## Technologieën

**Frontend:**
-   Next.js (App Router)
-   React
-   TypeScript
-   Tailwind CSS
-   shadcn/ui

**Backend:**
-   Node.js
-   Express.js
-   MongoDB (met Mongoose)
-   JWT voor authenticatie

## Installatie

### 1. Kloon de repository

\`\`\`bash
git clone <jouw-repo-url>
cd rijschool-plansysteem
\`\`\`

### 2. Backend setup

Navigeer naar de `backend` directory:

\`\`\`bash
cd backend
\`\`\`

Installeer de Node.js dependencies:

\`\`\`bash
npm install
# of
yarn install
\`\`\`

Maak een `.env` bestand aan in de `backend` directory en voeg de volgende variabelen toe:

\`\`\`env
MONGO_URI=jouw_mongodb_connection_string
JWT_SECRET=een_sterke_geheime_sleutel
PORT=5000
\`\`\`

Vervang `jouw_mongodb_connection_string` met de URI van je MongoDB database (bijv. van MongoDB Atlas).
Vervang `een_sterke_geheime_sleutel` met een willekeurige, complexe string.

Start de backend server:

\`\`\`bash
npm start
# of
yarn start
\`\`\`

De backend zal draaien op `http://localhost:5000`.

### 3. Frontend setup

Navigeer terug naar de root directory van het project:

\`\`\`bash
cd ..
\`\`\`

Installeer de Next.js dependencies:

\`\`\`bash
npm install
# of
yarn install
\`\`\`

Maak een `.env.local` bestand aan in de root directory en voeg de volgende variabele toe:

\`\`\`env
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000/api
\`\`\`

Start de Next.js development server:

\`\`\`bash
npm run dev
# of
yarn dev
\`\`\`

De frontend zal draaien op `http://localhost:3000`.

## Database Seeding

Om de database te vullen met initiële testdata (instructeurs, leerlingen, lessen, gebruikers), kun je het seed script uitvoeren. Zorg ervoor dat je MongoDB draait en dat je `MONGO_URI` correct is ingesteld in `backend/.env`.

Navigeer naar de `backend/scripts` directory en voer het script uit:

\`\`\`bash
cd backend/scripts
node seed.js
\`\`\`

Dit zal de database opschonen en vullen met de gedefinieerde testdata.

## Gebruik

Open je browser en ga naar `http://localhost:3000`.
Je kunt inloggen met de volgende gegevens (na het uitvoeren van het seed script):
**Admin:**
-   **Email:** `admin@example.com`
-   **Wachtwoord:** `password123`

**Gebruiker:**
-   **Email:** `user@example.com`
-   **Wachtwoord:** `password123`

## Projectstructuur

\`\`\`
.
├── app/                  # Next.js App Router pages
├── backend/              # Node.js/Express backend
│   ├── config/           # Database configuratie
│   ├── controllers/      # Logica voor API endpoints
│   ├── middleware/       # Express middleware (bijv. authenticatie)
│   ├── models/           # Mongoose schema's
│   ├── routes/           # API routes
│   ├── scripts/          # Database seeding scripts
│   ├── services/         # Business logica
│   └── server.js         # Backend entry point
├── components/           # React componenten (custom en shadcn/ui)
├── hooks/                # React hooks
├── lib/                  # Utility functies en data types
├── public/               # Statische assets
├── styles/               # Globale CSS
├── tailwind.config.ts    # Tailwind CSS configuratie
└── tsconfig.json         # TypeScript configuratie
