# Docker Containerization Guide - Graduation Gateway

This guide provides comprehensive instructions for containerizing, deploying, and managing the Graduation Gateway application using Docker.

## 1. Application Analysis
- **Frontend Service**: React (Vite) served via **Nginx** (Port `80`).
- **Backend Service**: Express.js (Node.js) running on Port `4000`.
- **Database**: MongoDB 6.0 (Port `27017`).
- **Management UI**: Mongo-Express (Port `8081`).

## 2. Prerequisites
- Docker and Docker Compose installed.
- Port `80` (Frontend) and `4000` (Backend) available on host.

## 3. Quick Start
To build and run the entire decoupled stack:

```bash
docker-compose up -d --build
```

## 4. Building Images
We now use separate Dockerfiles for Frontend and Backend to allow independent scaling and optimized caching.

```bash
# Build Frontend
docker build -t graduation-gateway-frontend:latest -f Dockerfile.frontend .

# Build Backend
docker build -t graduation-gateway-backend:latest -f Dockerfile.backend .
```

## 5. Decoupled Architecture
- **Frontend (Nginx)**: Serves static assets and proxies `/api` and `/socket.io` requests to the backend service.
- **Backend (Node)**: Handles API logic and real-time socket communication.
- **Nginx Configuration**: [nginx.conf](file:///c:/Users/Craaj/graduation-gateway/nginx.conf) handles SPA routing and reverse proxying.

## 6. Running the Application
The `docker-compose.yml` orchestrates four services: `frontend`, `backend`, `mongodb`, and `mongo-express`.

```bash
# Start all services
docker-compose up -d

# Check logs for specific service
docker-compose logs -f frontend
docker-compose logs -f backend
```

## 5. Running the Application
### Detached Mode with Resource Limits
The `docker-compose.yml` is already configured with:
- **Health Checks**: Ensures the app and DB are responsive.
- **Restart Policy**: `unless-stopped` for high availability.
- **Resource Limits**: Capped at 512MB RAM and 0.5 CPU for the app.

```bash
# Start detached
docker-compose up -d

# Check status and health
docker-compose ps

# View logs
docker-compose logs -f app
```

## 6. Verification
To verify the containerized version matches local development:

1. **Integration Test**:
   ```bash
   docker exec graduation-gateway-app npm test
   ```
2. **Manual Check**:
   - Access `http://localhost:4000` for the application.
   - Access `http://localhost:4000/health` for the API health status.
   - Access `http://localhost:8081` for the Database UI (Admin/Pass: `admin/pass`).

## 7. Registry & Deployment
### Pushing to a Registry (e.g., Docker Hub)
```bash
# Login
docker login

# Tag for registry
docker tag graduation-gateway:latest yourusername/graduation-gateway:latest

# Push
docker push yourusername/graduation-gateway:latest
```

### Deployment Guidelines
- **Staging**: Deploy using Git SHA tag to ensure exact version matching.
- **Production**: Use Semantic Version tags (e.g., `v1.0.0`).
- **CI/CD**: Automate builds on `main` branch push using GitHub Actions or GitLab CI.

## 8. Security Best Practices
- **Non-Root User**: The image runs as `appuser` (UID 1001), significantly reducing the impact of potential container escapes.
- **Vulnerability Scanning**:
  ```bash
  docker scan graduation-gateway:latest
  # Or using Trivy
  trivy image graduation-gateway:latest
  ```
- **Base Image Updates**: Regularly rebuild your image to pull the latest security patches from `node:20-alpine`.
- **Secrets Management**: Use Docker Secrets or environment variable files (`.env`) injected at runtime; never bake secrets into the image.

## 9. Deliverables Included
- `Dockerfile`: Multi-stage build for minimal size (~150MB).
- `docker-compose.yml`: Full stack orchestration.
- `.dockerignore`: Excludes non-essential files to speed up builds.
- `DOCKER.md`: This guide.
