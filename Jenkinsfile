pipeline {
    agent any

    options {
        timestamps()
        disableConcurrentBuilds()
    }

    parameters {
        string(name: 'DOCKER_TAG', defaultValue: 'v1.1.0', description: 'EduSprint image tag')
    }

    environment {
        APP_NAME  = 'edusprint'
        IMAGE_NAME = 'edusprint-platform'
        IMAGE_TAG = "${params.DOCKER_TAG}"
        PORT = '5000'
        SONAR_HOST = 'http://127.0.0.1:9000'
    }

    stages {
        stage('Checkout Code') {
            steps {
                checkout scm
                sh 'git rev-parse --short HEAD'
            }
        }

        stage('Verify Build Environment') {
            steps {
                sh '''
                    set -eu
                    docker --version
                    docker info >/dev/null
                    test -f Dockerfile
                    test -f frontend/package-lock.json
                    test -f backend/package-lock.json
                '''
            }
        }

        stage('SonarQube SAST Scan') {
            steps {
                withCredentials([string(credentialsId: 'sonarqube-token', variable: 'SONAR_TOKEN')]) {
                    sh '''
                        set -eu
                        docker run --rm --network host \
                          -e SONAR_HOST_URL="$SONAR_HOST" \
                          -e SONAR_TOKEN="$SONAR_TOKEN" \
                          -v "$WORKSPACE:/usr/src" \
                          sonarsource/sonar-scanner-cli:latest \
                          -Dsonar.projectKey=edusprint-platform \
                          -Dsonar.projectName=EduSprint \
                          -Dsonar.projectBaseDir=/usr/src \
                          -Dsonar.sources=frontend/src,backend/src \
                          -Dsonar.exclusions=**/node_modules/**,**/dist/**,**/public/**
                    '''
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                sh '''
                    set -eu
                    docker build --pull \
                      -t "$IMAGE_NAME:$IMAGE_TAG" \
                      -t "$IMAGE_NAME:latest" .
                '''
            }
        }

        stage('Trivy Vulnerability Scan') {
            steps {
                sh '''
                    set -eu
                    curl -fsSL \
                      -o html.tpl \
                      https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/html.tpl

                    docker run --rm \
                      -v /var/run/docker.sock:/var/run/docker.sock \
                      -v "$WORKSPACE:/reports" \
                      aquasec/trivy:latest image \
                      --format template \
                      --template "@/reports/html.tpl" \
                      --output /reports/trivy-report.html \
                      "$IMAGE_NAME:$IMAGE_TAG"

                    docker run --rm \
                      -v /var/run/docker.sock:/var/run/docker.sock \
                      -v "$WORKSPACE:/reports" \
                      aquasec/trivy:latest image \
                      --format json \
                      --output /reports/trivy-report.json \
                      "$IMAGE_NAME:$IMAGE_TAG"
                '''
            }
        }

        stage('Critical Vulnerability Gate') {
            steps {
                sh '''
                    set -eu
                    docker run --rm \
                      -v /var/run/docker.sock:/var/run/docker.sock \
                      aquasec/trivy:latest image \
                      --ignore-unfixed \
                      --severity CRITICAL \
                      --exit-code 1 \
                      "$IMAGE_NAME:$IMAGE_TAG"
                '''
            }
        }

        stage('Deploy EduSprint') {
            steps {
                sh '''
                    set -eu

                    docker volume create edusprint_data >/dev/null
                    docker rm -f "${APP_NAME}-live" >/dev/null 2>&1 || true

                    docker run -d \
                      --name "${APP_NAME}-live" \
                      -p "${PORT}:5000" \
                      --restart unless-stopped \
                      -v edusprint_data:/app/data \
                      "$IMAGE_NAME:$IMAGE_TAG"

                    healthy=0
                    for attempt in $(seq 1 20); do
                        if curl -fsS "http://127.0.0.1:${PORT}/api/health"; then
                            healthy=1
                            break
                        fi
                        sleep 3
                    done

                    if [ "$healthy" -ne 1 ]; then
                        docker logs --tail 100 "${APP_NAME}-live"
                        exit 1
                    fi
                '''
            }
        }
    }

    post {
        success {
            echo 'EduSprint CI/CD pipeline completed successfully.'
        }
        failure {
            echo 'Pipeline failed. Review the first failed stage and its security/build logs.'
        }
        always {
            archiveArtifacts artifacts: 'trivy-report.html,trivy-report.json', allowEmptyArchive: true, fingerprint: true
        }
    }
}
