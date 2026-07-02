# Global Buitenreclame Redesign Hub - Pitch Demo

Dit is een interactieve herontwerp-demo voor het zelfbedieningsplatform van **Global Buitenreclame (shop.globalbuitenreclame.nl)**. 

De huidige live versie heeft diverse knelpunten die drempels opwerpen voor MKB-ondernemers zonder uitgebreide marketingkennis. Deze demo lost deze knelpunten op door middel van een intuïtieve, doelgroepgerichte flow, verrijkt met slimme AI-ondersteuning.

---

## 🚀 De 6 Opgeloste Problemen van de Huidige Live Shop

In dit herontwerp zijn de 6 geïdentificeerde kernproblemen expliciet en overtuigend opgelost:

1. **Intake-startscherm (Doelgroep-eerst)**: 
   * *Oud*: De site start direct met een intimiderende en lege kaart waarop straten geselecteerd moeten worden.
   * *Nieuw*: Een warm welkom met 3 eenvoudige vragen (wat promoot je, wie is je doelgroep, en wat is je budget). De AI berekent direct een gepersonaliseerde campagne en toont alleen de best passende locaties (bijv. "98% Match" voor studenten).
2. **Altijd Stad & Plaats in beeld**:
   * *Oud*: Bij locaties zie je alleen vage straatnamen, waardoor je niet weet in welke stad het scherm hangt.
   * *Nieuw*: Zowel in de lijst, op de kaart, als in de winkelmand staan de **Straatnaam, Plaatsnaam én de specifieke Wijk/Buurt** (bijv. "Centrum / Grachtengordel, Amsterdam") prominent in beeld.
3. **Gecombineerd Boeken (Abri + Digitaal)**:
   * *Oud*: Klassieke (gedrukte) abri's en moderne digitale schermen konden niet samen in één boeking worden afgerekend.
   * *Nieuw*: Een uniforme winkelmand waarin beide formaten naadloos worden samengevoegd, apart kunnen worden voorzien van campagnemateriaal, en gezamenlijk worden afgerekend.
4. **Uitgebreide Vlakomschrijvingen**:
   * *Oud*: Te summiere omschrijvingen van wat een advertentievlak nou echt inhoudt.
   * *Nieuw*: Elke locatie beschikt over een gedetailleerd "Specificaties & Omgevingsrapport" dat de unieke contacttijd en passantenstromen uitlegt (bijv. "drukke wandelroute tussen Utrecht CS en de binnenstad, veel contacttijd bij terrassen").
5. **Duidelijke Richtlijnen & Contentrestricties**:
   * *Oud*: Geen inzicht in wat wel/niet mag op een bepaalde locatie of wat de aanlevervoorwaarden zijn.
   * *Nieuw*: Een heldere "Specificaties & Richtlijnen" sectie per locatie met toegestane bestandsextensies, maximale tekstdichtheid (bijv. max 30% tekstgebied), aanlevertermijnen en specifieke restricties (bijv. "geen alcoholreclame wegens nabijgelegen scholen").
6. **Upload & AI-creatie Flow**:
   * *Oud*: Geen mogelijkheid om je creatie direct te testen of door AI te laten ontwerpen.
   * *Nieuw*: Een geavanceerde campagne-tool met 3 tabs:
     * **Eigen upload**: Met gesimuleerde bestandstoetsing en validatie-check.
     * **Laat AI ontwerpen**: Voer een korte tekstpromoot-slogan in en zie de AI direct 3 schitterende, visueel diverse out-of-home posters renderen met jouw eigen tekst erin verwerkt.
     * **AI Richtlijnen Check**: Upload een afbeelding en laat de AI direct controleren of de resolutie, contrastverhouding, en tekstdichtheid voldoen aan de gemeentelijke wetgeving.

---

## 🛠️ Stack & Technologie

- **Frontend framework**: Vite + React 19 + TypeScript
- **Styling**: Tailwind CSS v4 (met op maat gemaakte Kobalt/Royalblauw kleurenpaletten)
- **Animaties**: `motion/react` voor soepele overgangen en realistische AI-laadanimaties
- **Icons**: `lucide-react`
- **Kaart**: Interactieve, drag-and-drop vector SVG-kaart waarmee locaties direct kunnen worden geselecteerd zonder dat er zware of foutgevoelige Google Maps API-sleutels nodig zijn.

---

## 📊 Mock Data vs. Productie-architectuur

Omdat dit een pitch-demo is om de overtuigende gebruikerservaring te laten zien, zijn sommige onderdelen gesimuleerd. Hieronder staat beschreven wat nu mock is en hoe dit in een productieversie aangesloten zou worden:

| Feature | Demo-status (Mock) | Productie-architectuur (Echt) |
| :--- | :--- | :--- |
| **Locatie-inventaris** | 10 gedetailleerde Nederlandse toplocaties in een statisch JSON-bestand (`src/data/mockData.ts`). | Een databasekoppeling (bijv. PostgreSQL/Firestore) gesynchroniseerd met een inventaris-ERP zoals Broadsign of Ayuda. |
| **AI Poster Ontwerp** | Genereert direct 3 dynamisch gestileerde CSS-poster mockups in de browser die de tekstinvoer van de gebruiker live overnemen. | Koppeling met de Google Gemini API (afbeelding-generatiemodellen zoals Imagen 3) of Stable Diffusion API om fotorealistische posters te genereren. |
| **AI Richtlijnen Check** | Simuleert een compliance-controle en toont na een laadtijd een vinkje op resolutie, contrast, tekstdichtheid en beleidsregels. | Server-side image processing met OpenCV en Gemini Vision API om daadwerkelijk de contrastverhouding en het percentage tekst op de afbeelding te berekenen. |
| **Geografische Kaart** | Een prachtige, interactieve, schaalbare SVG-vectorkaart met actieve pins van de locaties. | Google Maps Javascript SDK of Mapbox GL JS geïntegreerd met de geografische coördinaten (lat/lng) uit de database. |
| **Checkout & Betaling** | Een formulier dat contactgegevens verzamelt, de boeking opslaat in de lokale staat en een bevestigingsdashboard laadt. | Integratie met Stripe of Adyen voor iDEAL-betalingen, gekoppeld aan een e-mail notificatiedienst (bijv. SendGrid) en CRM-koppeling (bijv. Salesforce). |
