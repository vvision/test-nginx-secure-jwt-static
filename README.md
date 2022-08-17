# test-nginx-secure-jwt-static

This repository asserts the possibility to serve static content protected
by external authentication with ``nginx``.
Authentication is based on jsonwebtoken, using an RSA key pair,
but using a secret string would be the same.

Use cases scenario are available under ``auth-server/requests``.
Both nginx server and the auth-server must be running.
Files can be use with WebStorm built-in http client.

## Architecture

The ``auth-server`` is a basic express server capable of generating jwt token and verifying them.
It has both a header authorization mode and a cookie mode.
Server can be run in dev mode using ``npm run watch`` in the ``auth-server``directory.

The nginx server is run using the official ``nginx`` docker image for easier testing.
A ``server`` is configured to listen on port 80, and to serve three directories:
* ``/public``: Serves the content of the ``nginx/static/public`` directory.
* ``/header-protected``: Serves the content of the ``nginx/static/protected`` directory and need the jwt token in the ``Authorization`` header.
* ``/cookie-protected``: Serves the content of the ``nginx/static/protected`` directory and need the jwt token in the ``jwt-token`` cookie.

Both protected path are validating the jwt token by calling the ``auth-server`` either the cookie routes, or the header based routes.

## Key generation for ``auth-server``

Before all, we need to generate keys:
````
openssl genrsa 2048 -out jwtRSA256-private.pem
````

Then, we extract the public key:
````
openssl rsa -in jwt_key_private.pem -pubout -outform PEM -out jwt_key_public.pem
````

## Run nginx

From repository root:
```
docker run --name test-nginx \
-v $(pwd)/nginx/static:/usr/share/nginx/html:ro \
-v $(pwd)/nginx/conf/nginx.conf:/etc/nginx/nginx.conf:ro \
-p 80:80 -d nginx
```

## Discussion

Depending on the production environment, one would certainly have to change the following lines in nginx configuration:
* ``proxy_set_header  Host localhost;``.
* ``proxy_pass_request_headers      on;`` changed to not pass all headers, but only what is needed (if relevant).

## Resources

* [Validating OAuth 2.0 Access Tokens with NGINX and NGINX Plus](https://www.nginx.com/blog/validating-oauth-2-0-access-tokens-nginx/)
* [Deploying NGINX as an API Gateway, Part 1](https://www.nginx.com/blog/deploying-nginx-plus-as-an-api-gateway-part-1/)
* [Deploying NGINX as an API Gateway, Part 2: Protecting Backend Services](https://www.nginx.com/blog/deploying-nginx-plus-as-an-api-gateway-part-2-protecting-backend-services)
* [Nginx authentication preflight request with Node.js backend in the Hetzner Cloud](https://community.hetzner.com/tutorials/nginx-auth-preflight-nodejs-api)
* [nginx - Docker image](https://hub.docker.com/_/nginx/)
* [Authenticating API Clients with JWT and NGINX Plus](https://www.nginx.com/blog/authenticating-api-clients-jwt-nginx-plus/)

Javascript in nginx:
* [Enabling NGINX JavaScript for NGINX and NGINX Plus](https://www.nginx.com/blog/harnessing-power-convenience-of-javascript-for-each-request-with-nginx-javascript-module/#njs-enable)
* [nginx Docs - njs Scripting Language](https://docs.nginx.com/nginx/admin-guide/dynamic-modules/nginscript/)

With nginx Plus:
* [Authentication and Content-Based Routing with JWTs and NGINX Plus](https://www.nginx.com/blog/authentication-content-based-routing-jwts-nginx-plus/)
