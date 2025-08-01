FROM node:24.4.1-bookworm-slim AS builder

RUN corepack enable && \
    corepack prepare yarn@4.9.2 --activate && \
    yarn set version 4.9.2

RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ && \
    rm -rf /var/lib/apt/lists/*

RUN addgroup --system --gid 1001 builduser && \
    adduser --system --disabled-password --home /home/builduser --uid 1001 --gid 1001 builduser && \
    mkdir -p /app && \
    chown builduser:builduser /app

WORKDIR /app

COPY --chown=builduser:builduser package.json yarn.lock .yarnrc.yml ./
COPY --chown=builduser:builduser packages ./packages/

RUN yarn install --immutable

COPY --chown=builduser:builduser tsconfig.json ./

RUN yarn build

RUN mkdir -p /tmp/packages && \
    for pkg in packages/*/; do \
    pkg_name=$(basename $pkg) && \
    mkdir -p /tmp/packages/$pkg_name && \
    if [ -d "$pkg/dist" ]; then cp -r $pkg/dist /tmp/packages/$pkg_name/; fi && \
    if [ -f "$pkg/package.json" ]; then cp $pkg/package.json /tmp/packages/$pkg_name/; fi && \
    find /tmp/packages/$pkg_name -type f -not -path "*/dist/*" -not -name "package.json" -delete && \
    find /tmp/packages/$pkg_name -type d -empty -delete; \
    done

FROM node:24.4.1-bookworm-slim AS production

ENV NODE_ENV=production
ENV NODE_OPTIONS="\
    --max-http-header-size=8192 \
    --max-old-space-size=512 \
    --disable-proto=throw \
    --zero-fill-buffers"

RUN corepack enable && \
    corepack prepare yarn@4.9.2 --activate && \
    yarn set version 4.9.2

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    ca-certificates \
    python3 \
    make \
    g++ && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

RUN addgroup --system --gid 1001 appuser && \
    adduser --system --disabled-password --home /home/appuser --uid 1001 --gid 1001 appuser && \
    mkdir -p /app && \
    chown appuser:appuser /app

WORKDIR /app

COPY --chown=appuser:appuser --from=builder /app/package.json /app/yarn.lock ./
COPY --chown=appuser:appuser --from=builder /app/packages ./packages/

RUN find /app -type d -exec chmod 755 {} \; && \
    find /app -type f -exec chmod 644 {} \;

USER appuser:appuser

RUN yarn workspaces focus --all --production && \
    rm -rf /home/appuser/tmp/*

EXPOSE 3000

ENTRYPOINT ["yarn"]