# build

FROM node:18-alpine As deploy

WORKDIR /usr/src/app

RUN addgroup --system service-core && \
          adduser --system -G service-core service-core

COPY dist/packages/service-core service-core
RUN chown -R service-core:service-core .

RUN npm --prefix service-core --omit=dev -f install

EXPOSE 3000

CMD [ "node", "service-core" ]
