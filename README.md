# Ser Recicla Mobile

Este é o repositório do **mobile** da plataforma Ser Recicla, desenvolvido em React Native com Expo Router, NativeWind para styling e Zustand para gerenciamento de estado.

## 🚀 Como configurar o projeto

### Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** (versão 22 ou superior)
- **npm** (versão 10.9.3 ou superior)

Para desenvolvimento mobile, você também precisará de:

- **Expo Go** app no seu dispositivo móvel, ou
- **Android Studio** (para emulador Android), ou
- **Xcode** (para simulador iOS - apenas macOS)

### 📦 Instalação

1. **Clone o repositório**

```bash
git clone https://github.com/dcalliari/ser_recicla_mobile.git
cd ser_recicla_mobile
```

2. **Instale as dependências**:

```bash
npm install
```

### 🛠️ Configuração

O projeto já vem pré-configurado com:

- **TypeScript** com configurações strict
- **NativeWind** (Tailwind CSS para React Native)
- **Expo Router** com navegação por drawer e tabs
- **Zustand** para gerenciamento de estado
- **ESLint** e **Prettier** para formatação de código

## 🏃‍♂️ Como executar o projeto

### Desenvolvimento

Para iniciar o servidor de desenvolvimento:

```bash
npm start
```

Isso abrirá o Expo Developer Tools. A partir daí você pode:

### Executar em diferentes plataformas

**Android:**

```bash
npm run android
```

**iOS:**

```bash
npm run ios
```

**Web:**

```bash
npm run web
```

### 📱 Testando no dispositivo

1. Instale o app **Expo Go** no seu dispositivo
2. Execute `npm start`
3. Escaneie o QR code com:
   - **Android**: App Expo Go
   - **iOS**: Camera nativa do iPhone

## 🎨 Styling

O projeto usa **NativeWind**, que permite usar classes Tailwind CSS diretamente nos componentes React Native:

```tsx
<View className="flex-1 items-center justify-center bg-white">
  <Text className="text-xl font-bold text-blue-600">Olá Mundo!</Text>
</View>
```

## 🔧 Scripts disponíveis

- `npm start` - Inicia o servidor de desenvolvimento
- `npm run android` - Executa no Android
- `npm run ios` - Executa no iOS
- `npm run web` - Executa na web
- `npm run lint` - Verifica problemas no código
- `npm run format` - Formata o código automaticamente
- `npm run prebuild` - Gera arquivos nativos

## 📚 Tecnologias principais

- **[Expo](https://expo.dev/)** - Plataforma de desenvolvimento
- **[React Native](https://reactnative.dev/)** - Framework mobile
- **[Expo Router](https://docs.expo.dev/router/introduction/)** - Navegação baseada em arquivos
- **[NativeWind](https://www.nativewind.dev/)** - Tailwind CSS para React Native
- **[Zustand](https://github.com/pmndrs/zustand)** - Gerenciamento de estado
- **[TypeScript](https://www.typescriptlang.org/)** - Tipagem estática

## 🚨 Resolução de problemas

### Metro bundler não inicia

```bash
# Limpe o cache
npx expo start --clear
```

### Problemas com dependências

```bash
# Remova node_modules e reinstale
rm -rf node_modules
npm install
```

### Erro de TypeScript

Verifique se o arquivo `tsconfig.json` está configurado corretamente e se todos os tipos estão instalados.

## 🤝 Contribuindo

Antes de enviar seu código (push ou pull request), valide se tudo está correto executando:

```bash
npm run validate
```

Esse comando realiza três tarefas:

1. **Lint**: Aplica as regras de formatação definidas pelo Prettier.
2. **Type Check**: Executa o TypeScript para verificar se há erros de tipo.
3. **Build**: Gera os arquivos de saída (build) do projeto.
