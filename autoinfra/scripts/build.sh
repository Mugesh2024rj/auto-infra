#!/bin/bash

# AutoInfra Build Script
# This script handles building and testing applications locally

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

detect_project_type() {
    log_info "Detecting project type..."
    
    if [ -f "package.json" ]; then
        PROJECT_TYPE="nodejs"
        if grep -q "react" package.json; then
            FRAMEWORK="react"
        elif grep -q "express" package.json; then
            FRAMEWORK="express"
        else
            FRAMEWORK="nodejs"
        fi
    elif [ -f "requirements.txt" ] || [ -f "setup.py" ]; then
        PROJECT_TYPE="python"
        FRAMEWORK="python"
    elif [ -f "pom.xml" ]; then
        PROJECT_TYPE="java"
        FRAMEWORK="maven"
    elif [ -f "build.gradle" ]; then
        PROJECT_TYPE="java"
        FRAMEWORK="gradle"
    elif [ -f "go.mod" ]; then
        PROJECT_TYPE="go"
        FRAMEWORK="go"
    elif [ -f "composer.json" ]; then
        PROJECT_TYPE="php"
        FRAMEWORK="php"
    else
        PROJECT_TYPE="generic"
        FRAMEWORK="generic"
    fi
    
    log_success "Detected: $PROJECT_TYPE ($FRAMEWORK)"
}

install_dependencies() {
    log_info "Installing dependencies..."
    
    case $PROJECT_TYPE in
        "nodejs")
            if [ -f "package-lock.json" ]; then
                npm ci
            else
                npm install
            fi
            ;;
        "python")
            if [ -f "requirements.txt" ]; then
                pip install -r requirements.txt
            fi
            if [ -f "setup.py" ]; then
                pip install -e .
            fi
            ;;
        "java")
            if [ "$FRAMEWORK" = "maven" ]; then
                mvn dependency:resolve
            elif [ "$FRAMEWORK" = "gradle" ]; then
                ./gradlew dependencies
            fi
            ;;
        "go")
            go mod download
            ;;
        "php")
            if [ -f "composer.json" ]; then
                composer install
            fi
            ;;
        *)
            log_warning "No dependency installation for $PROJECT_TYPE"
            ;;
    esac
    
    log_success "Dependencies installed"
}

run_linting() {
    log_info "Running code linting..."
    
    case $PROJECT_TYPE in
        "nodejs")
            if npm list eslint &>/dev/null; then
                npm run lint 2>/dev/null || npx eslint . || log_warning "Linting completed with issues"
            else
                log_warning "ESLint not found, skipping linting"
            fi
            ;;
        "python")
            if command -v flake8 &> /dev/null; then
                flake8 . || log_warning "Linting completed with issues"
            elif command -v pylint &> /dev/null; then
                pylint **/*.py || log_warning "Linting completed with issues"
            else
                log_warning "No Python linter found, skipping linting"
            fi
            ;;
        "java")
            if [ "$FRAMEWORK" = "maven" ]; then
                mvn checkstyle:check 2>/dev/null || log_warning "Checkstyle completed with issues"
            fi
            ;;
        "go")
            go fmt ./...
            if command -v golint &> /dev/null; then
                golint ./... || log_warning "Linting completed with issues"
            fi
            ;;
        *)
            log_warning "No linting configured for $PROJECT_TYPE"
            ;;
    esac
    
    log_success "Linting completed"
}

run_tests() {
    log_info "Running tests..."
    
    case $PROJECT_TYPE in
        "nodejs")
            if npm run test --silent 2>/dev/null; then
                npm test
            else
                log_warning "No test script found"
            fi
            ;;
        "python")
            if command -v pytest &> /dev/null; then
                pytest
            elif [ -f "test.py" ]; then
                python test.py
            else
                python -m unittest discover 2>/dev/null || log_warning "No tests found"
            fi
            ;;
        "java")
            if [ "$FRAMEWORK" = "maven" ]; then
                mvn test
            elif [ "$FRAMEWORK" = "gradle" ]; then
                ./gradlew test
            fi
            ;;
        "go")
            go test ./...
            ;;
        "php")
            if [ -f "phpunit.xml" ]; then
                phpunit
            else
                log_warning "No PHPUnit configuration found"
            fi
            ;;
        *)
            log_warning "No test configuration for $PROJECT_TYPE"
            ;;
    esac
    
    log_success "Tests completed"
}

build_application() {
    log_info "Building application..."
    
    case $PROJECT_TYPE in
        "nodejs")
            if npm run build --silent 2>/dev/null; then
                npm run build
            else
                log_warning "No build script found"
            fi
            ;;
        "python")
            if [ -f "setup.py" ]; then
                python setup.py build
            else
                log_info "No build step required for Python"
            fi
            ;;
        "java")
            if [ "$FRAMEWORK" = "maven" ]; then
                mvn clean package -DskipTests
            elif [ "$FRAMEWORK" = "gradle" ]; then
                ./gradlew build -x test
            fi
            ;;
        "go")
            go build -o main .
            ;;
        "php")
            log_info "No build step required for PHP"
            ;;
        *)
            log_warning "No build configuration for $PROJECT_TYPE"
            ;;
    esac
    
    log_success "Build completed"
}

run_security_checks() {
    log_info "Running security checks..."
    
    case $PROJECT_TYPE in
        "nodejs")
            npm audit --audit-level=high || log_warning "Security vulnerabilities found"
            ;;
        "python")
            if command -v safety &> /dev/null; then
                safety check || log_warning "Security vulnerabilities found"
            else
                log_warning "Safety not installed, skipping security check"
            fi
            ;;
        "java")
            if [ "$FRAMEWORK" = "maven" ]; then
                mvn org.owasp:dependency-check-maven:check 2>/dev/null || log_warning "Security check completed with findings"
            fi
            ;;
        "go")
            if command -v gosec &> /dev/null; then
                gosec ./... || log_warning "Security issues found"
            else
                log_warning "Gosec not installed, skipping security check"
            fi
            ;;
        *)
            log_warning "No security checks configured for $PROJECT_TYPE"
            ;;
    esac
    
    log_success "Security checks completed"
}

generate_dockerfile() {
    if [ ! -f "Dockerfile" ]; then
        log_info "Generating Dockerfile..."
        
        case $PROJECT_TYPE in
            "nodejs")
                if [ "$FRAMEWORK" = "react" ]; then
                    cat > Dockerfile << 'EOF'
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
EOF
                else
                    cat > Dockerfile << 'EOF'
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
EOF
                fi
                ;;
            "python")
                cat > Dockerfile << 'EOF'
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["python", "app.py"]
EOF
                ;;
            "java")
                if [ "$FRAMEWORK" = "maven" ]; then
                    cat > Dockerfile << 'EOF'
FROM maven:3.8-openjdk-17 AS builder
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

FROM openjdk:17-jre-slim
WORKDIR /app
COPY --from=builder /app/target/*.jar app.jar
EXPOSE 8080
CMD ["java", "-jar", "app.jar"]
EOF
                else
                    cat > Dockerfile << 'EOF'
FROM gradle:7-jdk17 AS builder
WORKDIR /app
COPY build.gradle settings.gradle ./
COPY src ./src
RUN gradle build --no-daemon

FROM openjdk:17-jre-slim
WORKDIR /app
COPY --from=builder /app/build/libs/*.jar app.jar
EXPOSE 8080
CMD ["java", "-jar", "app.jar"]
EOF
                fi
                ;;
            "go")
                cat > Dockerfile << 'EOF'
FROM golang:1.21-alpine AS builder
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
CMD ["./main"]
EOF
                ;;
            *)
                cat > Dockerfile << 'EOF'
FROM alpine:latest
WORKDIR /app
COPY . .
EXPOSE 8080
CMD ["echo", "Please configure your application"]
EOF
                ;;
        esac
        
        log_success "Dockerfile generated"
    else
        log_info "Dockerfile already exists"
    fi
}

show_build_summary() {
    log_success "🎉 Build Summary"
    echo "=================================="
    echo "Project Type: $PROJECT_TYPE ($FRAMEWORK)"
    echo "Build Status: Success"
    echo "Dockerfile: $([ -f "Dockerfile" ] && echo "Generated" || echo "Not generated")"
    echo "=================================="
}

# Main build process
main() {
    log_info "🔨 Starting AutoInfra build process"
    
    detect_project_type
    install_dependencies
    run_linting
    run_tests
    build_application
    run_security_checks
    generate_dockerfile
    show_build_summary
    
    log_success "🎉 Build completed successfully!"
}

# Handle script arguments
case "${1:-}" in
    "help"|"-h"|"--help")
        echo "Usage: $0 [COMMAND]"
        echo ""
        echo "Commands:"
        echo "  help          Show this help message"
        echo "  deps          Install dependencies only"
        echo "  lint          Run linting only"
        echo "  test          Run tests only"
        echo "  build         Build application only"
        echo "  security      Run security checks only"
        echo "  dockerfile    Generate Dockerfile only"
        echo ""
        echo "Examples:"
        echo "  $0            # Run full build process"
        echo "  $0 test       # Run tests only"
        echo "  $0 dockerfile # Generate Dockerfile only"
        exit 0
        ;;
    "deps")
        detect_project_type
        install_dependencies
        ;;
    "lint")
        detect_project_type
        run_linting
        ;;
    "test")
        detect_project_type
        run_tests
        ;;
    "build")
        detect_project_type
        build_application
        ;;
    "security")
        detect_project_type
        run_security_checks
        ;;
    "dockerfile")
        detect_project_type
        generate_dockerfile
        ;;
    *)
        main "$@"
        ;;
esac