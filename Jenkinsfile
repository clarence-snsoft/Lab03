pipeline {
  parameters {
    choice(name: 'SERVICE', choices: ['frontend', 'backend'], description: 'Choose which service to build')
  }

  
  agent {
        kubernetes {
            inheritFrom 'sports'
            defaultContainer 'agent-base'
        }
  }
  
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
        sh 'git config --global --add safe.directory /home/jenkins/agent/workspace/Lab03-CI'
        checkout([$class: 'GitSCM',
          branches: [[name: '*/main']],
          userRemoteConfigs: [[url: "${GIT_REPO}", credentialsId: "${GIT_CRED}"]]
        ])
      }
    }


    stage('Build Docker Image') {
      steps {
        container('docker') {
          script {
            def sha = sh(script: 'git rev-parse --short HEAD', returnStdout: true).trim()
            env.IMAGE_TAG = "${sha}-${env.BUILD_NUMBER}"
    
            // 根據參數設定 Dockerfile 路徑與 image name
            def buildContext = "${params.SERVICE}"
            def dockerfilePath = "${params.SERVICE}/Dockerfile"
            def imageName = "lab03-${params.SERVICE}"
    
            sh """
              echo "Building ${imageName} from ${dockerfilePath}"
              docker build -t docker.io/clarence/${imageName}:${IMAGE_TAG} -f ${dockerfilePath} ${buildContext}
            """
          }
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
