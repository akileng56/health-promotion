FROM golang:1.22-alpine AS builder

ARG VERSION=0.0.0-dev
ARG COMMIT=unknown
ARG BUILD_TIME=unknown
ARG DIRTY=true
ARG SOURCE_URL=unknown

WORKDIR /app

COPY go.mod go.sum* ./
COPY . .

RUN go mod tidy
RUN go build \
    -ldflags="-X main.Version=${VERSION} -X main.Commit=${COMMIT} -X main.BuildTime=${BUILD_TIME} -X main.Dirty=${DIRTY}" \
    -o server main.go

FROM alpine:latest

WORKDIR /app

COPY --from=builder /app/server .

EXPOSE 8080

ENTRYPOINT ["/app/server"]