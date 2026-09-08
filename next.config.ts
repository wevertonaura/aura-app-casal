import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Sem isso, o Next tenta empacotar o @prisma/client pras funções
  // serverless e acaba deixando o motor de query (o binário nativo) de
  // fora do pacote — causa PrismaClientInitializationError em produção
  // (a conexão em si está certa, só falta o binário certo).
  serverExternalPackages: ["@prisma/client", "prisma"],
};

export default nextConfig;
