# AWS EC2 Deployment Guide for Nexo SPA

## Overview
This guide will help you set up continuous deployment from GitHub to AWS EC2 using GitHub Actions.

---

## Prerequisites

1. **AWS Account** - with access to EC2
2. **GitHub Account** - with repository access
3. **EC2 Instance** - Running Ubuntu 20.04 LTS or later
4. **SSH Key Pair** - For EC2 access

---

## Step 1: EC2 Instance Setup

### 1.1 Launch EC2 Instance

1. Go to AWS Console → EC2 → Instances
2. Click "Launch Instances"
3. **AMI Selection**: Choose "Ubuntu Server 22.04 LTS"
4. **Instance Type**: Select `t3.medium` (or larger depending on traffic)
5. **Security Group**: Create new with these inbound rules:
   - SSH (22): From your IP
   - HTTP (80): From 0.0.0.0/0
   - HTTPS (443): From 0.0.0.0/0
6. **Key Pair**: Create or select existing
7. **Storage**: At least 30GB GP3
8. Launch instance and wait for it to start

### 1.2 Get Your EC2 Details

After instance is running:
- **Public IP**: Click instance → Copy "Public IPv4 address"
- **SSH Key**: Download and save `.pem` file locally
- **User**: `ubuntu` (default for Ubuntu AMIs)

---

## Step 2: Prepare EC2 Instance

### 2.1 Connect to your EC2 Instance

```bash
# Set permissions on SSH key
chmod 400 /path/to/your-key.pem

# SSH into instance
ssh -i /path/to/your-key.pem ubuntu@YOUR_EC2_PUBLIC_IP
```

### 2.2 Run Setup Script

```bash
# Download and run setup script
wget https://raw.githubusercontent.com/versatile-hem/nexo/main/scripts/setup-ec2.sh
chmod +x setup-ec2.sh
./setup-ec2.sh
```

Or run commands manually:

```bash
# Update system
sudo apt-get update && sudo apt-get upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2

# Create app directory
mkdir -p ~/nexo-app
cd ~/nexo-app

# Clone repository
git clone https://github.com/versatile-hem/nexo.git .

# Install and build
npm install
npm run build

# Start with PM2
pm2 start npm --name "nexo-spa" -- run dev
pm2 startup
pm2 save
```

---

## Step 3: Configure GitHub Secrets

### 3.1 Generate SSH Deploy Key

```bash
# On your local machine, generate SSH key for GitHub Actions
ssh-keygen -t ed25519 -C "github-actions-deploy" -f deploy_key -N ""

# Add public key to EC2
cat deploy_key.pub | ssh -i /path/to/your-key.pem ubuntu@YOUR_EC2_IP 'cat >> ~/.ssh/authorized_keys'

# Display private key for GitHub
cat deploy_key
```

### 3.2 Add Secrets to GitHub

1. Go to GitHub → Your Repository → Settings → Secrets and variables → Actions
2. Create these secrets:

| Secret Name | Value |
|---|---|
| `EC2_HOST` | Your EC2 Public IP (e.g., `1.2.3.4`) |
| `EC2_USER` | `ubuntu` |
| `EC2_SSH_KEY` | Content of your private `deploy_key` file |
| `EC2_APP_DIR` | `/home/ubuntu/nexo-app` |

**Example screenshots:**
- Click "New repository secret"
- Name: `EC2_HOST`
- Value: paste your EC2 public IP
- Click "Add secret"

---

## Step 4: Test Deployment

### 4.1 Trigger Deployment

```bash
# Push to main branch to trigger workflow
git push origin main

# Or manually trigger via GitHub:
# 1. Go to Actions tab
# 2. Select "Deploy to AWS EC2" workflow
# 3. Click "Run workflow"
```

### 4.2 Monitor Deployment

1. Go to GitHub → Actions
2. Click the running workflow
3. Expand "Deploy to EC2" step
4. Watch the logs in real-time

---

## Step 5: Verify Deployment

### 5.1 Check Application Status

```bash
# SSH into EC2
ssh -i /path/to/your-key.pem ubuntu@YOUR_EC2_PUBLIC_IP

# Check PM2 status
pm2 status

# View logs
pm2 logs nexo-spa
```

### 5.2 Access Application

- **Local**: `http://YOUR_EC2_PUBLIC_IP:5173`
- **With Domain**: Set up Route53/CloudFront for custom domain

---

## Troubleshooting

### Issue: "SSH key permission denied"
```bash
chmod 600 ~/.ssh/deploy_key
ssh-add ~/.ssh/deploy_key
```

### Issue: "npm: command not found"
```bash
# Install Node.js again
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### Issue: "PM2 process not starting"
```bash
# Check logs
pm2 logs nexo-spa --lines 100

# Restart
pm2 restart nexo-spa

# Or start manually
cd ~/nexo-app
npm run dev
```

### Issue: "Port 5173 not accessible"
- Check Security Group allows port 5173 inbound
- Check EC2 has public IP assigned
- Verify app is running: `pm2 status`

---

## Production Setup (Optional)

### Use Nginx Reverse Proxy

```bash
# Install Nginx
sudo apt-get install -y nginx

# Create config
sudo tee /etc/nginx/sites-available/nexo-spa > /dev/null << EOF
server {
    listen 80;
    server_name YOUR_DOMAIN_OR_IP;

    location / {
        proxy_pass http://localhost:5173;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Enable site
sudo ln -s /etc/nginx/sites-available/nexo-spa /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Setup SSL with Let's Encrypt

```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d YOUR_DOMAIN
```

---

## Manual Deployment Steps (If needed)

```bash
# SSH into EC2
ssh -i deploy_key.pem ubuntu@YOUR_EC2_IP

# Navigate to app
cd ~/nexo-app

# Pull latest code
git fetch origin
git checkout main
git pull origin main

# Install dependencies
npm install

# Build
npm run build

# Restart PM2
pm2 restart nexo-spa
```

---

## Useful Commands

```bash
# View all PM2 processes
pm2 status

# View real-time logs
pm2 logs nexo-spa --follow

# Stop all processes
pm2 stop all

# Restart all processes
pm2 restart all

# Delete a process
pm2 delete nexo-spa

# List saved PM2 configs
pm2 save && pm2 resurrect
```

---

## Support & Documentation

- **GitHub Actions Docs**: https://docs.github.com/en/actions
- **AWS EC2 Docs**: https://docs.aws.amazon.com/ec2/
- **PM2 Docs**: https://pm2.keymetrics.io/docs/
- **Node.js Docs**: https://nodejs.org/docs/

---

## Next Steps

1. ✅ Set up EC2 instance
2. ✅ Configure GitHub secrets
3. ✅ Push code to trigger deployment
4. ✅ Monitor logs and verify application
5. ⏭️ Set up custom domain (optional)
6. ⏭️ Configure SSL certificate (optional)
7. ⏭️ Set up monitoring/alerts (optional)

---

**Questions?** Check the troubleshooting section or contact your DevOps team.
