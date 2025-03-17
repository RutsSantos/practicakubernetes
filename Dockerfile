# Usa la imagen base Node 16 (en vez de Node 18)
FROM node:16-alpine

WORKDIR /app

# Copiamos package*.json
COPY package*.json ./

# Instalamos dependencias
RUN npm install

# Copiamos el resto del código
COPY . .

# Compilamos (opcional, si vas a usar "start:prod")
RUN npm run build

EXPOSE 3000

# Iniciamos en modo producción
CMD ["npm", "run", "start:prod"]
