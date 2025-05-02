# Gentask

Um gerenciador de tarefas inteligente desenvolvido com React Native e Expo, potencializado por IA e com persistência de dados no Firebase.

## ✨ Principais funcionalidades

- Gerenciamento intuitivo de tarefas
- Categorização automática por IA
- Previsão inteligente de urgência
- Sugestão de datas de conclusão
- Geração de insights personalizados
- Sugestão de tarefas
- Interface moderna e intuitiva
- Sincronização de tarefas

## 🚀 Tecnologias

- React Native
- Expo
- Firebase (Authentication e Firestore)
- Gemini API

## 📋 Pré-requisitos

- Node.js instalado
- Expo CLI
- Projeto no Firebase
- Chave para API do Gemini
- Expo Go instalado no dispositivo móvel (para desenvolvimento)

Os dados para acesso a API do Gemini são obtidos do Firestore.
Portanto, é necessário que você crie o caminho para eles na sua base de dados.
Crie a coleção 'ai' e o documento 'config', inserindo neste último os seguintes dados:

- apiKey: Sua chave de acesso.
- modelName: Seu modelo de escolha do Gemini (ex: "gemini-2.0-flash").

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
```

## 🚀 Executando o projeto

1. Inicie o servidor de desenvolvimento:

```bash
npx expo start
```

2. Escaneie o QR Code com o aplicativo Expo Go em seu dispositivo móvel ou execute em um emulador.

## 📄 Licença

Este projeto está sob a licença GNU GPLv3 - veja o arquivo LICENSE para detalhes.
