FROM node:18-alpine

WORKDIR /app

ENV PUPPETEER_SKIP_DOWNLOAD=true

COPY package*.json ./

RUN npm install --production

COPY . .

EXPOSE 3000

CMD ["npm","start"]
