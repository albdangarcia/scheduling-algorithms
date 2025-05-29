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

    *   **PostgreSQL Connection Details:**
        *   `POSTGRES_USER`: Your PostgreSQL username.
        *   `POSTGRES_PASSWORD`: Your PostgreSQL password.
        *   `POSTGRES_HOST`: Set to `postgres` if you're using the Docker Compose setup (as it matches the service name). If you're running PostgreSQL directly on your machine, you might use `localhost`.
        *   `POSTGRES_DB`: The name of your PostgreSQL database.
        *   `POSTGRES_PORT`: The port PostgreSQL is running on (default is `5432`).

    *   **Auth.js Configuration:**
        *   `AUTH_SECRET`: A strong, random secret string used to sign and encrypt tokens and cookies for authentication.
            *   **Important:** Generate a strong secret. You can use the command `openssl rand -base64 32` in your terminal or visit a site like https://generate-secret.vercel.app/32.

    *   **Application Environment:**
        *   `NODE_ENV`: Set to `development`, `test`, or `production` depending on the environment.

    *   **Full Database Connection URL:**
        *   `DATABASE_URL`: This is the complete connection string for your PostgreSQL database. It's constructed from the individual `POSTGRES_*` variables.
            *   The example in `.env.example` (`postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}`) is suitable for local development.
            *   For production or serverless databases, you should add `?sslmode=require` to the end of the URL to enforce SSL connections. The `.env.example` file includes comments guiding this.

    *   **GitHub OAuth Credentials (Optional):**
        *   `AUTH_GITHUB_ID`: Your GitHub OAuth App's Client ID.
        *   `AUTH_GITHUB_SECRET`: Your GitHub OAuth App's Client Secret.
        *   These are only needed if you want to enable GitHub authentication. You'll need to register an OAuth application on GitHub (under Settings > Developer settings) to get these credentials.

Make sure to save the `.env` file after configuring your variables. This file is typically included in `.gitignore` and should not be committed to your repository, especially if it contains sensitive credentials.

### Docker Container

To run the application as a Docker container, you need to have Docker installed on your machine. Once Docker is installed, you can use the Docker Compose command:

1. Build the Docker image:
    ```sh
    docker compose build
    ```
1. Run the Docker container:
    ```sh 
    docker compose up
    ```

## Future Improvements

Here are some features planned for the future to enhance the animation experience:

- **Animation Controls**: I plan to add features for controlling the animation experience using the GSAP library. These include a slider to control the animation timeline, allowing users to move forwards and backwards at their own pace, and a speed control to adjust the animation speed, enabling users to slow down or speed up as needed.

## Contributing

Contributions are welcome! Please submit a pull request or open an issue to discuss your ideas or report bugs.

## License

This project is licensed under the MIT License.
