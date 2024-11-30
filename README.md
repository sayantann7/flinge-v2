# Flinge

Flinge is a social media platform that allows users to create profiles, make posts, and receive movie recommendations based on their activity and preferences. The application is built using Node.js, Express, and MongoDB, with a front-end (HTML, CSS, Vanilla JavaScript) rendered using EJS templates.

## Features

- **User Authentication**: Users can sign up, log in, and log out using a secure authentication system.
- **Profile Management**: Users can edit their profile information, including their bio, favorite genres, and directors.
- **Post Creation**: Users can create posts with captions and like posts from other users.
- **Movie Recommendations**: Users receive personalized movie recommendations based on their profile data and activity.
- **Responsive Design**: The application is designed to be responsive and user-friendly across different devices.

## Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/sayantann7/flinge.git
   cd flinge
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Install MongoDB Community Server (Compass not neccesary)**:
   ```bash
   https://www.mongodb.com/try/download/community
   ```

4. **Set up environment variables**:
   Go to https://ai.google.dev/gemini-api/docs/api-key/ and create a new API key.
   Create a `.env` file in the root directory and add the following:
   ```
   GEMINI_API_KEY=your_google_generative_ai_key
   ```

5. **Start the server**:
   ```bash
   npm start
   ```

6. **Access the application**:
   Open your browser and go to `http://localhost:3000`.

## Dependencies

- **@google/generative-ai**: Used for generating movie recommendations.
- **axios**: Promise-based HTTP client for the browser and Node.js.
- **connect-flash**: Middleware for flash messages.
- **dotenv**: Loads environment variables from a `.env` file.
- **ejs**: Embedded JavaScript templates for rendering views.
- **express**: Web framework for Node.js.
- **express-session**: Session middleware for Express.
- **mongoose**: MongoDB object modeling tool.
- **multer**: Middleware for handling `multipart/form-data`, used for uploading files.
- **passport**: Authentication middleware for Node.js.
- **passport-local**: Local authentication strategy for Passport.
- **passport-local-mongoose**: Mongoose plugin for simplifying user authentication with Passport.

## File Structure

- **app.js**: Main application file that sets up the server and routes.
- **models/**: Contains Mongoose models for users and posts.
- **public/**: Contains static files like CSS and images.
- **views/**: Contains EJS templates for rendering the front-end.
- **.gitignore**: Specifies files and directories to be ignored by Git.
- **LICENSE**: MIT License for the project.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Contact

For any questions or feedback, please contact Sayantan Nandi at [officialsayantannandi@gmail.com].