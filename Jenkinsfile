pipeline {
  parameters {
    choice(name: 'SERVICE', choices: ['frontend-deployment', 'backend-deployment'], description: 'Choose which service to build')
  }

  agent {
    kubernetes {
      inheritFrom 'sports'
      defaultContainer 'agent-base'
    }
  }

  environment {
    REGISTRY = "docker.io/clarencesns"
    GIT_CRED = "clarence-github-cred"
    DOCKERHUB_CRED = "clarence-dockerhub-cred"
    GIT_REPO = "https://github.com/clarence-snsoft/Lab03.git"
  }

  stages {
    stage('Checkout') {
      steps {
        sh 'git config --global --add safe.directory "*"'
        checkout([$class: 'GitSCM',
          branches: [[name: '*/main']],
          userRemoteConfigs: [[url: "${GIT_REPO}", credentialsId: "${GIT_CRED}"]]
        ])
      }
    }

    stage('Build Docker Image') {
      steps {
        container('agent-base') {
          script {
            def sha = sh(script: 'git rev-parse --short HEAD', returnStdout: true).trim()
            env.IMAGE_TAG = "v${env.BUILD_NUMBER}"
            env.IMAGE_NAME = "${params.SERVICE}"

            def buildContext = "${params.SERVICE}"
            def dockerfilePath = "${params.SERVICE}/Dockerfile"

            sh """
              echo "Building ${IMAGE_NAME} from ${dockerfilePath}"
              docker build -t ${REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG} -f ${dockerfilePath} ${buildContext}
            """
          }
        }
      }
    }

    stage('Push to DockerHub') {
      steps {
        container('agent-base') {
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
        container('agent-base') {
          sh 'apk add --no-cache yq || true'
          sh """
            yq -i 'select(.kind == "Deployment" and .metadata.name == "'${params.SERVICE}'") .spec.template.spec.containers[0].image = "'"${REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}"'"' k8s/deployment.yaml
          """
        }
      }
    }

    stage('Commit and Push Changes to GitHub') {
      steps {
        container('agent-base') {
          withCredentials([usernamePassword(credentialsId: "${GIT_CRED}", usernameVariable: 'GIT_USER', passwordVariable: 'GIT_TOKEN')]) {
            sh """
              git config --global user.email "jenkins@snsoft.com"
              git config --global user.name "Jenkins"
              git add k8s/deployment.yaml
              git commit -m "Update ${IMAGE_NAME} tag to ${IMAGE_TAG}" || echo "No changes"
              git push https://${GIT_USER}:${GIT_TOKEN}@github.com/clarence-snsoft/Lab03.git HEAD:main || echo "Nothing to push"
            """
          }
        }
      }
    }
  }
}
