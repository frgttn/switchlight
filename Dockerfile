FROM node:25.2-alpine3.21

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

CMD ["sh", "-c", "npm run db:migrate:prod && npm run start"]