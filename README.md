## Installation

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn package manager

## Project Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd book-review-backend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory with the following variables:
```
PSQL_DB_NAME=your name
PSQL_DB_USER=your user name
PSQL_DB_HOST=your user host
PSQL_DB_PASSWORD=your password
PSQL_DB_PORT=your port
PORT=8080
JWT_SECRET=your token

4. Set up the database:
refer to db folder and run all the sql script for test data 

5. Start the server:
npm run dev

CURLS
Authorisation: Always add Bearer before adding token in req.header.authorisation 

#### Sign Up
curl --location 'http://localhost:8080/api/auth/signup' \
--header 'Content-Type: application/json' \
--data-raw '{
    "email": "ssingh@gmail.com",
    "password": "Shivam123",
    "name": "Shivam Singh"
}'
Response
{
    "success": true,
    "message": "Welcome to our book community! Your account has been created",
    "data": {
        "user": {
            "id": 3,
            "email": "ssingh@yahoo.com",
            "name": "Shivam Singh",
            "created_at": "2025-05-25T12:09:22.568Z"
        },
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImVtYWlsIjoic3NpbmdoQHlhaG9vLmNvbSIsImlhdCI6MTc0ODE3NDk2MiwiZXhwIjoxNzQ4MjYxMzYyfQ.d2zQehB_ctZXLpCqeqni-I4igowyZ0qxgwyOEyaVvUM"
    }
}

#### Login
curl --location 'http://localhost:8080/api/auth/login' \
--header 'Content-Type: application/json' \
--data-raw '{
    "email": "77shivam.s@gmail.com",
    "password": "Shivam123"
}'
Response
{
    "success": true,
    "message": "Welcome back! You're now logged in",
    "data": {
        "user": {
            "id": 2,
            "email": "ssingh@gmail.com",
            "name": "Shivam Singh",
            "created_at": "2025-05-25T09:57:04.099Z"
        },
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoic3NpbmdoQGdtYWlsLmNvbSIsImlhdCI6MTc0ODE3NDk5MywiZXhwIjoxNzQ4MjYxMzkzfQ.3ftC04sO8JZ8r0ZnyScmQBlSUMk9wY4sQLQyikENUVw"
    }
}

### Books

#### Add a New Book
curl --location 'http://localhost:8080/api/books/addBook' \
--header 'authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoic3NpbmdoQGdtYWlsLmNvbSIsImlhdCI6MTc0ODE2ODk0NSwiZXhwIjoxNzQ4MjU1MzQ1fQ.UTp7j3l3eFARC_tWT0gFABKRTg3kfuWstd1yZfF0_VA' \
--data '{
    "title": "To Kill a Mockingbird",
    "author": "Harper Lee",
    "genre": "Harper Lee"
}'

Response
{
    "success": true,
    "message": "Great! The book has been added to our library",
    "data": {
        "id": 6,
        "title": "To Kill a Mockingbird",
        "author": "Harper Lee",
        "genre": "Harper Lee",
        "created_at": "2025-05-25T12:10:24.046Z"
    }
}

#### Get All Books (with pagination)
curl --location --request GET 'http://localhost:8080/api/books/getAllBooks' \
--header 'Content-Type: application/json' \
--data '{
    "author": "J.R.R. Tolkien",
    "genre": "Fantasy"
}'
Response 
{
    "success": true,
    "data": [
        {
            "id": 1,
            "title": "The Hobbit",
            "author": "J.R.R. Tolkien",
            "genre": "Fantasy",
            "created_at": "2025-05-24T14:30:28.032Z"
        },
        {
            "id": 2,
            "title": "1984",
            "author": "George Orwell",
            "genre": "Dystopian",
            "created_at": "2025-05-24T14:30:28.032Z"
        }
    ],
    "pagination": {
        "total": 6,
        "page": 1,
        "limit": 2,
        "totalPages": 3
    },
    "message": "Here are all the books in our collection!"
}

#### Search Books
curl --location 'http://localhost:8080/api/books/search?query=George%20Orwell'
Response
{
    "success": true,
    "message": "Here's what we found for you!",
    "data": {
        "books": [
            {
                "id": 2,
                "title": "1984",
                "author": "George Orwell",
                "genre": "Dystopian",
                "created_at": "2025-05-24T14:30:28.032Z",
                "average_rating": "4.5",
                "total_reviews": "2"
            }
        ],
        "pagination": {
            "total": 1,
            "page": 1,
            "limit": 10,
            "totalPages": 1
        }
    }
}

#### Get Book Details with Reviews
curl --location 'http://localhost:8080/api/books/1/reviews' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiNzdzaGl2YW0uc0BnbWFpbC5jb20iLCJpYXQiOjE3NDgxNzE0MTYsImV4cCI6MTc0ODI1NzgxNn0.0HFRifyrmSU3cJJevS8UKumbz7sgwQL9_z29IpO4ggg' \
--header 'Content-Type: application/json' \
--data '{
    "rating": 3,
    "comment": "This book is amazing! The world-building and character development are exceptional."
}'
Response
{
    "success": true,
    "message": "Thanks for sharing your thoughts! Your review has been added",
    "data": {
        "id": 44,
        "book_id": 1,
        "rating": 3,
        "comment": "This book is amazing! The world-building and character development are exceptional.",
        "created_at": "2025-05-25T12:11:58.093Z",
        "reviewer_name": "Shivam Singh"
    }
}

### Reviews

#### Add a Review
curl --location 'http://localhost:8080/api/books/1/reviews' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiNzdzaGl2YW0uc0BnbWFpbC5jb20iLCJpYXQiOjE3NDgxNzE0MTYsImV4cCI6MTc0ODI1NzgxNn0.0HFRifyrmSU3cJJevS8UKumbz7sgwQL9_z29IpO4ggg' \
--header 'Content-Type: application/json' \
--data '{
    "rating": 3,
    "comment": "This book is amazing! The world-building and character development are exceptional."
}'
Response
{
    "success": true,
    "message": "Thanks for sharing your thoughts! Your review has been added",
    "data": {
        "id": 44,
        "book_id": 1,
        "rating": 3,
        "comment": "This book is amazing! The world-building and character development are exceptional.",
        "created_at": "2025-05-25T12:11:58.093Z",
        "reviewer_name": "Shivam Singh"
    }
}

#### Update a Review
curl --location --request PUT 'http://localhost:8080/api/reviews/43' \
--header 'authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiNzdzaGl2YW0uc0BnbWFpbC5jb20iLCJpYXQiOjE3NDgxNzIzODEsImV4cCI6MTc0ODI1ODc4MX0.uUrMWyDRTVDQzea0Ikwo8Jldf3ylhSHzeG1sZf7SbFo' \
--header 'Content-Type: application/json' \
--data '{
    "rating": "4",
    "comment": "This book is amazing! The world-building and character development are exceptional."
}'
{
    "success": true,
    "message": "Your review has been updated! Thanks for keeping it current",
    "data": {
        "id": 43,
        "book_title": "The Alchemist",
        "rating": 4,
        "comment": "This book is amazing! The world-building and character development are exceptional.",
        "created_at": "2025-05-25T12:13:06.725Z",
        "reviewer_name": "Shivam Singh"
    }
}

#### Delete a Review
curl --location --request DELETE 'http://localhost:8080/api/reviews/43' \
--header 'authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiNzdzaGl2YW0uc0BnbWFpbC5jb20iLCJpYXQiOjE3NDgxNzIzODEsImV4cCI6MTc0ODI1ODc4MX0.uUrMWyDRTVDQzea0Ikwo8Jldf3ylhSHzeG1sZf7SbFo' \
--data ''
Response
{
    "success": true,
    "message": "Your review has been deleted successfully",
    "data": {
        "id": 42,
        "book_title": "The Alchemist"
    }
}

## Design Decisions and Assumptions

1. Authentication:
   - JWT-based authentication for stateless, scalable auth
   - Tokens expire after 24 hours for security
   - Passwords are hashed using bcrypt with salt rounds of 10

2. Book Management:
   - Case-insensitive search across titles and authors
   - Search results are ordered by relevance (exact matches first)
   - Pagination implemented to handle large datasets efficiently

3. Review System:
   - One review per user per book (enforced by unique constraint)
   - Rating scale of 1-5 stars for simplicity and familiarity
   - Reviews include timestamps for sorting and relevance
   - Average ratings are calculated on-the-fly

4. Error Handling:
   - Human-friendly error messages for better user experience
   - Proper HTTP status codes for different scenarios
   - Detailed error logging for debugging

5. Database Design:
   - Foreign key constraints for referential integrity
   - Indexes on frequently searched columns
   - Timestamp fields for audit trails

6. Security Considerations:
   - Input validation on all endpoints
   - SQL injection prevention through parameterized queries
   - Environment variables for sensitive configuration
# book-review-backend