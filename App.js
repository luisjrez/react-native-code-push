import React, { Component } from 'react'
import {
  ActivityIndicator,
  View,
  Text
} from 'react-native'
import CodePush from 'react-native-code-push'

class Application extends Component {
  constructor () {
    super()
    this.state = {
      restartAllowed: true,
      isUpToDate: true,
      onLoad: true,
      isUpdating: false
    }
  }

  componentDidMount () {
    CodePush.checkForUpdate()
      .then((update) => {
        if (!update) {
          console.log('The app is up to date!')
          this.setState({
            isUpToDate: true,
            onLoad: false
          })
        } else {
          console.log('An update is available! Should we download it?')
          this.setState({
            isUpToDate: false,
            onLoad: false
          }, this.sync)
        }
      })
      .catch(() => {
        this.setState({
          onLoad: false
        })
      })
  }

  codePushStatusDidChange (syncStatus) {
    switch (syncStatus) {
      case CodePush.SyncStatus.CHECKING_FOR_UPDATE:
        this.setState({ syncMessage: 'Checking for update.' })
        break
      case CodePush.SyncStatus.DOWNLOADING_PACKAGE:
        this.setState({ syncMessage: 'Downloading package.' })
        break
      case CodePush.SyncStatus.AWAITING_USER_ACTION:
        this.setState({ syncMessage: 'Awaiting user action.' })
        break
      case CodePush.SyncStatus.INSTALLING_UPDATE:
        this.setState({ syncMessage: 'Installing update.' })
        break
      case CodePush.SyncStatus.UP_TO_DATE:
        this.setState({ syncMessage: 'App up to date.', progress: false })
        break
      case CodePush.SyncStatus.UPDATE_IGNORED:
        this.setState({ syncMessage: 'Update cancelled by user.', progress: false, isUpdating: false })
        break
      case CodePush.SyncStatus.UPDATE_INSTALLED:
        this.setState({ syncMessage: 'Update installed and will be applied on restart.', progress: false, isUpdating: false })
        CodePush.notifyAppReady()
        break
      case CodePush.SyncStatus.UNKNOWN_ERROR:
        this.setState({ syncMessage: 'An unknown error occurred.', progress: false, isUpdating: false })
        break
    }
  }

  codePushDownloadDidProgress (progress) {
    this.setState({ progress })
  }

  // toggleAllowRestart () {
  //   this.state.restartAllowed
  //     ? CodePush.disallowRestart()
  //     : CodePush.allowRestart()

  //   this.setState({ restartAllowed: !this.state.restartAllowed })
  // }

  // getUpdateMetadata () {
  //   CodePush.getUpdateMetadata(CodePush.UpdateState.RUNNING)
  //     .then((metadata: LocalPackage) => {
  //       this.setState({ syncMessage: metadata ? JSON.stringify(metadata) : 'Running binary version', progress: false })
  //     }, (error: any) => {
  //       this.setState({ syncMessage: 'Error: ' + error, progress: false })
  //     })
  // }

  /** Update is downloaded silently, and applied on restart (recommended) */
  sync () {
    this.setState({
      isUpdating: true
    }, () => {
      CodePush.sync(
        { installMode: CodePush.InstallMode.IMMEDIATE },
        this.codePushStatusDidChange.bind(this),
        this.codePushDownloadDidProgress.bind(this)
      )
    })
  }

  render () {
    const {
      onLoad,
      isUpdating,
      isUpToDate
    } = this.state

    if (onLoad) {
      return (
        <View
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1,
            backgroundColor: 'orange'
          }}
        >
          <ActivityIndicator color='#FFF' size='large' />
        </View>
      )
    }

    return (
      <View
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          flex: 1,
          backgroundColor: 'orange'
        }}
      >
        <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Hello from Code Push Example!</Text>
        <Text style={{ color: '#FFF', fontWeight: 'bold' }}>{isUpdating ? 'INSTALLING UPDATE' : 'THE APP IS UP TO DATE'}</Text>
        <Text style={{ color: '#FFF', fontWeight: 'bold' }}>{JSON.stringify(this.state, null, 2)}</Text>
      </View>
    )
  }
}

/**
 * Configured with a MANUAL check frequency for easy testing. For production apps, it is recommended to configure a
 * different check frequency, such as ON_APP_START, for a 'hands-off' approach where CodePush.sync() does not
 * need to be explicitly called. All options of CodePush.sync() are also available in this decorator.
 */

const codePushOptions = { checkFrequency: CodePush.CheckFrequency.ON_APP_START }

const App = CodePush(codePushOptions)(Application)

export default App
