# BacKend DOs File

## Tech Stack
- Express
- Prisma (for scalbe data queries)
- Neon Postgress (Esay Migration later)

## Packages Details 
### Core backend
```
npm install express dotenv cors helmet morgan express-rate-limit
```
### Prisma + DB
```
npm install prisma@6.8.2 @prisma/client@6.8.2
```
### Dev tools
```
npm install nodemon --save-dev
```
### Auth + extras (future-ready)
```
npm install bcrypt jsonwebtoken cloudinary dotenv nodemailer
```
### Blogs
```
npm install slugify multer
```


```
express-backend/
│
├── prisma/
│   └── schema.prisma
│
│── config/
│      ├── db.js
│      ├── cloudinary.js
|      ├── nodemailer.js
│
│── routes/
│      ├── auth.routes.js
│      ├── contact.routes.js
│      ├── newsletter.routes.js
│      ├── blog.routes.js
│
│── controllers/
│      ├── auth.controller.js
│      ├── contact.controller.js
│      ├── newsletter.controller.js
│
│── middlewares/
│      ├── error.middleware.js
│      ├── isLoggedIn.js
│      ├── rateLimit.middleware.js
|      └── upload.middleware.js
│
|──  services
│      ├── emailNotifications.js 
|
│── utils/
│      ├── email-templates (authEmailTemplates.js, newsletterEmailTemplates.js )
│── api/
│      ├── index.js
│
│── app.js
│── server.js
│
├── .env
├── package.json
```


## Prisma
Reads schema.prisma > creates tables automatically in Neon
```
npx prisma db push 
```

and this is coped project so prisma needs these command

```
npx prisma migrate dev --name init

```
This will compare your schema.prisma with the current database state (which is empty).