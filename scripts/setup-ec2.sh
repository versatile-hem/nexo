#!/bin/bash

# Nexo SPA - EC2 Setup Script
# Run this script on your EC2 instance to prepare it for deployment

set -e

echo "🚀 Starting Nexo SPA EC2 Setup..."

# Update system packages
echo "📦 Updating system packages..."
sudo apt-get update
sudo apt-get upgrade -y

# Install Node.js and npm
echo "📥 Installing Node.js and npm..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installations
echo "✅ Verifying installations..."
node --version
npm --version

# Install PM2 globally for process management
echo "📥 Installing PM2..."
sudo npm install -g pm2

# Install Git
echo "📥 Installing Git..."
sudo apt-get install -y git

# Create application directory
APP_DIR="/home/ubuntu/nexo-app"
echo "📁 Creating application directory at $APP_DIR..."
sudo mkdir -p $APP_DIR
sudo chown ubuntu:ubuntu $APP_DIR

# Clone repository (you'll need to set up SSH key first)
echo "📥 Cloning repository..."
cd $APP_DIR
git clone https://github.com/versatile-hem/nexo.git .

# Configure PM2
echo "⚙️  Configuring PM2..."
pm2 startup
pm2 save

# Install application dependencies
echo "📥 Installing application dependencies..."
npm install --production

# Build application
echo "🔨 Building application..."
npm run build

# Start application with PM2
echo "🚀 Starting application..."
pm2 start npm --name "nexo-spa" -- run dev

# Display PM2 status
pm2 status

echo ""
echo "✅ EC2 setup completed successfully!"
echo ""
echo "📋 Application Information:"
echo "   - App Directory: $APP_DIR"
echo "   - Service Name: nexo-spa"
echo "   - Process Manager: PM2"
echo ""
echo "🔧 Useful PM2 Commands:"
echo "   pm2 logs nexo-spa          # View logs"
echo "   pm2 restart nexo-spa       # Restart service"
echo "   pm2 stop nexo-spa          # Stop service"
echo "   pm2 delete nexo-spa        # Remove service"
echo "   pm2 status                 # Show all services"
echo ""
