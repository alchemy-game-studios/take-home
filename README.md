# Receipt Processor
A NestJS implementation of a receipt processor api that persists and serves receipt data and calculates points based on a set of rules. The api is defined in `api.yml` as an OpenAPI spec. Details about API endpoints and point rules are documented [below](#summary-of-api-specification).

# Run Application Locally
You can run this application locally in Docker, or directly on your machine using NestJS. There are `npm` scripts provided to streamline this process if you have `npm` installed.

*Note:* We validate input according to the provided OpenAPI specification. The specification states that `purchaseTime` should have the `time` format. The `time` format requires that `seconds` be present (eg. `03:01:02`). Therefore, if you use the provided JSON from the original repository/README, *it will not validate*. The examples in this repository have been updated with this format.

## Using Docker
### Environment setup
Environment variables are required for each application stage. An example file is included in the repository. No values should be changed (yet), as there are no secrets handled by the application currently.

```bash
$ cp ./env/.env.example ./env/.env.development && cp ./env/.env.example ./env/.env.test
```


### Build and Run Container
Make sure you have Docker running on your machine, and then use these commands to build and start the application container:
```bash
$ docker build --build-arg NODE_ENV=development -t receipt-processor-api:latest .
```
```bash
$ docker run -p 3000:3000 -t receipt-processor-api:latest
```
Or if you have `npm` installed:
```bash
$ npm run docker:bootstrap
```


## Run Application Locally with NestJS
You will want to install `node` for development. 
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash
```
```bash
nvm install node
```

Then, simply run this command to set up and start the application locally:
```bash
$ npm run bootstrap && npm run start-local
```

# Summary of Application Features
While I'm learning Go (and love it!), for this exercise I opted to build the service in Node.js to leverage my most recently used toolset. I designed the solution to be Go-like where possible, particulary where concurrency would be beneficial.

Here is a rundown of what is included:
- NestJS (Typescript) with a structured Controller-Service-Repository model, defined and configured in `ReceiptsModule`.
- Prisma for an ORM layer, with a SQLite implementation for demonstration purposes.
  - Prisma generates an abstracted client from a central `schema.prisma` file that can be used for common SQL queries. It also has support for executing arbitrary SQL queries.
  - Prisma provides lifecycle functions for common tasks, like `migrations`.
  - For simplicity, we currently compile and migrate the Prisma schema directly in the Dockerfile to run SQLite in the same container as the application. For production, we would provide a `docker-compose.yml` to configure connections to external resources like the database, and the migration would be run during a deployment stage in the CI/CD pipeline.
- Flexible and configurable Point Rules algorithm that simulates Go-like "concurrency" scheme.
  - Found in `src/receipts/point-rules.ts`
  - Configured via `point-rules-config.yml`.
- Test coverage for the central components, the rules algorithm, and each rule. Includes some end-to-end testing for each endpoint.
- Input validation via OpenAPI specification and NestJS decorators.
- Stateless API service according to the specification
- `npm` scripts to aid development tasks and future CI/CD scripting.


# Production Checklist
Some ideas for what would be needed to make this production ready. Exact implementations will depend on the service environment and architecture, but this list can serve as a guide.

- Idempotency
  - We may want to wrap the `receipts/process` call in a transaction, to avoid partial commits.
- Security
  - Authentication (token or OAuth)
  - Authorization (JWT)
  - IP Allowlisting (if internally used service)
  - Secrets configuration integration
- Logging, Visibility, & Alerting
- CI/CD tooling integration
- Caching
  - HTTP Caching
  - Redis
- API rate limiting
- API versioning (eg. `<app-root>/v2/receipts/:id/points`)
- Worker service w/ queue
  - We may have heavy traffic spikes for the `receipts/process` endpoint, which writes data. May require offloading to a set of workers.
- Terraform for provisioning
  - Depends on the service architecture and environment, but some ideas:
    - CPU & Memory Autoscaling
    - Service replication & load balancing
    - Automatic server restarts
- Real database (depends on current architecture)
  - Replicas & backups
  - `docker-compose.yml`
- More testing
  - Input validation tests
  - Performance tests (via k6)
  - Smoke tests (run as part of CI/CD)
- Feature flagging
  - The service is pretty small now, so this may not be needed. In the future, feature flagging could be useful for controlled deployments, especially for large coordinated changes, controlled rollouts, and experimentation.
- Full documentation with runbooks

# Application development

## Compile and run the project

```bash
# setup
$ npm run bootstrap

# development
$ npm run start-local

# watch mode
$ npm run start-debug

# Build and compile project and run compiled app locally
$ npm run build
$ npm run start
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Code Standardization
```bash
# Linting
$ npm run lint

# Prettier formatting
$ npm run format
```

## Summary of API Specification

### Endpoint: Process Receipts

* Path: `/receipts/process`
* Method: `POST`
* Payload: Receipt JSON
* Response: JSON containing an id for the receipt.

Description:

Takes in a JSON receipt (see example in the example directory) and returns a JSON object with an ID generated by your code.

The ID returned is the ID that should be passed into `/receipts/{id}/points` to get the number of points the receipt
was awarded.

How many points should be earned are defined by the rules below.

Reminder: Data does not need to survive an application restart. This is to allow you to use in-memory solutions to track any data generated by this endpoint.

Example Response:
```json
{ "id": "7fb1377b-b223-49d9-a31a-5a02701dd310" }
```

## Endpoint: Get Points

* Path: `/receipts/{id}/points`
* Method: `GET`
* Response: A JSON object containing the number of points awarded.

A simple Getter endpoint that looks up the receipt by the ID and returns an object specifying the points awarded.

Example Response:
```json
{ "points": 32 }
```

---

# Rules

These rules collectively define how many points should be awarded to a receipt.

* One point for every alphanumeric character in the retailer name.
* 50 points if the total is a round dollar amount with no cents.
* 25 points if the total is a multiple of `0.25`.
* 5 points for every two items on the receipt.
* If the trimmed length of the item description is a multiple of 3, multiply the price by `0.2` and round up to the nearest integer. The result is the number of points earned.
* 6 points if the day in the purchase date is odd.
* 10 points if the time of purchase is after 2:00pm and before 4:00pm.


## Examples

```json
{
  "retailer": "Target",
  "purchaseDate": "2022-01-01",
  "purchaseTime": "13:01:00",
  "items": [
    {
      "shortDescription": "Mountain Dew 12PK",
      "price": "6.49"
    },{
      "shortDescription": "Emils Cheese Pizza",
      "price": "12.25"
    },{
      "shortDescription": "Knorr Creamy Chicken",
      "price": "1.26"
    },{
      "shortDescription": "Doritos Nacho Cheese",
      "price": "3.35"
    },{
      "shortDescription": "   Klarbrunn 12-PK 12 FL OZ  ",
      "price": "12.00"
    }
  ],
  "total": "35.35"
}
```
```text
Total Points: 28
Breakdown:
     6 points - retailer name has 6 characters
    10 points - 5 items (2 pairs @ 5 points each)
     3 Points - "Emils Cheese Pizza" is 18 characters (a multiple of 3)
                item price of 12.25 * 0.2 = 2.45, rounded up is 3 points
     3 Points - "Klarbrunn 12-PK 12 FL OZ" is 24 characters (a multiple of 3)
                item price of 12.00 * 0.2 = 2.4, rounded up is 3 points
     6 points - purchase day is odd
  + ---------
  = 28 points
```

----

```json
{
  "retailer": "M&M Corner Market",
  "purchaseDate": "2022-03-20",
  "purchaseTime": "14:33:00",
  "items": [
    {
      "shortDescription": "Gatorade",
      "price": "2.25"
    },{
      "shortDescription": "Gatorade",
      "price": "2.25"
    },{
      "shortDescription": "Gatorade",
      "price": "2.25"
    },{
      "shortDescription": "Gatorade",
      "price": "2.25"
    }
  ],
  "total": "9.00"
}
```
```text
Total Points: 109
Breakdown:
    50 points - total is a round dollar amount
    25 points - total is a multiple of 0.25
    14 points - retailer name (M&M Corner Market) has 14 alphanumeric characters
                note: '&' is not alphanumeric
    10 points - 2:33pm is between 2:00pm and 4:00pm
    10 points - 4 items (2 pairs @ 5 points each)
  + ---------
  = 109 points
```

---
