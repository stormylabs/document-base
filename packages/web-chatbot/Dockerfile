FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
# Uncomment the following line in case you want to disable telemetry during runtime.
# ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing


COPY --chown=nextjs:nodejs dist/packages/web-chatbot/ ./

COPY --chown=nextjs:nodejs dist/packages/web-chatbot/.next/static ./.next/standalone/dist/packages/web-chatbot/.next/static
COPY --chown=nextjs:nodejs dist/packages/web-chatbot/.next/cache ./.next/standalone/dist/packages/web-chatbot/.next/cache


USER nextjs

EXPOSE 3000

ENV PORT 3000
# set hostname to localhost
ENV HOSTNAME "0.0.0.0"

CMD ["node", ".next/standalone/packages/web-chatbot/server.js"]