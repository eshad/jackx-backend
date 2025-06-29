pipeline {
  agent any

  environment {
    COMPOSE_FILE = 'docker-compose.yml'
    BRANCH = "${env.GIT_BRANCH}".replaceFirst(/^origin\//, '')
  }

  stages {
    stage('Info') {
      steps {
        echo "Deploying branch: ${env.BRANCH}"
      }
    }

    stage('Build') {
      steps {
        sh 'docker compose -f $COMPOSE_FILE build'
      }
    }

    stage('Deploy') {
      steps {
        sh 'docker compose -f $COMPOSE_FILE down'
        sh 'docker compose -f $COMPOSE_FILE up -d'
      }
    }
  }
}
