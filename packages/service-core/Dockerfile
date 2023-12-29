# build

FROM node:18-alpine As deploy

WORKDIR /usr/src/app

RUN addgroup --system server && \
          adduser --system -G server server

COPY dist/packages/server server
RUN chown -R server:server .

RUN npm --prefix server --omit=dev -f install

EXPOSE 3000

CMD [ "node", "server" ]
