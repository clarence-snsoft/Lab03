pipeline {
  agent any

  environment {
    REGISTRY = "docker.io/clarence"              // 你的 DockerHub namespace
    IMAGE_NAME = "lab03-frontend"                // 改為 lab03-backend 也可
    GIT_CRED = "clarence-github-cred"            // Jenkins Credential ID (GitHub)
    DOCKERHUB_CRED = "clarence-dockerhub-cred"   // Jenkins Credential ID (DockerHub)
    GIT_REPO = "https://github.com/clarence-snsoft/Lab03.git"
  }

  stages {
    stage('Checkout') {
      steps {
        checkout([$class: 'GitSCM',
          branches: [[name: '*/main']],
          userRemoteConfigs: [[url: "${GIT_REPO}", credentialsId: "${GIT_CRED}"]]
        ])
      }
    }

    stage('Build Docker Image') {
      steps {
        script {
          COMMIT_SHA = sh(script: 'git rev-parse --short HEAD', returnStdout: true).trim()
          IMAGE_TAG = "${COMMIT_SHA}-${env.BUILD_NUMBER}"
          sh """
            docker build -t ${REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG} .
          """
        }
      }
    }

    stage('Push to DockerHub') {
      steps {
        script {
          withCredentials([usernamePassword(credentialsId: "${DOCKERHUB_CRED}", usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
            sh """
              echo "${DOCKER_PASS}" | docker login -u "${DOCKER_USER}" --password-stdin
              docker push ${REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}
              docker logout
            """
          }
        }
      }
    }

    stage('Update deployment.yaml') {
      steps {
        script {
          sh """
            yq -i '.spec.template.spec.containers[0].image = "${REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}"' k8s/deployment.yaml
          """
        }
      }
    }

    stage('Commit and Push Changes to GitHub') {
      steps {
        script {
          withCredentials([usernamePassword(credentialsId: "${GIT_CRED}", usernameVariable: 'GIT_USER', passwordVariable: 'GIT_TOKEN')]) {
            sh """
              git config --global user.email "jenkins@snsoft.com"
              git config --global user.name "Jenkins"
              git add k8s/deployment.yaml
              git commit -m "Update image tag to ${IMAGE_TAG}"
              git push https://${GIT_USER}:${GIT_TOKEN}@github.com/clarence-snsoft/Lab03.git HEAD:main
            """
          }
        }
      }
    }
  }
}
