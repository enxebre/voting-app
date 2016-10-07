#!/usr/bin/groovy
def utils = new io.fabric8.Utils()

slackSend channel: '#voting-app', color: 'good', message: 'Starting build for voting-app ', teamDomain: 'test', token: 'test'

node {
  try {
    def envStage = utils.environmentNamespace('staging')
    def envProd = utils.environmentNamespace('production')

    git GIT_URL

    stage 'Canary release'
    echo 'NOTE: running pipelines for the first time will take longer as build and base docker images are pulled onto the node'
    if (!fileExists ('Dockerfile')) {
      writeFile file: 'Dockerfile', text: 'FROM node:5.3-onbuild'
    }

    def newVersion = performCanaryRelease {}

    def rc = getKubernetesJson {
      port = 80
      label = 'node'
      icon = 'https://cdn.rawgit.com/fabric8io/fabric8/dc05040/website/src/images/logos/nodejs.svg'
      version = newVersion
      imageName = clusterImageName
    }

    stage 'Rolling upgrade Staging'
    kubernetesApply(file: rc, environment: envStage)

    slackSend channel: '#voting-app', color: 'good', message: 'voting-app waiting for approval to deploy into productionhttp://jenkins.default.kuwit.rocks/job/voting-app/', teamDomain: 'test', token: 'test'

    stage 'Approve'
    approve{
      room = test
      version = canaryVersion
      console = 'http://fabric8.default.kuwit.rocks/'
      environment = envStage
    }

    stage 'Rolling upgrade Production'
    kubernetesApply(file: rc, environment: envProd)

    slackSend channel: '#voting-app', color: 'good', message: 'Build finish succesfully for voting-app', teamDomain: 'test', token: 'test'

  } catch (error) {
    slackSend channel: '#voting-app', color: 'bad', message: 'Build failed for voting-app', teamDomain: 'test', token: 'iYkTwzmlN2Mhf7n5G6v8PeVf'

  }
}