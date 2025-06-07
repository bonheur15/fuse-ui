# 🧩 Fuse UI

**Fuse UI** is a collection of elegant, functional, and highly customizable React components built on top of the incredible [shadcn/ui](https://ui.shadcn.com/).

Our mission is simple: **enhance shadcn/ui with rich features** without sacrificing its clean design, accessibility, or developer-friendly foundation.

---

## ✨ Philosophy

- **Functionality First**
  Complex logic and interactivity are baked into our components so you don’t have to reinvent the wheel.

- **Unstyled at the Core**
  Fuse UI uses Tailwind CSS and the same design tokens as shadcn/ui. It seamlessly adapts to your existing theme.

- **Developer Experience**
  Every component is intuitive, fully typed with TypeScript, and built to integrate easily into your project.

---

## ⚙️ Installation

We’re working on a CLI to streamline the setup process. Soon, you’ll be able to install components with a single command:

```bash
npx fuseui add [component-name]
```

Until then, components can be manually added by copying them from our documentation into your project.

---

## 🧱 Components

### 📂 File Uploader

Our first release is a robust, feature packed file uploader designed to handle everything from simple form uploads to advanced cloud integrations.

**Key Features:**

- **Multiple Providers**: Supports local uploads, custom server endpoints, Cloudinary, and AWS S3 (via pre-signed URLs).
- **Fully Customizable**: Take full control of UI with the `renderFilePreview` prop.
- **Feature-Rich**: Drag-and-drop, file previews, renaming, upload progress, validation, and more.
- **Type-Safe**: Built with TypeScript for safety and DX.

👉 **[Explore the Live Docs](/fileUploaderDocs)** – Play with the uploader, customize it, and copy the code directly into your project.

---

## 🛣️ Roadmap

We're just getting started. Here's what's coming next:

- 🚀 **Fuse UI CLI**: Simplified component installation with `npx fuseui add`.
- 📊 **Advanced Data Async Table**: Sorting, filtering, pagination, row selection – all powered by `tanstack/react-table`.
- 🧙 **Multi-Step Form Wizard**: Create complex forms with step validation, state management, and navigation.
- 📅 **Modern Calendar / Scheduler**: A flexible scheduling UI component for bookings, events, and more.
- 🔔 **Notification System**: A toast manager for global and contextual alerts, easy to trigger anywhere in your app.

---

## 🤝 Contributing

Contributions are welcome!
Have an idea or improvement? [Open an issue](#) or submit a pull request.

---

Built with ☕ and [shadcn/ui](https://ui.shadcn.com).
