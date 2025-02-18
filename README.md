# RedisCacheUtil

`RedisCacheUtil` is a utility for caching HTTP responses using Redis. It provides middleware for Express.js to cache responses based on a key generated from the request.  This improves performance by reducing the load on your application servers and speeding up response times for frequently accessed resources.

## Installation

To install the package, use npm:

```bash
npm install node-cache-util
```

## Usage

Here are examples demonstrating how to use `RedisCacheUtil` in an Express.js application with various `keyFunction` implementations:

**Example 1: Caching based on User ID and URL**

This example caches responses separately for each user, based on their ID and the requested URL.

```javascript
const express = require('express');
const asyncHandler = require('express-async-handler'); // Consider using this for async error handling
const RedisCacheUtil = require('node-cache-util');

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379'; // Default to localhost if env var not set
const ttl = 3600; // Time to live in seconds (1 hour)
const keyFunction = (req) => `cache:${req.user._id}:${req.originalUrl}`; // Requires req.user to be populated by authentication middleware

const redisCacheUtil = new RedisCacheUtil(redisUrl, ttl, keyFunction);

const app = express();
app.use((req, res, next) => { // Example authentication middleware (replace with your actual authentication)
    req.user = { _id: 1 }; // Simulate user authentication
    next();
});

const router = express.Router();
router.route('/')
  .get(redisCacheUtil.cache(), asyncHandler(async (req, res) => {
    // Simulate expensive operation
    await new Promise(resolve => setTimeout(resolve, 1000)); 
    res.send({ message: `Hello, user ${req.user._id}!` });
  }));

app.use('/', router);
app.listen(3000, () => console.log('Server listening on port 3000'));
```

**Example 2: Caching based on URL only**

This example caches responses based only on the requested URL, regardless of the user.

```javascript
const express = require('express');
const asyncHandler = require('express-async-handler');
const RedisCacheUtil = require('node-cache-util');

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const ttl = 60; // Cache for 60 seconds
const keyFunction = (req) => `cache:${req.originalUrl}`;

const redisCacheUtil = new RedisCacheUtil(redisUrl, ttl, keyFunction);

const app = express();
const router = express.Router();
router.route('/products')
  .get(redisCacheUtil.cache(), asyncHandler(async (req, res) => {
    // Simulate fetching products from a database
    await new Promise(resolve => setTimeout(resolve, 1000));
    res.send([{ id: 1, name: 'Product A' }, { id: 2, name: 'Product B' }]);
  }));

app.use('/', router);
app.listen(3000, () => console.log('Server listening on port 3000'));
```


**Example 3:  Caching based on URL and query parameters**

This example demonstrates using query parameters in the cache key.  This is crucial for handling routes with different query parameters.

```javascript
const express = require('express');
const asyncHandler = require('express-async-handler');
const RedisCacheUtil = require('node-cache-util');
const queryString = require('query-string'); //For parsing query string

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const ttl = 300; // Cache for 5 minutes
const keyFunction = (req) => `cache:${req.originalUrl}?${queryString.stringify(req.query)}`;

const redisCacheUtil = new RedisCacheUtil(redisUrl, ttl, keyFunction);

const app = express();
const router = express.Router();
router.route('/data')
  .get(redisCacheUtil.cache(), asyncHandler(async (req, res) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    res.send({ data: req.query });
  }));

app.use('/', router);
app.listen(3000, () => console.log('Server listening on port 3000'));

```


### Removing Cached Items (Optional)

Use the `remove()` method to explicitly delete cached entries. This is useful for invalidating cached data after updates.


```javascript
// Example of removing a single cache key:
const keyToRemove = 'cache:GET:/products';
const deletedCount = await redisCacheUtil.remove(keyToRemove);

// Example of removing multiple keys:
const keysToRemove = ['cache:GET:/products', 'cache:POST:/users'];
const deletedCountMultiple = await redisCacheUtil.remove(keysToRemove);


console.log(`Deleted ${deletedCount} keys`);
console.log(`Deleted ${deletedCountMultiple} keys`);
```

Remember to install `query-string`: `npm install query-string`


## API

### `RedisCacheUtil`

#### `constructor(redisUrl, ttl, keyFunction)`

- `redisUrl` (string): The URL of the Redis server (e.g., `redis://localhost:6379`, `redis://user:password@host:port`).  Defaults to `redis://localhost:6379` if not provided.
- `ttl` (number): Time to live for cached responses in seconds.
- `keyFunction` (function): A function that takes the request object (`req`) as input and returns a string representing the cache key.  This function is **critical** for determining what gets cached and how.  It should be designed to generate unique keys for different requests that should be cached separately.

#### `cache()`

Returns an Express middleware function.  When placed before a route handler, it checks Redis for a cached response. If a cached response exists and is not expired, it sends the cached response. Otherwise, it executes the route handler, caches the response, and then sends it.

## Error Handling

The examples use `express-async-handler` for robust async error handling.  Make sure to install it: `npm install express-async-handler`  This middleware will catch any errors thrown within your async route handlers and send appropriate error responses.  Without it, unhandled exceptions could crash your server.

## License

This project is licensed under the MIT License.
