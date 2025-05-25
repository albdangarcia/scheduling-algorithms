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
<p align="center">This web application is designed to simulate and visualize various CPU scheduling algorithms. Users can input process details and see how different scheduling methods affect the execution of processes. The supported algorithms include: First-Come, First-Served (FCFS), Shortest Job First (SJF), Round Robin (RR), Priority Scheduling.</p>
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

Here are some features I'm planning to add in the future to improve the animation experience:

- **Animation Controls**: I plan to add features for controlling the animation experience using the GSAP library. These include a slider to control the animation timeline, allowing users to move forwards and backwards at their own pace, and a speed control to adjust the animation speed, enabling users to slow down or speed up as needed.

## Contributing

Contributions are welcome! Please submit a pull request or open an issue to discuss your ideas or report bugs.

## License

This project is licensed under the MIT License.
