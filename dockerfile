# Usa Node.js 20 Alpine (leve)
FROM node:20-alpine

# Diretório de trabalho
WORKDIR /app

# Copia arquivos de dependência
COPY package*.json ./

# Instala dependências
RUN npm install

# Copia o restante do projeto
COPY . .

# Expõe a porta padrão do Vite
EXPOSE 5173

# Rodar o Vite dev server acessível de fora do container
CMD ["npm", "run", "dev", "--", "--host"]
