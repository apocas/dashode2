# dashode2

Realtime dashboard for nginx and other clf based webservers.

It was designed to debug and monitor nginx instances but it should work with anything that features a clf log.

## Usage

### Install
 * `git clone https://github.com/apocas/dashode2`
 * `npm install`
 * `node main`

### Env variables

 * `SCENARIO` - Scenario type. ("local", "server" or "collector")
 * `HTTP_PORT` - Dashboard server PORT. (8081)
 * `COLLECTOR_PORT` - Collector server PORT. (8080)
 * `SERVER` - Collector server. ("http://127.0.0.1:8080")
 * `LOG_PATH` - Log path. ("/var/log/nginx/access.log")

### Scenarios

#### local
 * Spawns a collector server listening on port `COLLECTOR_PORT` (defaults to 8080)
 * Spawns a dashboard server listening on port `HTTP_PORT` (defaults to 8081)
 * Spawns a collector watching `LOG_PATH` (defaults to "/var/log/nginx/access.log") and reporting to collector server at `SERVER` (defaults to "http://127.0.0.1:8080")

#### server
 * Spawns a collector server listening on port `COLLECTOR_PORT` (defaults to 8080)
 * Spawns a dashboard server listening on port `HTTP_PORT` (defaults to 8081)

#### collector
 *  Spawns a collector watching `LOG_PATH` (defaults to "/var/log/nginx/access.log") and reporting to collector server at `SERVER` (defaults to "http://127.0.0.1:8080")

## Support

 * For all functionality use this log format:
 * `log_format  main  '$remote_addr - $remote_user - [$time_local] "$request" '
                      '$status $body_bytes_sent "$host" '
                      '"$http_user_agent" "$http_x_forwarded_for" "$http_referer" '
                      '$upstream_cache_status $request_time $upstream_response_time $scheme';`

## Authentication

 * Dashode does not feature authentication, you should push that to a reverse proxy if you need it.
 * Collector leverage env variables `USERNAME` and `PASSWORD`.

### nginx authentication example
 ```
server {
  listen 1337;
  server_name ~^(.+)$;

  location / {
    auth_basic "Restricted";
    auth_basic_user_file /var/nginx/passwd;

    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_http_version 1.1;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header Host $host;

    proxy_pass http://127.0.0.1:8081/;
  }
}
```

## License

Pedro Dias - [@pedromdias](https://twitter.com/pedromdias)

Licensed under the Apache license, version 2.0 (the "license"); You may not use this file except in compliance with the license. You may obtain a copy of the license at:

    http://www.apache.org/licenses/LICENSE-2.0.html

Unless required by applicable law or agreed to in writing, software distributed under the license is distributed on an "as is" basis, without warranties or conditions of any kind, either express or implied. See the license for the specific language governing permissions and limitations under the license.
