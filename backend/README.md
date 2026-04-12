# Backend Setup

This backend uses Spring Boot with PostgreSQL.

## 1. Keep the database secret out of git

Do not paste the real database credentials into:

- `application.properties`
- any committed file
- screenshots or shared docs

Share the database connection privately only.

## 2. Create a local `.env` file

Inside `backend/`, create a file named `.env`.

You can copy the example file:

```bash
cp .env.example .env
```

If the private message gives you a URL in this format:

```text
postgres://USERNAME:PASSWORD@HOST:5432/DATABASE?sslmode=require
```

convert it into this `.env` content:

```properties
spring.datasource.url=jdbc:postgresql://HOST:5432/DATABASE?sslmode=require
spring.datasource.username=USERNAME
spring.datasource.password=PASSWORD
```

Important:

- Spring Boot needs `jdbc:postgresql://...`, not `postgres://...`
- keep `.env` local only
- do not commit `.env`

## 3. Run the backend

From the `backend/` folder:

```bash
mvn spring-boot:run
```

## 4. Test the backend

```bash
mvn test
```

Tests use an in-memory H2 database, so they do not need the real PostgreSQL credentials.

## 5. Swagger / OpenAPI

After starting the backend, open:

- `http://localhost:8080/swagger-ui.html`
- `http://localhost:8080/v3/api-docs`
