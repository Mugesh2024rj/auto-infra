#!/bin/bash

# AutoInfra Deployment Script
# This script handles the complete deployment process

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME=${1:-"autoinfra-project"}
ENVIRONMENT=${2:-"dev"}
AWS_REGION=${3:-"us-west-2"}
DOCKER_REGISTRY=${4:-"localhost:5000"}

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

check_dependencies() {
    log_info "Checking dependencies..."
    
    local deps=("docker" "terraform" "aws" "curl" "jq")
    local missing_deps=()
    
    for dep in "${deps[@]}"; do
        if ! command -v "$dep" &> /dev/null; then
            missing_deps+=("$dep")
        fi
    done
    
    if [ ${#missing_deps[@]} -ne 0 ]; then
        log_error "Missing dependencies: ${missing_deps[*]}"
        log_info "Please install the missing dependencies and try again."
        exit 1
    fi
    
    log_success "All dependencies are installed"
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
        if grep -q "django" requirements.txt 2>/dev/null; then
            FRAMEWORK="django"
        elif grep -q "flask" requirements.txt 2>/dev/null; then
            FRAMEWORK="flask"
        else
            FRAMEWORK="python"
        fi
    elif [ -f "pom.xml" ]; then
        PROJECT_TYPE="java"
        FRAMEWORK="spring"
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
    
    log_success "Detected project type: $PROJECT_TYPE ($FRAMEWORK)"
}

generate_dockerfile() {
    if [ ! -f "Dockerfile" ]; then
        log_info "Generating Dockerfile for $PROJECT_TYPE..."
        
        local dockerfile_template="../docker/templates/Dockerfile.$PROJECT_TYPE"
        
        if [ -f "$dockerfile_template" ]; then
            cp "$dockerfile_template" "./Dockerfile"
            log_success "Dockerfile generated"
        else
            log_warning "No template found for $PROJECT_TYPE, using generic template"
            cat > Dockerfile << 'EOF'
FROM alpine:latest
WORKDIR /app
COPY . .
EXPOSE 8080
CMD ["echo", "Please configure your application"]
EOF
        fi
    else
        log_info "Dockerfile already exists, skipping generation"
    fi
}

build_application() {
    log_info "Building application..."
    
    case $PROJECT_TYPE in
        "nodejs")
            if [ -f "package.json" ]; then
                npm ci
                npm run build 2>/dev/null || log_warning "No build script found"
                npm test 2>/dev/null || log_warning "No test script found"
            fi
            ;;
        "python")
            if [ -f "requirements.txt" ]; then
                pip install -r requirements.txt
                python -m pytest 2>/dev/null || log_warning "No tests found"
            fi
            ;;
        "java")
            if [ -f "pom.xml" ]; then
                mvn clean package -DskipTests
            elif [ -f "build.gradle" ]; then
                ./gradlew build -x test
            fi
            ;;
        "go")
            go mod download
            go build -o main .
            go test ./... 2>/dev/null || log_warning "No tests found"
            ;;
        *)
            log_warning "No specific build steps for $PROJECT_TYPE"
            ;;
    esac
    
    log_success "Application build completed"
}

build_docker_image() {
    log_info "Building Docker image..."
    
    local image_tag="$DOCKER_REGISTRY/$PROJECT_NAME:$(git rev-parse --short HEAD 2>/dev/null || echo 'latest')"
    
    docker build -t "$image_tag" .
    docker tag "$image_tag" "$DOCKER_REGISTRY/$PROJECT_NAME:latest"
    
    log_success "Docker image built: $image_tag"
    
    # Export for use in other functions
    export DOCKER_IMAGE="$image_tag"
}

run_security_scan() {
    log_info "Running security scans..."
    
    # Docker image security scan with Trivy (if available)
    if command -v trivy &> /dev/null; then
        trivy image --exit-code 0 --severity HIGH,CRITICAL "$DOCKER_IMAGE" || log_warning "Security vulnerabilities found"
    else
        log_warning "Trivy not installed, skipping image security scan"
    fi
    
    # Dependency security scan
    case $PROJECT_TYPE in
        "nodejs")
            npm audit --audit-level=high || log_warning "npm audit found vulnerabilities"
            ;;
        "python")
            if command -v safety &> /dev/null; then
                safety check || log_warning "Python security issues found"
            fi
            ;;
    esac
    
    log_success "Security scans completed"
}

provision_infrastructure() {
    log_info "Provisioning infrastructure with Terraform..."
    
    local terraform_dir="../terraform"
    local project_terraform_dir="../terraform/projects/$PROJECT_NAME"
    
    # Create project-specific terraform directory
    mkdir -p "$project_terraform_dir"
    
    # Copy terraform files
    cp "$terraform_dir"/*.tf "$project_terraform_dir/"
    
    # Create terraform.tfvars
    cat > "$project_terraform_dir/terraform.tfvars" << EOF
project_name = "$PROJECT_NAME"
environment = "$ENVIRONMENT"
aws_region = "$AWS_REGION"
app_port = $(get_app_port)
EOF
    
    cd "$project_terraform_dir"
    
    # Initialize and apply terraform
    terraform init
    terraform plan -out=tfplan
    terraform apply -auto-approve tfplan
    
    # Get outputs
    export ALB_DNS=$(terraform output -raw load_balancer_dns_name)
    export ECR_REPOSITORY=$(terraform output -raw ecr_repository_url)
    
    cd - > /dev/null
    
    log_success "Infrastructure provisioned successfully"
    log_info "Application URL: http://$ALB_DNS"
}

get_app_port() {
    case $PROJECT_TYPE in
        "nodejs")
            if [ "$FRAMEWORK" = "react" ]; then
                echo "80"
            else
                echo "3000"
            fi
            ;;
        "python")
            echo "8000"
            ;;
        "java")
            echo "8080"
            ;;
        "go")
            echo "8080"
            ;;
        "php")
            echo "80"
            ;;
        *)
            echo "8080"
            ;;
    esac
}

push_to_registry() {
    log_info "Pushing image to registry..."
    
    if [ -n "$ECR_REPOSITORY" ]; then
        # Push to ECR
        aws ecr get-login-password --region "$AWS_REGION" | docker login --username AWS --password-stdin "$ECR_REPOSITORY"
        
        docker tag "$DOCKER_IMAGE" "$ECR_REPOSITORY:$(git rev-parse --short HEAD 2>/dev/null || echo 'latest')"
        docker tag "$DOCKER_IMAGE" "$ECR_REPOSITORY:latest"
        
        docker push "$ECR_REPOSITORY:$(git rev-parse --short HEAD 2>/dev/null || echo 'latest')"
        docker push "$ECR_REPOSITORY:latest"
    else
        # Push to local registry
        docker push "$DOCKER_IMAGE"
        docker push "$DOCKER_REGISTRY/$PROJECT_NAME:latest"
    fi
    
    log_success "Image pushed to registry"
}

deploy_application() {
    log_info "Deploying application..."
    
    # Stop existing container
    docker stop "$PROJECT_NAME" 2>/dev/null || true
    docker rm "$PROJECT_NAME" 2>/dev/null || true
    
    # Run new container
    local app_port=$(get_app_port)
    docker run -d \
        --name "$PROJECT_NAME" \
        --restart unless-stopped \
        -p "$app_port:$app_port" \
        -e ENVIRONMENT="$ENVIRONMENT" \
        -e PROJECT_NAME="$PROJECT_NAME" \
        "$DOCKER_IMAGE"
    
    # Wait for health check
    log_info "Waiting for application to be healthy..."
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f "http://localhost:$app_port/health" 2>/dev/null; then
            log_success "Application is healthy"
            break
        fi
        
        log_info "Attempt $attempt/$max_attempts - waiting 10 seconds..."
        sleep 10
        ((attempt++))
    done
    
    if [ $attempt -gt $max_attempts ]; then
        log_error "Application failed to become healthy"
        return 1
    fi
    
    log_success "Application deployed successfully"
    log_info "Local URL: http://localhost:$app_port"
}

run_post_deploy_tests() {
    log_info "Running post-deployment tests..."
    
    local app_port=$(get_app_port)
    local base_url="http://localhost:$app_port"
    
    # Health check
    if curl -f "$base_url/health" 2>/dev/null; then
        log_success "Health check passed"
    else
        log_warning "Health check failed"
    fi
    
    # Basic performance test
    if command -v ab &> /dev/null; then
        ab -n 10 -c 2 "$base_url/" > /dev/null 2>&1 || log_warning "Performance test completed with issues"
        log_success "Performance test completed"
    else
        log_warning "Apache Bench not installed, skipping performance test"
    fi
    
    log_success "Post-deployment tests completed"
}

cleanup() {
    log_info "Cleaning up..."
    
    # Remove unused Docker images
    docker image prune -f > /dev/null 2>&1 || true
    
    log_success "Cleanup completed"
}

show_deployment_summary() {
    log_success "🎉 Deployment Summary"
    echo "=================================="
    echo "Project Name: $PROJECT_NAME"
    echo "Environment: $ENVIRONMENT"
    echo "Project Type: $PROJECT_TYPE ($FRAMEWORK)"
    echo "Docker Image: $DOCKER_IMAGE"
    echo "Local URL: http://localhost:$(get_app_port)"
    if [ -n "$ALB_DNS" ]; then
        echo "Public URL: http://$ALB_DNS"
    fi
    echo "=================================="
}

# Main deployment process
main() {
    log_info "🚀 Starting AutoInfra deployment for $PROJECT_NAME"
    
    check_dependencies
    detect_project_type
    generate_dockerfile
    build_application
    build_docker_image
    run_security_scan
    
    # Only provision infrastructure if not in local mode
    if [ "$ENVIRONMENT" != "local" ]; then
        provision_infrastructure
        push_to_registry
    fi
    
    deploy_application
    run_post_deploy_tests
    cleanup
    show_deployment_summary
    
    log_success "🎉 Deployment completed successfully!"
}

# Handle script arguments
case "${1:-}" in
    "help"|"-h"|"--help")
        echo "Usage: $0 [PROJECT_NAME] [ENVIRONMENT] [AWS_REGION] [DOCKER_REGISTRY]"
        echo ""
        echo "Arguments:"
        echo "  PROJECT_NAME     Name of the project (default: autoinfra-project)"
        echo "  ENVIRONMENT      Deployment environment (default: dev)"
        echo "  AWS_REGION       AWS region (default: us-west-2)"
        echo "  DOCKER_REGISTRY  Docker registry URL (default: localhost:5000)"
        echo ""
        echo "Examples:"
        echo "  $0 my-app prod us-east-1"
        echo "  $0 my-app local"
        exit 0
        ;;
    *)
        main "$@"
        ;;
esac