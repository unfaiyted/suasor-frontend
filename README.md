# Suasor Frontend

<div align="center">

[![License](https://img.shields.io/github/license/unfaiyted/suasor-frontend)](LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/unfaiyted/suasor-frontend)](https://github.com/unfaiyted/suasor-frontend/stargazers)
[![GitHub issues](https://img.shields.io/github/issues/unfaiyted/suasor-frontend)](https://github.com/unfaiyted/suasor-frontend/issues)

</div>

The frontend component of Suasor, a modern web application designed to allow users to genrerate AI Generated Recommendation lists for TV shows, Movies, and Music. Plans to integrate with various Self Hosted platformsincluding Sonarr, Radarr, Lidarr for collection and Emby,Jellyfin,Plex, and Navidrome for collection and playlist creations.

## Screenshots

<div align="center">
  <img src="docs/initial-screen.png" alt="Home page" width="80%" />
  <p><em>Suasor home page with dark theme</em></p>
</div>

## 🚀 Features

- Modern, responsive UI built with SvelteKit and TailwindCSS
- Dark/Light theme support
- Mobile-friendly design

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v18 or higher)
- [Bun](https://bun.sh/) (Latest version)
- [Git](https://git-scm.com/)

## 🛠️ Installation

1. Clone the repository:

```bash
git clone https://github.com/unfaiyted/suasor-frontend.git frontend
cd frontend
```

2. Install dependencies:

```bash
bun install
```

3. Create a local environment file:

```bash
cp .env.example .env
```

4. Configure your environment variables in `.env`

## 💻 Development

Start the development server:

```bash
bun run dev
```

The application will be available at `http://localhost:5173`

### Building for Production

```bash
bun run build
```

### Running Tests

```bash
bun run test
```

## 🏗️ Project Structure

```
suasor-frontend/
├── src/
│   ├── lib/           # Shared components and utilities
│   ├── routes/        # SvelteKit routes and pages
│   └── stores/        # Svelte stores for state management
├── static/           # Static assets
├── tests/           # Test files
└── ... configuration files
```

## 🔧 Configuration

The application can be configured through environment variables:

- `PUBLIC_API_URL`: Backend API endpoint
- `PUBLIC_APP_URL`: Frontend application URL
- [Additional configuration options to be documented]

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details on how to:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📚 Documentation

- [API Documentation](docs/API.md)
- [Component Documentation](docs/COMPONENTS.md)
- [State Management](docs/STATE.md)

## 🔄 Integration

Suasor integrates with various services including:

- [List of supported services to be added]
- [Integration documentation to be added]

## ⚙️ Tech Stack

- [SvelteKit](https://kit.svelte.dev/)
- [TailwindCSS](https://tailwindcss.com/)
- [Skeleton UI](https://www.skeleton.dev/)
- TypeScript
- Vite
- [Additional libraries and tools to be listed]

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Thanks everyone who has

## 📝 Notes for Completion

The following sections need additional details:

- List of supported services and integrations
- Component documentation
- State management documentation
- Additional configuration options
- Specific contribution guidelines
- Deployment guides

## ⚠️ Status

This project is currently in active development. Features and documentation will be updated regularly.

---

F
