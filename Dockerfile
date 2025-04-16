FROM oven/bun:latest

WORKDIR /app

# Copy package files and install dependencies
COPY package.json ./
RUN bun install

# Copy the rest of the application
COPY . .

EXPOSE 8888

CMD ["bun", "run", "dev", "--host", "0.0.0.0", "--port", "8888"]
