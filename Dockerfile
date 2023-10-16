FROM node:21
WORKDIR /app
COPY .env.production .
COPY package.json .
COPY package-lock.json .
COPY pages ./pages
COPY components ./components
COPY styles ./styles
RUN npm install
RUN npm run build
EXPOSE 3000
CMD npm run start