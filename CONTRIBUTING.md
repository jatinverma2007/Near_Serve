# Contributing to NearServe

Thank you for considering contributing to NearServe!

## Development Setup

1. **Clone the repository**
```bash
git clone https://github.com/jatinverma2007/Near_Serve.git
cd Near_Serve
```

2. **Install dependencies**
```bash
# Install all dependencies
npm run install:all

# Or install separately
npm run install:backend
npm run install:frontend
```

3. **Set up environment variables**
- Copy `.env.example` to `.env` in both backend and frontend directories
- Update the values with your configuration

4. **Start development servers**
```bash
# In separate terminals:
npm run dev:backend
npm run dev:frontend
```

## Project Structure

- `/backend` - Express.js API server
- `/frontend` - React + Vite frontend application

## Code Style

- Use 2 spaces for indentation
- Follow existing code patterns
- Write meaningful commit messages
- Add comments for complex logic

## Making Changes

1. Create a new branch for your feature/fix
2. Make your changes
3. Test thoroughly
4. Commit with clear messages
5. Push and create a Pull Request

## Reporting Issues

When reporting issues, please include:
- Clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable
- Your environment (OS, Node version, etc.)

## Questions?

Feel free to open an issue for any questions or concerns.
