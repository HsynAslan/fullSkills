# Full Skills Management System

![Project Logo](./images/logo.jpg)

## Overview

Full Skills Management System is a web-based platform designed to help users manage and track their skills and activities efficiently. It allows users to add, update, and view their skills, connect with others, form teams, and receive notifications about their activities. Additionally, it provides special functionalities for teachers to monitor and filter students' skills.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Tech Stack](#tech-stack)
- [Screenshots](#screenshots)
- [Contributing](#contributing)
- [License](#license)

## Features

- **Skill Management**: Users can add, edit, and track their skills.
- **Networking**: Connect with other users and expand your professional network.
- **Team Formation**: Create and join teams to collaborate on projects.
- **Notifications**: Stay updated with friend requests and other notifications.
- **Teacher Dashboard**: Special functionalities for teachers to filter and view students' skills.
- **WhatsApp Integration**: Communicate with your network using WhatsApp.
- **Responsive Design**: The platform is accessible on both desktop and mobile devices.

## Installation

To run this project locally, follow these steps:

1. **Clone the repository**:

    ```bash
    git clone https://github.com/HsynAslan/fullSkills.git
    cd fullSkills
    ```

2. **Install dependencies**:

    ```bash
    npm install
    ```

3. **Set up the database**:

    - Create a MySQL database and import the `fullskill-projesi-db.sql` file to set up the tables.
    - Update the database connection settings in `db.js`:

      ```javascript
      const dbConnection = mysql.createConnection({
          host: 'localhost',
          user: 'your_username',
          password: 'your_password',
          database: 'your_database_name',
      });
      ```

4. **Start the server**:

    ```bash
    npm start
    ```

    The application will be accessible at `http://localhost:3000`.

## Usage

1. **Register and Login**: Create an account or log in if you already have one.
2. **Add Skills**: Navigate to the Dashboard and add your skills.
3. **Connect with Others**: Use the Network feature to send friend requests and connect with other users.
4. **Form Teams**: Go to the Team section to create or join a team.
5. **View Notifications**: Check your notifications for updates and friend requests.
6. **Use WhatsApp**: Communicate with your network through the integrated WhatsApp feature.
7. **Filter Skills (Teachers)**: Teachers can use the Filter page to view and filter students' skills.

## Tech Stack

- **Frontend**: HTML, CSS, Bootstrap, EJS
- **Backend**: Node.js, Express.js
- **Database**: MySQL
- **Version Control**: Git
- **Hosting**: Local development

## Screenshots

![Dashboard](./screenshots/dashboard.png)
*Dashboard showing user's skills and activities.*

![Network](./screenshots/network.png)
*Network page where users can connect with others.*

![Team](./screenshots/team.png)
*Team page where users can create or join teams.*

![Notifications](./screenshots/notifications.png)
*Notification page showing recent activities and friend requests.*

## Contributing

Contributions are welcome! Here’s how you can help:

1. **Fork the repository**.
2. **Create a new branch**:

    ```bash
    git checkout -b feature/your-feature-name
    ```

3. **Make your changes and commit them**:

    ```bash
    git commit -m 'Add some feature'
    ```

4. **Push to the branch**:

    ```bash
    git push origin feature/your-feature-name
    ```

5. **Create a new Pull Request**.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

Thank you for using the Full Skills Management System! If you have any questions or need support, feel free to open an issue or contact us directly.

