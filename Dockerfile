FROM oven/bun:latest

WORKDIR /app

# Set the websocket environment variable
ENV VITE_PROSODY_API_SERVER="localhost:3000"

# Copy package files and install dependencies
COPY package.json ./
RUN bun install

# Copy the rest of the application
COPY . .

EXPOSE 8888

CMD ["bun", "run", "dev", "--host", "0.0.0.0", "--port", "8888"]
