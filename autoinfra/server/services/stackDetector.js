const fs = require('fs').promises;
const path = require('path');

class StackDetector {
  async detectStack(projectPath) {
    const files = await this.getProjectFiles(projectPath);
    const stack = {
      type: 'unknown',
      framework: null,
      runtime: null,
      buildTool: null,
      hasDockerfile: false,
      dependencies: []
    };

    // Check for Dockerfile
    if (files.includes('Dockerfile') || files.includes('dockerfile')) {
      stack.hasDockerfile = true;
    }

    // Node.js detection
    if (files.includes('package.json')) {
      stack.type = 'nodejs';
      stack.runtime = 'node';
      
      try {
        const packageJson = JSON.parse(
          await fs.readFile(path.join(projectPath, 'package.json'), 'utf8')
        );
        
        stack.dependencies = Object.keys(packageJson.dependencies || {});
        
        // Detect framework
        if (stack.dependencies.includes('react')) {
          stack.framework = 'react';
        } else if (stack.dependencies.includes('express')) {
          stack.framework = 'express';
        } else if (stack.dependencies.includes('next')) {
          stack.framework = 'nextjs';
        } else if (stack.dependencies.includes('vue')) {
          stack.framework = 'vue';
        }
        
        // Detect build tools
        if (files.includes('vite.config.js') || stack.dependencies.includes('vite')) {
          stack.buildTool = 'vite';
        } else if (files.includes('webpack.config.js') || stack.dependencies.includes('webpack')) {
          stack.buildTool = 'webpack';
        }
      } catch (error) {
        console.error('Error parsing package.json:', error);
      }
    }

    // Python detection
    if (files.includes('requirements.txt') || files.includes('setup.py') || files.includes('pyproject.toml')) {
      stack.type = 'python';
      stack.runtime = 'python';
      
      if (files.includes('requirements.txt')) {
        try {
          const requirements = await fs.readFile(path.join(projectPath, 'requirements.txt'), 'utf8');
          stack.dependencies = requirements.split('\n').filter(line => line.trim());
          
          // Detect framework
          if (requirements.includes('django')) {
            stack.framework = 'django';
          } else if (requirements.includes('flask')) {
            stack.framework = 'flask';
          } else if (requirements.includes('fastapi')) {
            stack.framework = 'fastapi';
          }
        } catch (error) {
          console.error('Error reading requirements.txt:', error);
        }
      }
    }

    // Java detection
    if (files.includes('pom.xml')) {
      stack.type = 'java';
      stack.runtime = 'java';
      stack.buildTool = 'maven';
      stack.framework = 'spring'; // Assume Spring for simplicity
    } else if (files.includes('build.gradle')) {
      stack.type = 'java';
      stack.runtime = 'java';
      stack.buildTool = 'gradle';
      stack.framework = 'spring';
    }

    // Go detection
    if (files.includes('go.mod')) {
      stack.type = 'go';
      stack.runtime = 'go';
      stack.buildTool = 'go';
    }

    // PHP detection
    if (files.includes('composer.json')) {
      stack.type = 'php';
      stack.runtime = 'php';
      stack.buildTool = 'composer';
    }

    return stack;
  }

  async getProjectFiles(projectPath) {
    try {
      const files = await fs.readdir(projectPath);
      return files;
    } catch (error) {
      console.error('Error reading project directory:', error);
      return [];
    }
  }

  generateDockerfile(stack) {
    switch (stack.type) {
      case 'nodejs':
        return this.generateNodeDockerfile(stack);
      case 'python':
        return this.generatePythonDockerfile(stack);
      case 'java':
        return this.generateJavaDockerfile(stack);
      case 'go':
        return this.generateGoDockerfile();
      case 'php':
        return this.generatePhpDockerfile();
      default:
        return this.generateGenericDockerfile();
    }
  }

  generateNodeDockerfile(stack) {
    const isReact = stack.framework === 'react';
    
    if (isReact) {
      return `FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY --from=builder /app/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]`;
    } else {
      return `FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]`;
    }
  }

  generatePythonDockerfile(stack) {
    return `FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["python", "app.py"]`;
  }

  generateJavaDockerfile(stack) {
    if (stack.buildTool === 'maven') {
      return `FROM maven:3.8-openjdk-17 AS builder
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

FROM openjdk:17-jre-slim
WORKDIR /app
COPY --from=builder /app/target/*.jar app.jar
EXPOSE 8080
CMD ["java", "-jar", "app.jar"]`;
    } else {
      return `FROM gradle:7-jdk17 AS builder
WORKDIR /app
COPY build.gradle settings.gradle ./
COPY src ./src
RUN gradle build --no-daemon

FROM openjdk:17-jre-slim
WORKDIR /app
COPY --from=builder /app/build/libs/*.jar app.jar
EXPOSE 8080
CMD ["java", "-jar", "app.jar"]`;
    }
  }

  generateGoDockerfile() {
    return `FROM golang:1.21-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN go build -o main .

FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /root/
COPY --from=builder /app/main .
EXPOSE 8080
CMD ["./main"]`;
  }

  generatePhpDockerfile() {
    return `FROM php:8.2-apache
COPY . /var/www/html/
RUN chown -R www-data:www-data /var/www/html
EXPOSE 80`;
  }

  generateGenericDockerfile() {
    return `FROM alpine:latest
WORKDIR /app
COPY . .
EXPOSE 8080
CMD ["echo", "Please configure your application"]`;
  }
}

module.exports = new StackDetector();