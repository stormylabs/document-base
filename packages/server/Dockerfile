# Build stage
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN yarn --frozen-lockfile --cache-folder ./ycache && rm -rf ./ycache
COPY . .
RUN yarn build && rm -rf ./node_modules

# Production stage
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN yarn install --production --frozen-lockfile --cache-folder ./ycache && rm -rf ./ycache
COPY --from=build /app/dist ./dist
EXPOSE 3000

CMD ["yarn", "start:prod"]
