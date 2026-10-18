FROM alpine:3.20

ARG PB_VERSION=0.39.10
RUN apk add --no-cache ca-certificates \
 && wget -q "https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/pocketbase_${PB_VERSION}_linux_amd64.zip" -O /tmp/pb.zip \
 && unzip -q /tmp/pb.zip pocketbase -d /pb \
 && rm /tmp/pb.zip

COPY pb/pb_migrations /pb/pb_migrations
COPY pb/pb_hooks /pb/pb_hooks
COPY pb/entrypoint.sh /pb/entrypoint.sh
COPY public /pb/pb_public

# Mount a persistent volume here in Dokploy: it holds the database (widgets + logins).
VOLUME /pb/pb_data
EXPOSE 8090
ENTRYPOINT ["/bin/sh", "/pb/entrypoint.sh"]
