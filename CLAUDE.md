# CLAUDE.md - AI Assistant Guide for ToteMaster

**Last Updated**: 2025-11-16
**Project Status**: Greenfield (Initial Development Phase)

## Project Overview

**ToteMaster** is a new software project in its initial development phase. This document serves as a comprehensive guide for AI assistants working on this codebase.

### Repository Information
- **Repository**: justinwells85/ToteMaster
- **Primary Branch**: main
- **Development Branch Pattern**: `claude/*` for AI assistant work
- **Current State**: Newly initialized repository with minimal structure

---

## 📁 Codebase Structure

### Current Structure
```
ToteMaster/
├── .git/                 # Git repository metadata
├── README.md             # Project documentation
└── CLAUDE.md            # This file - AI assistant guide
```

### Anticipated Structure
As the project develops, expect the following structure to emerge:

```
ToteMaster/
├── src/                  # Source code
│   ├── components/       # Reusable components
│   ├── services/         # Business logic and services
│   ├── utils/           # Utility functions
│   └── types/           # Type definitions
├── tests/               # Test files
├── docs/                # Additional documentation
├── config/              # Configuration files
├── public/              # Static assets (if web-based)
├── .gitignore           # Git ignore patterns
├── package.json         # Dependencies and scripts (if Node.js)
├── README.md            # Project overview
└── CLAUDE.md           # This guide
```

---

## 🔧 Development Workflows

### Git Workflow

#### Branch Strategy
1. **Main Branch**: `main` - stable, production-ready code
2. **Development Branches**: `claude/claude-md-<session-id>` - for AI assistant work
3. **Feature Branches**: `feature/<feature-name>` - for specific features
4. **Bug Fix Branches**: `fix/<bug-name>` - for bug fixes

#### Commit Guidelines
- **Format**: Use conventional commits format
  ```
  type(scope): subject

  body (optional)

  footer (optional)
  ```
- **Types**:
  - `feat`: New feature
  - `fix`: Bug fix
  - `docs`: Documentation changes
  - `style`: Code style changes (formatting, etc.)
  - `refactor`: Code refactoring
  - `test`: Adding or updating tests
  - `chore`: Maintenance tasks
  - `perf`: Performance improvements

- **Examples**:
  ```
  feat(auth): add user authentication system
  fix(validation): resolve email validation bug
  docs(readme): update installation instructions
  ```

#### Push Protocol
- Always use: `git push -u origin <branch-name>`
- Branch must start with `claude/` and match session ID
- Retry logic: On network failure, retry up to 4 times with exponential backoff (2s, 4s, 8s, 16s)

### Code Review Process
1. Create meaningful commits with clear messages
2. Ensure all tests pass before pushing
3. Document any breaking changes
4. Update relevant documentation

---

## 🎯 Key Conventions for AI Assistants

### General Principles
1. **Ask Before Assuming**: When project requirements are unclear, ask the user for clarification
2. **Incremental Development**: Build features incrementally with regular commits
3. **Test-Driven Approach**: Write or update tests alongside code changes
4. **Documentation First**: Update documentation as you code, not after
5. **Security Awareness**: Watch for common vulnerabilities (XSS, SQL injection, command injection, etc.)

### Code Quality Standards
- **Consistency**: Follow existing code patterns and styles
- **Readability**: Write self-documenting code with clear variable/function names
- **Modularity**: Keep functions small and focused on single responsibilities
- **DRY Principle**: Don't repeat yourself - abstract common patterns
- **Error Handling**: Always handle errors gracefully with appropriate messages

### Technology Stack Identification
Since the project is new, AI assistants should:
1. **Identify** the tech stack from user requirements or `package.json`/configuration files
2. **Document** the stack in this file once established
3. **Follow** ecosystem-specific best practices
4. **Use** appropriate tooling for the chosen stack

### File Operations
- **Read Before Write**: Always read existing files before modifying them
- **Prefer Editing**: Edit existing files rather than creating new ones when possible
- **No Unnecessary Files**: Only create files that are essential for functionality
- **Avoid Markdown Bloat**: Don't create documentation files unless explicitly requested

### Tool Usage
- **Parallel Operations**: Run independent operations in parallel when possible
- **Specialized Tools**: Use dedicated tools (Read, Edit, Write) over bash commands for file operations
- **Task Tracking**: Use TodoWrite for complex multi-step tasks
- **Explore Agent**: Use Task tool with Explore agent for codebase exploration

---

## 📋 Development Checklist

### Before Starting a Feature
- [ ] Understand the requirements completely
- [ ] Identify affected files and components
- [ ] Plan the implementation approach
- [ ] Create a todo list for complex tasks

### During Development
- [ ] Write clean, readable code
- [ ] Follow established conventions
- [ ] Add appropriate error handling
- [ ] Write/update tests
- [ ] Update documentation

### Before Committing
- [ ] Review all changes
- [ ] Ensure tests pass
- [ ] Check for security vulnerabilities
- [ ] Verify no sensitive data is committed
- [ ] Write clear commit message

### Before Pushing
- [ ] Verify you're on the correct branch
- [ ] Ensure branch name follows convention
- [ ] Confirm all changes are committed
- [ ] Check that remote updates are incorporated

---

## 🚨 Security Guidelines

### Common Vulnerabilities to Avoid
1. **Command Injection**: Sanitize all shell command inputs
2. **XSS (Cross-Site Scripting)**: Escape user-provided content
3. **SQL Injection**: Use parameterized queries
4. **Path Traversal**: Validate file paths
5. **Secrets Exposure**: Never commit API keys, passwords, or tokens
6. **Insecure Dependencies**: Keep dependencies updated

### Files to Never Commit
- `.env` files containing secrets
- `credentials.json` or similar credential files
- Private keys or certificates
- Database dumps with sensitive data
- API tokens or access keys

---

## 📚 Project-Specific Information

### Project Purpose
*To be documented once project scope is defined*

### Technology Stack
*To be documented once technologies are chosen*

**Potential Stacks**:
- Web Application: React/Vue/Angular + Node.js/Python/etc.
- Mobile App: React Native/Flutter/Swift/Kotlin
- Backend Service: Node.js/Python/Go/Java
- Desktop App: Electron/Tauri/Qt

### Dependencies
*To be documented as dependencies are added*

### Environment Setup
*To be documented once setup process is established*

### Testing Strategy
*To be documented once testing framework is chosen*

---

## 🔍 Common Tasks & Commands

### Development Commands
*These will be populated once package.json or build system is established*

Example placeholders:
```bash
# Install dependencies
npm install / pip install -r requirements.txt / etc.

# Run development server
npm run dev / python app.py / etc.

# Run tests
npm test / pytest / etc.

# Build for production
npm run build / etc.

# Lint code
npm run lint / etc.
```

### Useful Git Commands
```bash
# Check current status
git status

# View recent commits
git log --oneline -10

# View changes
git diff

# Create and switch to new branch
git checkout -b feature/new-feature

# Push to remote
git push -u origin branch-name

# Pull latest changes
git pull origin main
```

---

## 🤖 AI Assistant Best Practices

### Communication Style
- Be concise and technical
- Avoid unnecessary emojis unless requested
- Use markdown formatting for clarity
- Provide code references with `file_path:line_number` format

### Problem-Solving Approach
1. **Understand**: Read the request carefully
2. **Research**: Explore codebase if needed
3. **Plan**: Break down complex tasks
4. **Execute**: Implement incrementally
5. **Verify**: Test and validate changes
6. **Document**: Update relevant documentation

### Error Handling
- If a command fails, analyze the error
- Attempt reasonable fixes automatically
- If stuck, ask the user for guidance
- Never silently ignore errors

### Code Modification Strategy
1. Read existing code to understand context
2. Maintain consistent style and patterns
3. Test changes when possible
4. Commit logically related changes together
5. Write descriptive commit messages

---

## 📝 Documentation Standards

### Code Comments
- Explain **why**, not **what**
- Document complex algorithms or business logic
- Add TODO comments for future improvements
- Keep comments up-to-date with code changes

### README Updates
- Keep installation instructions current
- Document new features as they're added
- Include usage examples
- Maintain changelog for significant changes

### This Document (CLAUDE.md)
- Update when project structure changes significantly
- Document new conventions as they're established
- Add common patterns and solutions
- Keep technology stack information current

---

## 🔄 Maintenance Notes

### Regular Updates Needed
- Update technology stack section when dependencies are added
- Document common patterns as they emerge
- Add project-specific conventions
- Update directory structure as it evolves
- Record deployment procedures once established

### Version History
- **v1.0** (2025-11-16): Initial creation for greenfield project

---

## 📞 Getting Help

### For AI Assistants
- Consult this document first for conventions
- Use the Task/Explore agent to understand unfamiliar code
- Ask the user when requirements are ambiguous
- Reference official documentation for technologies in use

### For Users
- Update this document as the project evolves
- Provide feedback on AI assistant performance
- Clarify requirements when asked
- Review AI-generated code for correctness

---

## 🎓 Learning Resources

*Add project-specific resources, tutorials, and references as the project develops*

### General Resources
- Git Conventional Commits: https://www.conventionalcommits.org/
- OWASP Top 10: https://owasp.org/www-project-top-ten/
- Clean Code Principles: https://github.com/ryanmcdermott/clean-code-javascript

---

**Note**: This document is a living guide that should evolve with the project. AI assistants should update relevant sections as the codebase grows and new patterns emerge.
