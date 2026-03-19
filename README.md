# 🔐 Securit

> Premier projet d'application backend · Node.js / Express · Formation ENSEEIHT
> 
---

## 📖 Présentation

**Securit** est un premier projet d'application web réalisé lors de la formation à l'ENSEEIHT. Entièrement en **backend**, il implémente un système d'authentification sécurisé avec gestion des utilisateurs, envoi d'e-mails et génération de codes, servi via **Node.js** et **Express**.

---

## 🗂️ Structure du projet

```
Securit/
├── prisma/              # Schéma et migrations Prisma (PostgreSQL)
├── views/               # Templates EJS (rendu serveur)
├── assets/              # Fichiers statiques (CSS, images...)
├── generated/           # Fichiers générés par Prisma
├── app.js               # Point d'entrée — serveur Express
├── prisma.js            # Initialisation du client Prisma
├── prisma.config.ts     # Configuration Prisma (schema, migrations, BDD)
├── check_user.mjs       # Vérification d'un utilisateur en base
├── mail.mjs             # Envoi d'e-mails (Nodemailer)
├── generate_code.js     # Génération de codes (vérification, OTP...)
├── package.json
└── .gitignore
```

---

## 🛠️ Stack technique

| Outil | Rôle |
|-------|------|
| **Express 5** | Framework HTTP |
| **Prisma 7** | ORM + migrations |
| **PostgreSQL** | Base de données relationnelle |
| **EJS** | Templates HTML côté serveur |
| **JWT** | Authentification par token |
| **bcryptjs** | Hachage des mots de passe |
| **Nodemailer** | Envoi d'e-mails |
| **cookie-parser** | Gestion des cookies |
| **dotenv** | Variables d'environnement |

---

## 🚀 Installation & lancement

### Prérequis

- Node.js ≥ 14
- npm ≥ 6
- PostgreSQL (base de données configurée)

### Installation

```bash
git clone https://github.com/cbo31/Securit.git
cd Securit
npm install
```

### Configuration

Créer un fichier `.env` à la racine :

```env
DATABASE_URL="postgresql://user:password@localhost:5432/securit"
JWT_SECRET="votre_secret_jwt"
MAIL_USER="votre@email.com"
MAIL_PASS="votre_mot_de_passe"
```

### Initialisation de la base de données

```bash
npx prisma migrate dev
```

### Lancement

```bash
node app.js
```

---

## ⚙️ Fonctionnalités

- **Authentification** sécurisée avec JWT stocké en cookie
- **Hachage des mots de passe** via bcryptjs
- **Vérification des utilisateurs** en base de données (Prisma + PostgreSQL)
- **Envoi d'e-mails** transactionnels via Nodemailer
- **Génération de codes** (OTP / vérification)
- **Rendu de pages** HTML côté serveur avec EJS

---

## 📝 Notes

- Le projet utilise les **ES Modules** natifs (`"type": "module"` dans `package.json`) — les imports se font avec `import/export`.
- Licence **AGPL-3.0** — toute modification doit être publiée sous la même licence.
- Projet réalisé dans le cadre de la formation **DU Fullstack à l'ENSEEIHT**.
