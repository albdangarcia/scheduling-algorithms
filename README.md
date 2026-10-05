<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="public/favicondark.png">
    <source media="(prefers-color-scheme: light)" srcset="public/faviconlight.png">
    <img width=70 alt="Scheduling Algorithms" src="public/faviconlight.png">
  </picture>
  <h3 align="center">Scheduling Algorithms</h3>
  <p align="center">
    <img src="https://badgen.net/badge/icon/typescript?icon=typescript&label" alt="typecript">
    <img src="https://badgen.net/badge/icon/docker?icon=docker&label" alt="docker">
  </p>
</p>
<p align="center">This web application is designed to simulate and visualize various CPU scheduling algorithms. Users can input process details and observe how different scheduling methods affect the execution of processes. The supported algorithms include First-Come, First-Served (FCFS), Shortest Job First (SJF), Round Robin (RR), and Priority Scheduling.</p>
<p align="center"><a href="https://scheduling-algorithms-two.vercel.app/">Live Demo</a></p>

## Getting Started

Follow these steps to run this project on your local machine.

1. **Clone the repository**

   You need to clone the repository to your local machine. You can do this with the following command:

   ```shell
   git clone https://github.com/albdangarcia/scheduling-algorithms.git
   ```

2. **Navigate to the project directory**

   Change your current directory to the project's directory with:

   ```shell
   cd scheduling-algorithms
   ```

3. **Install the dependencies**

   Installation runs `prisma generate`. Client generation works without database
   credentials; configure your environment before starting the app or running
   database commands.

   Now, you can install the dependencies required for the project with:

   ```shell
   npm install
   ```

4. **Run the application**

   You can now run the application in development mode with:

   ```shell
   npm run dev
   ```

   The application should now be running at http://localhost:3000 (or whatever port you have configured).

## Environment Variables

This project requires certain environment variables to be set up for it to run correctly. These variables are used for database connections, authentication, and other configurations.

1.  **Copy the Example Environment File:**

    First, you need to create a `.env` file in the root of the project. You can do this by copying the example file:

    ```shell
    cp .env.example .env
    ```

2.  **Configure the Variables:**

    Open the newly created `.env` file and fill in the values appropriate for your local development environment or deployment.

    Here's a breakdown of the variables:

    *   **Auth.js Configuration:**
        *   `AUTH_SECRET`: A strong, random secret string used to sign and encrypt tokens and cookies for authentication.
            *   **Important:** Generate a strong secret. You can use the command `openssl rand -base64 32` in your terminal or visit a site like https://generate-secret.vercel.app/32.
        *   `AUTH_URL`: Use `http://localhost:3000` locally, or your deployed application's origin. Register the matching `/api/auth/callback/github` URL in your GitHub OAuth app.

    *   **Application Environment:**
        *   `NODE_ENV`: Next.js selects development mode for `npm run dev` and production mode for builds and startup. Docker Compose explicitly runs the application and migrations in production mode.

    *   **Full Database Connection URL:**
        *   `DATABASE_URL`: This is the complete connection string for your PostgreSQL database, written as a literal string.
            *   The example in `.env.example` (`postgresql://scheduling:scheduling_local_dev@localhost:5433/scheduling_dev`) uses public sample credentials for the bundled local development database. Replace this URL for a different database; keep private credentials in your ignored `.env` file.
            *   For production or serverless databases, you should add `?sslmode=require` to the end of the URL to enforce SSL connections. The `.env.example` file includes comments guiding this.

    *   **GitHub OAuth Credentials (Optional):**
        *   `AUTH_GITHUB_ID`: Your GitHub OAuth App's Client ID.
        *   `AUTH_GITHUB_SECRET`: Your GitHub OAuth App's Client Secret.
        *   These are only needed if you want to enable GitHub authentication. You'll need to register an OAuth application on GitHub (under Settings > Developer settings) to get these credentials.

Make sure to save the `.env` file after configuring your variables. This file is typically included in `.gitignore` and should not be committed to your repository, especially if it contains sensitive credentials.

### Environment loading for Next.js and Prisma

Next.js loads environment files for the application. Prisma CLI commands run
outside Next.js, so `prisma.config.ts` uses `@next/env` to load the same files,
with the same variable expansion and precedence. Existing process environment
variables take priority over files.

Local Prisma commands (including `npm run db` and the install-time client
generation) default to development mode: `.env.development.local`, `.env.local`,
`.env.development`, then `.env`. `npm run build` explicitly runs its migration
step in production mode, matching `next build` and `next start`:
`.env.production.local`, `.env.local`, `.env.production`, then `.env`.
With `NODE_ENV=test`, `.env.local` is skipped and test-specific files are used.
For standalone production Prisma commands, set `NODE_ENV=production`, for
example `NODE_ENV=production npx prisma migrate deploy`.

Prisma chooses its database URL from `DATABASE_URL_UNPOOLED`,
`POSTGRES_URL_NON_POOLING`, `POSTGRES_URL`, then `DATABASE_URL`. The application
uses `POSTGRES_URL`, then `DATABASE_URL`. Configure these to point at the same
database, using an unpooled connection for migrations when needed. On deployment,
supply these variables through the hosting environment; Docker Compose's
`env_file` injects them at container runtime, not during the image build.
Client generation does not require a database URL; Prisma database commands
require one and fail when it is missing.

### Docker Container

Use Docker with Compose v2.24 or newer. Copy `.env.example` to `.env` and set
`AUTH_SECRET` and your GitHub OAuth credentials. The bundled database is dedicated
to local development: `scheduling_dev`, with public sample credentials
`scheduling` / `scheduling_local_dev`, matching the URL in `.env.example`.
Compose configures these database settings internally; no separate `POSTGRES_*`
entries are needed in `.env`.

```sh
docker compose up --build -d
```

Compose waits for PostgreSQL to be healthy, runs the one-time `migrate` service,
then starts the app at `http://localhost:3000`. The app and migration containers
use `postgres_db:5432`; host-side database tools use `localhost:5433` by default.
`APP_PORT` can change the app's host port. Ports bind to localhost.
The database volume persists across `docker compose down`; changing database
settings in Compose does not change credentials in an already initialized volume.

The Node 24 image build generates Prisma's client and builds Next.js without
database or authentication secrets. Environment files are excluded from the build
context. The application image contains Next.js's standalone output and runs as
the `node` user. `.env` and an optional `.env.local` are supplied at runtime.
The deployment uses the built image without mounting host source or dependencies.

For deployment with an existing PostgreSQL database, build and run the migration
target once with your database environment, then start the application image:

```sh
docker build --target migrations -t scheduling-algorithms:migrations .
docker build -t scheduling-algorithms:app .
docker run --rm --env-file .env scheduling-algorithms:migrations
docker run --rm -p 127.0.0.1:3000:3000 --env-file .env scheduling-algorithms:app
```

The database URL must be reachable from inside the containers. A host database's
`localhost` URL refers to the container itself; on Docker Desktop, use
`host.docker.internal` with the database's host port in a separate ignored runtime
environment file. Set `AUTH_URL` to the browser-facing application origin.
`docker run --env-file` does not expand `${VARIABLE}` references: use fully
resolved database URLs in that runtime file.
Compose supplies its bundled database URL and clears host-side URL aliases,
so use the direct `docker run` approach for an existing or external
database. The existing `npm run build` migration step remains available for
non-container deployments.

## Future Improvements

Here are some features planned for the future to enhance the animation experience:

- **Animation Controls**: I plan to add features for controlling the animation experience using the GSAP library. These include a slider to control the animation timeline, allowing users to move forwards and backwards at their own pace, and a speed control to adjust the animation speed, enabling users to slow down or speed up as needed.

## Contributing

Contributions are welcome! Please submit a pull request or open an issue to discuss your ideas or report bugs.

## License

This project is licensed under the MIT License.
