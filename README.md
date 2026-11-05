# 🎓 SkillBridge — Plateforme de cours en ligne

> Prototype Full-Stack réalisé dans le cadre d'un test technique de 5 jours.
>
> Plateforme permettant aux professeurs de créer et gérer leurs cours, et aux étudiants de consulter les contenus pédagogiques et d'accéder aux sessions Live.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?logo=prisma)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql)
![Vercel](https://img.shields.io/badge/Deployment-Vercel-black?logo=vercel)
![Tests](https://img.shields.io/badge/Tests-104%20passed-brightgreen)

---

## 🌐 Application en ligne

**URL de l'application :** [À COMPLÉTER — URL Vercel]

### Comptes de démonstration

Deux comptes sont disponibles pour tester les fonctionnalités selon les rôles.

| Rôle | Email | Mot de passe |
|---|---|---|
| 👨‍🏫 Professeur | `professor2.test@example.com` | À configurer |
| 👨‍🎓 Étudiant | `ikramebaskane1@gmail.com` | À configurer |

> **Note :** Ces comptes sont destinés à la démonstration du projet. Les accès doivent être configurés avec des identifiants dédiés à cet usage.

---

## 📋 Fonctionnalités principales

### 👨‍🏫 Espace Professeur
- Création, consultation, modification et suppression des cours (CRUD).
- Gestion des leçons associées aux cours.
- Ajout de contenus vidéo via des URL externes.
- Programmation et gestion des sessions Live.
- Publication des cours pour les rendre accessibles aux étudiants.

### 👨‍🎓 Espace Étudiant
- Consultation du catalogue des cours publiés.
- Accès aux détails des cours et à leurs leçons.
- Lecture des vidéos intégrées (YouTube, Vimeo et MP4).
- Consultation des sessions Live et accès aux liens de réunion.

### 🔐 Authentification et sécurité
- Authentification personnalisée avec bcrypt.
- Sessions persistées en base de données.
- Cookies sécurisés HttpOnly.
- Gestion des rôles (RBAC).
- Contrôle des autorisations côté serveur.
- Vérification de la propriété des cours (Ownership).
- Validation des entrées avec Zod 4.

### 🧪 Qualité et expérience utilisateur
- 104 tests unitaires avec Vitest.
- Interface responsive.
- Gestion des états de chargement.
- Gestion des états vides.
- Notifications Toast.
- Dialogues de confirmation pour les actions sensibles.

---

## 🏗️ Architecture technique

L'application repose sur une architecture Full-Stack construite avec Next.js App Router.

```text
                  UTILISATEURS
                       |
              NAVIGATEUR WEB
                       |
             React 19 / Next.js
                       |
                Cookie HttpOnly
                       |
              NEXT.JS 16
              (Vercel / HTTPS)
                       |
          +------------+------------+
          |            |            |
       Auth API    Courses API   Lessons API
          |            |            |
          +------------+------------+
                       |
                 SERVICES
                       |
             AUTHENTIFICATION / RBAC
             VALIDATION ZOD
             CONTRÔLE OWNERSHIP
                       |
                    PRISMA 6
                       |
                  POSTGRESQL
                       |
          +------------+------------+
          |                         |
      User / Session          Course / Lesson
                                |
                            LiveSession

       VOD : YouTube / Vimeo / MP4
       LIVE : Google Meet / Zoom
```

### Stack technique

| Couche | Technologie |
|---|---|
| Frontend | Next.js 16, React 19 |
| Langage | TypeScript 5 |
| UI | Tailwind CSS 4 |
| Backend | Next.js API Routes |
| Base de données | PostgreSQL |
| ORM | Prisma 6 |
| Authentification | bcryptjs, cookies HttpOnly, sessions SQL |
| Validation | Zod 4 |
| Tests | Vitest |
| Hébergement | Vercel |
| Versioning | Git / GitHub |

---

## 🚀 Installation locale

### Prérequis

- Node.js >= 20
- npm >= 10
- PostgreSQL >= 14 ou un compte Supabase / Neon.

### 1. Cloner le dépôt

```bash
git clone https://github.com/BSK-202/cours-platform.git
cd cours-platform
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configurer les variables d'environnement

Créer un fichier `.env` à la racine du projet à partir du modèle :

```bash
cp .env.example .env
```

Configurer ensuite la connexion à PostgreSQL :

```env
DATABASE_URL="postgresql://user:password@localhost:5432/cours_platform?schema=public"
```

Remplacer les paramètres par les informations de connexion de votre base de données.

### 4. Appliquer les migrations Prisma

```bash
npx prisma migrate deploy
npx prisma generate
```

### 5. Charger les données de démonstration (si configuré)

```bash
npx prisma db seed
```

### 6. Lancer le serveur de développement

```bash
npm run dev
```

### 7. Accéder à l'application

Ouvrir :

[http://localhost:3000](http://localhost:3000)

---

## 🧪 Tests et vérifications

### Exécuter les tests unitaires

```bash
npm run test
```

### Vérifier les types TypeScript

```bash
npx tsc --noEmit
```

### Générer le build de production

```bash
npm run build
```

**Résultats de validation annoncés :**
- 104 tests unitaires réussis.
- Vérification TypeScript sans erreur.
- Build de production réussi.

---

## 📁 Structure du projet

```text
cours-platform/
│
├── prisma/
│   └── schema.prisma
│
├── src/
│   ├── app/
│   │   ├── (public)/
│   │   ├── professor/
│   │   ├── student/
│   │   └── api/
│   │       ├── auth/
│   │       ├── courses/
│   │       ├── lessons/
│   │       └── live-sessions/
│   │
│   ├── components/
│   │   ├── auth/
│   │   ├── professor/
│   │   ├── student/
│   │   ├── landing/
│   │   └── ui/
│   │
│   └── lib/
│       ├── auth/
│       ├── courses/
│       ├── lessons/
│       ├── live-sessions/
│       └── validations/
│
├── docs/
│   ├── note_decision_technique.pdf
│   └── etude_technico_economique.pdf
│
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🔒 Sécurité

Plusieurs mécanismes ont été mis en place pour protéger les données et contrôler les accès.

- **Hashage des mots de passe :** utilisation de bcryptjs avec 10 rounds.
- **Gestion des sessions :** génération de tokens sécurisés avec `crypto.randomBytes(32)`.
- **Stockage des sessions :** empreintes SHA-256 des tokens conservées en base de données.
- **Cookies :** configuration HttpOnly, SameSite=Lax et Secure en production.
- **RBAC :** contrôle des rôles et autorisations au niveau des API.
- **Ownership :** un professeur ne peut gérer que ses propres cours.
- **Validation :** utilisation de Zod avec des schémas stricts pour contrôler les données entrantes.
- **Protection des secrets :** les variables d'environnement sensibles ne sont pas versionnées.

### Gestion des autorisations HTTP

| Code HTTP | Signification |
|---|---|
| 401 | Utilisateur non authentifié |
| 403 | Accès interdit |
| 404 | Ressource introuvable ou non accessible selon les règles de visibilité |

---

## 📚 Documentation complémentaire

Les documents techniques suivants accompagnent le projet :

- `docs/note_decision_technique.pdf` : présentation de l'architecture et justification des choix techniques.
- `docs/etude_technico_economique.pdf` : analyse des solutions VOD / Live, des coûts et des perspectives de montée en charge.

---

## 📝 Contexte du projet

SkillBridge est développé dans le cadre d'un test technique Full-Stack de 5 jours.

L'objectif est de concevoir et de livrer une application fonctionnelle permettant de démontrer les compétences en conception, développement Full-Stack, gestion des données, sécurité, tests et déploiement.

**Stack choisie librement :** Next.js, TypeScript, Prisma et PostgreSQL.

