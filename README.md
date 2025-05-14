# QR Attendance System

A modern web-based attendance tracking system that uses QR codes to streamline the attendance process for educational institutions. Built with Svelte and SvelteKit.

## Project Overview

QR Attendance is a comprehensive solution for managing attendance in educational settings. The system allows lecturers to generate unique QR codes for their classes, which students can then scan to mark their attendance. Administrators have access to powerful management tools to oversee the entire process.

## Features

### Core Functionality

- QR code generation for attendance sessions
- Mobile-friendly QR code scanning
- Real-time attendance tracking and validation
- Comprehensive reporting and analytics

### User Experience

- Responsive design that works across devices
- Intuitive interfaces for all user roles
- Streamlined attendance process
- Dark mode support

## User Roles

### Students

- Scan QR codes to mark attendance
- View personal attendance history
- Receive confirmation of successful attendance submission

### Lecturers

- Generate QR codes for classes
- Monitor real-time attendance
- Access attendance reports for their courses
- Manage course-specific attendance policies

### Administrators

- Manage courses and user accounts
- Assign lecturers to courses
- Monitor system usage and activity
- Access comprehensive auditing tools
- Generate system-wide reports

## Installation

1. Clone the repository:

```bash
git clone [repository-url]
cd QRAttendance
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Start the development server:

```bash
npm run dev
```

## Production Deployment

To create a production build:

```bash
npm run build
```

Preview the production build with:

```bash
npm run preview
```

For deployment to production environments, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.

## Project Structure

```
QRAttendance/
├── src/
│   ├── routes/                # Application routes
│   │   ├── +page.svelte       # Home page
│   │   ├── student/           # Student-specific routes
│   │   │   └── attendance/
│   │   │       └── scan/      # QR code scanning functionality
│   │   ├── lecturer/          # Lecturer-specific routes
│   │   └── admin/            # Administrator routes
│   ├── lib/                   # Shared libraries and components
│   └── app.html               # Main HTML template
├── static/                    # Static assets
├── tests/                     # Test files
├── vite.config.ts             # Vite configuration
├── vitest-setup-client.ts     # Client-side test setup
└── package.json               # Project dependencies
```

## Technologies Used

- [Svelte](https://svelte.dev/) - Front-end framework
- [SvelteKit](https://kit.svelte.dev/) - Application framework
- [Tailwind CSS](https://tailwindcss.com/) - For styling and UI components
- [Vite](https://vitejs.dev/) - Build tool and development server
- [Vitest](https://vitest.dev/) - Testing framework
- [Testing Library](https://testing-library.com/docs/svelte-testing-library/intro) - For component testing

## Development

### Prerequisites

- Node.js (v16+)
- npm or yarn

### Development Workflow

1. Run the development server:

```bash
npm run dev
```

2. Access the application at `http://localhost:5173`

3. Make changes and see them reflected in real-time

### Testing

The project uses Vitest for testing with separate configurations for client and server tests:

- Client tests: Run in JSDOM environment with Svelte Testing Library
- Server tests: Run in Node environment

Run tests with:

```bash
# Run all tests
npm test

# Run client-side tests only
npm run test:client

# Run server-side tests only
npm run test:server
```

## Build Configuration

The project uses Vite with TailwindCSS integration:

- PostCSS processing for CSS
- SvelteKit plugin for Svelte integration
- Separate testing configurations for client and server code
- Support for browser compatibility through proper environment setup

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a pull request

## License

[MIT License](LICENSE)

## Support

For support or questions, please open an issue on our GitHub repository.
