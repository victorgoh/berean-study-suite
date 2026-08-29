# Hugging Face Spaces / Self-Contained Docker Deployment for Berean MCP Server
FROM node:20-slim

# Install Python & virtual environment tools to download standalone SQLite databases
RUN apt-get update && apt-get install -y --no-install-recommends python3 python3-pip python3-venv && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Download complete verified SQLite biblical databases directly into the container image
RUN python3 -m venv /opt/venv && \
    /opt/venv/bin/pip install --no-cache-dir --upgrade biblematedata && \
    /opt/venv/bin/biblematedata

ENV DATA_DIR="/root/biblemate/data"

# Copy dependency definitions
COPY package*.json ./

# Install Node dependencies
RUN npm install

# Copy source code and lookup data
COPY . .

# Hugging Face Spaces listens on port 7860 by default
ENV PORT=7860
EXPOSE 7860

# Start Self-Contained Streamable HTTP MCP Server
CMD ["npm", "start"]
