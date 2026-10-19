#!/bin/bash
# Fresh YouZell EC2 setup: Node.js, PM2, MongoDB, nginx
set -euo pipefail

echo "=== Updating packages ==="
sudo apt-get update -y
sudo DEBIAN_FRONTEND=noninteractive apt-get upgrade -y

echo "=== Installing base tools ==="
sudo DEBIAN_FRONTEND=noninteractive apt-get install -y \
  curl ca-certificates gnupg lsb-release build-essential git nginx ufw

echo "=== Installing Node.js 20 ==="
if ! command -v node >/dev/null 2>&1; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo DEBIAN_FRONTEND=noninteractive apt-get install -y nodejs
fi
node -v
npm -v

echo "=== Installing PM2 ==="
sudo npm install -g pm2

echo "=== Installing MongoDB 7 ==="
if ! command -v mongod >/dev/null 2>&1; then
  curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | \
    sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor
  echo "deb [ signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | \
    sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
  sudo apt-get update -y
  sudo DEBIAN_FRONTEND=noninteractive apt-get install -y mongodb-org
fi

sudo systemctl enable mongod
sudo systemctl start mongod
sleep 2
mongosh --quiet --eval 'db.runCommand({ ping: 1 })' || true

echo "=== Preparing app directories ==="
mkdir -p ~/support-backend
sudo mkdir -p /var/www/admin-portal
sudo chown -R "$USER:$USER" /var/www/admin-portal
sudo chmod -R 755 /var/www/admin-portal

echo "=== Configuring nginx for admin portal ==="
sudo tee /etc/nginx/sites-available/admin-portal > /dev/null <<'EOF'
server {
    listen 80;
    server_name _;

    root /var/www;
    index index.html;

    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json application/javascript;

    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    location ~* ^/admin/assets/.*\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        alias /var/www/admin-portal;
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    location /admin {
        alias /var/www/admin-portal;
        try_files $uri $uri/ @admin_fallback;
    }

    location @admin_fallback {
        rewrite ^/admin(.*)$ /admin/index.html last;
    }

    location = /admin/index.html {
        alias /var/www/admin-portal/index.html;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header Pragma "no-cache";
        add_header Expires "0";
    }

    location = / {
        return 301 /admin;
    }

    error_page 404 /admin/index.html;
}
EOF

sudo ln -sf /etc/nginx/sites-available/admin-portal /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl enable nginx
sudo systemctl restart nginx

echo "=== Firewall ==="
sudo ufw allow OpenSSH || true
sudo ufw allow 'Nginx Full' || true
sudo ufw allow 3000/tcp || true
sudo ufw --force enable || true

echo "=== Setup complete ==="
echo "Node: $(node -v)"
echo "npm: $(npm -v)"
echo "mongod: $(systemctl is-active mongod)"
echo "nginx: $(systemctl is-active nginx)"
