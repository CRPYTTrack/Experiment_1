# REST API Reference

The backend exposes a JSON-based RESTful API running on Node.js/Express.

## Base URL
In local development, the backend base URL is `http://localhost:3000`.

## Authentication endpoints

### `POST /register`
Registers a new user account.
-   **Body:**
    ```json
    {
      "username": "user123",
      "password": "securepassword"
    }
    ```
-   **Response (200 OK):**
    ```json
    { "message": "User Registered Successfully" }
    ```
-   **Errors:** `400 Bad Request` (User Already Exists), `500 Internal Server Error`.

### `POST /login`
Authenticates a user and returns a JWT token.
-   **Body:**
    ```json
    {
      "username": "user123",
      "password": "securepassword"
    }
    ```
-   **Response (200 OK):**
    ```json
    {
      "message": "Login successful",
      "token": "eyJhbGciOiJIUz...",
      "user": { "id": "uuid", "username": "user123" }
    }
    ```

---
*Note: The following endpoints require the JWT token to be passed in the `Authorization` header as `Bearer <token>`.*

## Watchlist endpoints

### `GET /watchlist`
Retrieves the authenticated user's watchlist.
-   **Response (200 OK):**
    ```json
    {
      "watchlist": ["bitcoin", "ethereum", "solana"]
    }
    ```

### `PUT /watchlist/add`
Adds a coin to the watchlist.
-   **Body:**
    ```json
    { "coin": "cardano" }
    ```
-   **Response (200 OK):** Updated watchlist array.

### `PUT /watchlist/remove`
Removes a coin from the watchlist.
-   **Body:**
    ```json
    { "coin": "cardano" }
    ```
-   **Response (200 OK):** Updated watchlist array.

---

## Portfolio endpoints

### `GET /portfolio`
Retrieves the user's current portfolio holdings and investments.
-   **Response (200 OK):**
    ```json
    {
      "bitcoin": {
        "totalInvestment": 50000,
        "coins": 1.5
      },
      "ethereum": {
        "totalInvestment": 3000,
        "coins": 2
      }
    }
    ```

### `PUT /portfolio/update`
Adds to or reduces a position in the portfolio. To simulate a sell, provide a negative `coins` value.
-   **Body:**
    ```json
    {
      "coin": "bitcoin",
      "coinData": {
        "totalInvestment": 1500,
        "coins": 0.05
      }
    }
    ```
-   **Response (200 OK):** Updated portfolio object maps.

---

## Alerts endpoints

### `GET /alerts`
Retrieves all price alerts set by the user.
-   **Response (200 OK):**
    ```json
    {
      "alerts": [
        {
          "id": "uuid",
          "coin_id": "bitcoin",
          "coin_name": "Bitcoin",
          "coin_image": "url",
          "target_price": 60000,
          "condition": "above",
          "created_at": "timestamp"
        }
      ]
    }
    ```

### `POST /alerts`
Creates a new price alert.
-   **Body:**
    ```json
    {
      "coin_id": "ethereum",
      "coin_name": "Ethereum",
      "coin_image": "url",
      "target_price": 4000,
      "condition": "above"
    }
    ```
-   **Response (201 Created):** Contains the newly created alert object.

### `DELETE /alerts/:id`
Deletes a specific price alert by ID.
-   **Response (200 OK):** `{ "message": "Alert deleted successfully" }`
