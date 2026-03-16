FROM node:20-alpine

WORKDIR /app

# Install dependencies for Vite
RUN apk add --no-cache git

# Expose Vite dev server port
EXPOSE 5173

CMD ["npm", "run", "dev"]
