# Gentask

Um gerenciador de tarefas inteligente desenvolvido com React Native e Expo, potencializado por IA através do Gemini e com persistência de dados no Firebase.

## ✨ Principais funcionalidades

- Gerenciamento intuitivo de tarefas
- Categorização automática por IA
- Previsão inteligente de urgência
- Sugestão de datas de conclusão
- Geração de insights personalizados
- Interface moderna e responsiva
- Sincronização em tempo real

## 🚀 Tecnologias

- React Native
- Expo
- Firebase (Authentication e Firestore)
- Google Gemini AI

## 📋 Pré-requisitos

- Node.js instalado
- Expo CLI
- Conta no Firebase
- Chave de API do Gemini
- Expo Go instalado no dispositivo móvel (para desenvolvimento)

## ⚙️ Configuração

1. Clone este repositório
2. Instale as dependências:

```bash
npm install
```

3. Configure as variáveis de ambiente:
   Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```bash
EXPO_PUBLIC_FIREBASE_API_KEY=sua_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=seu_auth_domain
EXPO_PUBLIC_FIREBASE_PROJECT_ID=seu_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=seu_storage_bucket
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=seu_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=seu_app_id
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=seu_measurement_id
EXPO_PUBLIC_GEMINI_API_URL=sua_gemini_url
EXPO_PUBLIC_GEMINI_API_KEY=sua_gemini_key
```

## 🚀 Executando o projeto

1. Inicie o servidor de desenvolvimento:

```bash
npx expo start
```

2. Escaneie o QR Code com o aplicativo Expo Go em seu dispositivo móvel ou execute em um emulador.

## 📄 Licença

Este projeto está sob a licença GNU GPLv3 - veja o arquivo LICENSE para detalhes.
