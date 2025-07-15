# Dietly Frontend

A modern, production-ready React (Vite) frontend for the Dietly nutrition and calorie tracking app.


## Getting Started

## Environment Variables

- The frontend expects a backend API URL via the `VITE_API_BASE_URL` environment variable. Set this in your `.env` file or as a build arg if needed.

### Local Development

1. **Install dependencies:**
   ```sh
   npm install
   ```
2. **Start the development server:**
   ```sh
   npm run dev
   ```
   The app will be available at [http://localhost:5173](http://localhost:5173)

### Docker Usage

To build and run the frontend using Docker:

```sh
# Build the Docker image
# (replace dietly-frontend with your preferred image name)
docker build -t dietly-frontend .

# Run the container on port 5173 (host) mapped to 80 (container)
docker run -p 5173:80 dietly-frontend
```

The app will be available at [http://localhost:5173](http://localhost:5173)

> **Note:** The container serves the production build using Nginx. The port mapping (`-p 5173:80`) exposes the app on your host's port 5173. You can change the host port if needed.



