pipeline {
  agent any
  stages {
    stage('build & test') {
      agent {
        docker {
          image 'node:8-alpine'
        }
        
      }
      steps {
        sh 'npm install'
        sh 'npm run dist'
      }
    }
  }
}