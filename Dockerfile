FROM node:22-alpine AS build
WORKDIR /usr/src/app
COPY package*.json ./
ARG GIT_COMMIT
ENV GIT_COMMIT=$GIT_COMMIT
RUN npm install 
COPY . .
RUN npm run build

FROM node:22-alpine
WORKDIR /usr/src/app 
RUN npm i -g serve
COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/.env ./.env
EXPOSE 5173
CMD [ "serve", "-l", "5173", "-s", "dist" ]