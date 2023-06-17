# Build stage
FROM node:16-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN yarn --frozen-lockfile --cache-folder ./ycache && rm -rf ./ycache
COPY . .
RUN yarn build && rm -rf ./node_modules

# Production stage
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN yarn install --production --frozen-lockfile --cache-folder ./ycache && rm -rf ./ycache
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
RUN npx prisma generate
EXPOSE 3000

ARG DATABASE_URL
ARG OPENAI_API_KEY
ARG GOOGLE_SEARCH_API_KEY
ARG GOOGLE_SEARCH_ENGINE_ID
ARG ZYTE_API_KEY
ARG ZYTE_API_ENDPOINT

ENV DATABASE_URL=$DATABASE_URL
ENV OPENAI_API_KEY=$OPENAI_API_KEY
ENV GOOGLE_SEARCH_API_KEY=$GOOGLE_SEARCH_API_KEY
ENV GOOGLE_SEARCH_ENGINE_ID=$GOOGLE_SEARCH_ENGINE_ID
ENV ZYTE_API_KEY=$ZYTE_API_KEY
ENV ZYTE_API_ENDPOINT=$ZYTE_API_ENDPOINT


CMD ["yarn", "start:prod"]
