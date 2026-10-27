pipeline {
    agent any
     stages {
          stage('Checkout'){
               steps{
                 git branch:'main', url:'https://github.com/Sabir-git/Azure_Bay_Hotel_Website'
               }
          }
          stage('build'){
            steps {
                sh 'docker build -t azure_bay .'
            }
          }
          stage('test'){
            steps {
              sh 'docker run -d -p 8081:80 --name azure-bay azure_bay'
            }
          } 
          stage('verify'){
            steps {
              sh 'docker ps'
            }
          }
     }
}
