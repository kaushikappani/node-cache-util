
# RedisCacheUtil

`RedisCacheUtil` is a utility for caching HTTP responses using Redis. It provides middleware for Express.js to cache responses based on a key generated from the request.

## Installation

To install the package, use npm:



npm install node-cache-util
## UsageHere's an example of how to use `RedisCacheUtil` in an Express.js application:

```js
const express = require('express');
const asyncHandler = require('express-async-handler');
const RedisCacheUtil = require('node-cache-util');

const redisUrl = process.env.REDIS_URL;
const ttl = 3600; // Time to live in seconds
const keyFunction = (req) => `cache:${req.user._id}:${req.originalUrl}`;

const redisCacheUtil = new RedisCacheUtil(redisUrl, ttl, keyFunction);

const router = express.Router();router.route("/")
  .get(redisCacheUtil.cache(), asyncHandler(async (req, res) => {

// Your route handler logic here res.send({ message: "Hello, world!" });

 }))
```
## API

### `RedisCacheUtil`

#### `constructor(redisUrl, ttl, keyFunction)`

- `redisUrl` (string): The URL of the Redis server.
- `ttl` (number): Time to live for cached responses in seconds.
- `keyFunction` (function): A function that generates a cache key from the request object.

#### `cache()`

Returns an Express middleware function that caches responses based on the generated key.

## Example


## License 
This project is licensed under the MIT License.

Feel free to customize the README further to suit your needs! If you have any other questions or need more help, just let me know. 😊

