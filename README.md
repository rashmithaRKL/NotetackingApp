# Note Taking Application

A modern, feature-rich note-taking application built with React Native and PHP backend. This application allows users to create, read, update, and delete notes with a beautiful, user-friendly interface.

## Features

### User Authentication
- Secure login and signup system
- Form validation and error handling
- Modern UI with smooth transitions
- Password visibility toggle

### Note Management
- Create new notes with title, content, and category
- View all notes with infinite scrolling
- Edit existing notes
- Delete notes with confirmation
- Filter notes by category
- Sort notes by date or title
- Pull-to-refresh functionality
- Real-time search capability

### Modern UI/UX
- Clean, minimalist design
- Responsive layouts
- Loading states and animations
- Error handling with user-friendly messages
- Card-based note display
- Modern icons and typography

## Tech Stack

### Frontend
- React Native
- React Navigation for routing
- Axios for API calls
- React Native Vector Icons
- Tailwind CSS for styling
- AsyncStorage for local storage

### Backend
- PHP for API endpoints
- MySQL database
- PDO for database operations
- RESTful API architecture

## Installation

### Prerequisites
- Node.js and npm
- PHP 7.4 or higher
- MySQL
- Composer (PHP package manager)

### Backend Setup

1. Configure your database:
```sql
CREATE DATABASE myapp;
USE myapp;

CREATE TABLE note (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    date DATE NOT NULL
);
```

2. Update database credentials in `backend/db.php`:
```php
$host = 'localhost';
$dbname = 'myapp';
$username = 'your_username';
$password = 'your_password';
```

3. Set up your PHP server:
```bash
# Using PHP's built-in server
php -S localhost:8080
```

### Frontend Setup

1. Clone the repository:
```bash
git clone https://github.com/rashmithaRKL/NotetackingApp.git
cd NotetackingApp
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

## API Endpoints

### Notes
- `GET /get_notes.php` - Retrieve notes (supports pagination and filtering)
- `POST /add_note.php` - Create a new note
- `POST /update_note.php` - Update an existing note
- `DELETE /delete_note.php` - Delete a note

## Project Structure

```
NotetackingApp/
├── backend/
│   ├── db.php
│   ├── add_note.php
│   ├── get_notes.php
│   ├── update_note.php
│   └── delete_note.php
├── screens/
│   ├── HomeScreen.js
│   ├── CreateNoteScreen.js
│   ├── ViewNoteScreen.js
│   ├── LoginScreen.js
│   └── SignupScreen.js
├── assets/
│   ├── adaptive-icon.png
│   ├── favicon.png
│   ├── icon.png
│   └── splash-icon.png
├── App.js
├── package.json
└── README.md
```

## Features in Detail

### Home Screen
- Displays all notes in a card layout
- Pull-to-refresh functionality
- Infinite scrolling for pagination
- Filter notes by category
- Sort by date or title
- Quick access to create new notes
- Delete notes with confirmation

### Create Note Screen
- Form validation
- Category selection
- Modern input fields
- Success/error feedback
- Loading states during API calls

### View/Edit Note Screen
- Clean note display
- Edit mode with form validation
- Delete confirmation
- Loading states for operations

### Authentication Screens
- Modern form design
- Real-time validation
- Password visibility toggle
- Error handling
- Loading states

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.