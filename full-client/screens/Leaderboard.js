import React from 'react'
import { View, Text, AsyncStorage, ScrollView, NetInfo } from 'react-native'
import WebAPI from '../WebAPI'
import Loading from './Loading'
import Commons from '../Commons'
import globalStyles from '../styles'
import moment from 'moment'
import i18n from 'i18n-js'
import _ from 'lodash'
import ConnectionContext from '../context/ConnnectionContext'
import TypingLanguageContext from '../context/TypingLanguageContext'
import Hr from '../components/Hr'
import firebase from 'firebase'

export default React.forwardRef((props, ref) => (
  <TypingLanguageContext.Consumer>
    {typingLanguageState => (
      <ConnectionContext.Consumer>
        {online => (
          <Leaderboard
            {...props}
            typingLanguage={typingLanguageState.typingLanguage}
            online={online}
            ref={ref}
          />
        )}
      </ConnectionContext.Consumer>
    )}
  </TypingLanguageContext.Consumer>
))

export class Leaderboard extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      loading: true,
      authenticated: null,
      data: {
        bestResults: [],
        bestAvgResults: [],
        bestCpmTodayResults: [],
        bestAccTodayResults: [],
        gamesPlayedCnt: null,
        lastGames: [],
        gamesPlayedCntUser: null,
      },
    }
    this.updateScreen = this.updateScreen.bind(this)
    this.getPersistentDataOffline = this.getPersistentDataOffline.bind(this)
    this.getApiDataOnline = this.getApiDataOnline.bind(this)
  }

  async componentDidMount () {
    this.willFocusSubscription = this.props.navigation.addListener(
      'willFocus',
      () => {
        this.updateScreen()
      },
    )
    if (__DEV__) {
      console.log('User is ' + (this.props.online ? 'online' : 'offline'))
    }
    if (this.props.online) {
      this.getApiDataOnline().then(() => {
        this.setState({
          loading: false,
        })
      })
    } else {
      this.getPersistentDataOffline().then(() => {
        this.setState({
          loading: false,
        })
      })
    }
  }

  componentWillUnmount () {
    this.willFocusSubscription.remove()
  }

  async updateScreen () {
    if (__DEV__) {
      console.log('Leaderboard updated screen')
    }
    if (this.props.online) {
      this.getApiDataOnline()
    } else {
      this.getPersistentDataOffline()
    }
  }

  getPersistentDataOffline () {
    return AsyncStorage.getItem('leaderboard-data').then(value => {
      if (!value) {
        this.setState({
          data: {
            bestResults: [],
            bestAvgResults: [],
            bestCpmTodayResults: [],
            bestAccTodayResults: [],
            gamesPlayedCnt: null,
            lastGames: [],
            gamesPlayedCntUser: null,
          },
        })
      } else {
        const data = JSON.parse(value)
        this.setState({
          data,
        })
      }
    })
  }

  getApiDataOnline () {
    let data = {}

    const user = firebase.auth().currentUser
    if (user && user.emailVerified) {
      return Promise.all([
        WebAPI.countGamesPlayedToday(),
        WebAPI.getLastPlayedGames(),
        WebAPI.countUserPlayedToday(user.uid),
        WebAPI.getBestResults(this.props.typingLanguage),
        WebAPI.getBestAvgResults(this.props.typingLanguage),
        WebAPI.getBestCpmTodayResults(this.props.typingLanguage),
        WebAPI.getBestAccTodayResults(this.props.typingLanguage),
      ]).then(results => {
        data = {
          gamesPlayedCnt: results[0].result,
          lastGames: results[1].result,
          gamesPlayedCntUser: results[2].result,
          bestResults: results[3],
          bestAvgResults: results[4],
          bestCpmTodayResults: results[5],
          bestAccTodayResults: results[6],
        }
      }).then(() => {
        return AsyncStorage.setItem('main-data', JSON.stringify(data)).then(
          () => {
            this.setState({
              data,
              authenticated: true,
              loading: false,
            })
          },
        )
      }).catch(error => {
        if (__DEV__) {
          console.log(error)
        }
        throw error
      })
    } else {
      return Promise.all([
        WebAPI.countGamesPlayedToday(),
        WebAPI.getLastPlayedGames(),
        WebAPI.getBestResults(this.props.typingLanguage),
        WebAPI.getBestAvgResults(this.props.typingLanguage),
        WebAPI.getBestCpmTodayResults(this.props.typingLanguage),
        WebAPI.getBestAccTodayResults(this.props.typingLanguage),
      ]).then(results => {
        data = {
          gamesPlayedCnt: results[0].result,
          lastGames: results[1].result,
          bestResults: results[2],
          bestAvgResults: results[3],
          bestCpmTodayResults: results[4],
          bestAccTodayResults: results[5],
          gamesPlayedCntUser: 0,
        }
      }).then(() => {
        return AsyncStorage.setItem(
          'leaderboard-data',
          JSON.stringify(data)).then(
          () => {
            this.setState({
              data,
              authenticated: false,
              loading: false,
            })
          },
        )
      }).catch(error => {
        if (__DEV__) {
          console.log(error)
        }
        throw error
      })
    }
  }

  render () {
    if (this.state.loading) return <Loading/>
    return (
      <View style={globalStyles.container}>
        <View style={globalStyles.inside_container}>
          <ScrollView style={globalStyles.scrollView}>
            {this.state.authenticated && (
              <View>
                <Text style={globalStyles.tableHeader}>
                  {i18n.t('main.yourGamesCount')}:{' '}
                  {this.state.data.gamesPlayedCntUser}
                </Text>
              </View>
            )}
            <View>
              <Text style={globalStyles.tableHeader}>
                {i18n.t('main.totalGamesCount')}:{' '}
                {this.state.data.gamesPlayedCnt}
              </Text>
            </View>
            {/* TODO(aibek): fill out last played games from API */}
            {!_.isEmpty(this.state.data.lastGames) && (
              <View style={{marginTop: 20}}>
                <Text style={globalStyles.tableHeader}>
                  {i18n.t('main.lastGames')}
                </Text>
                {this.state.data.lastGames.map((result, i) => {
                  return (
                    <View style={globalStyles.row} key={i}>
                      <Text style={globalStyles.column}>
                        {result.user.nickname
                          ? result.user.nickname
                          : 'noname'}
                      </Text>
                      <Text style={globalStyles.column}>
                        {result.user.country
                          ? result.user.country
                          : 'not specified'}
                      </Text>
                      <Text style={globalStyles.column}>{result.cpm}</Text>
                      <Text style={globalStyles.column}>
                        {moment(result.race.date).fromNow()}
                      </Text>
                    </View>
                  )
                })}
              </View>
            )}
            {!_.isEmpty(this.state.data.bestCpmTodayResults) && (
              <View style={{marginTop: 30}}>
                <Text style={globalStyles.tableHeader}>
                  {i18n.t('leaderboard.bestTodayByCpm')}
                </Text>
                {this.state.data.bestCpmTodayResults.map((result, i) => {
                  return (
                    <View style={globalStyles.row} key={i}>
                      <Text style={globalStyles.column}>
                        {result.user.nickname
                          ? result.user.nickname
                          : 'noname'}
                      </Text>
                      <Text style={globalStyles.column}>
                        {result.user.country
                          ? result.user.country
                          : 'not specified'}
                      </Text>
                      <Text style={globalStyles.column}>{result.cpm}</Text>
                    </View>
                  )
                })}
              </View>
            )}
            {!_.isEmpty(this.state.data.bestAccTodayResults) && (
              <View style={{marginTop: 30}}>
                <Text style={globalStyles.tableHeader}>
                  {i18n.t('leaderboard.bestTodayByAcc')}
                </Text>
                {this.state.data.bestAccTodayResults.map((result, i) => {
                  return (
                    <View style={globalStyles.row} key={i}>
                      <Text style={globalStyles.column}>
                        {result.user.nickname
                          ? result.user.nickname
                          : 'noname'}
                      </Text>
                      <Text style={globalStyles.column}>
                        {result.user.country
                          ? result.user.country
                          : 'not specified'}
                      </Text>
                      <Text
                        style={globalStyles.column}>{result.accuracy}</Text>
                    </View>
                  )
                })}
              </View>
            )}
            {!_.isEmpty(this.state.data.bestAvgResults) && (
              <View style={{marginTop: 30}}>
                <Text style={globalStyles.tableHeader}>
                  {i18n.t('leaderboard.bestTodayByAvgCpm')}
                </Text>
                {this.state.data.bestAvgResults.map((result, i) => {
                  return (
                    <View style={globalStyles.row} key={i}>
                      <Text style={globalStyles.column}>
                        {result.user.nickname
                          ? result.user.nickname
                          : 'noname'}
                      </Text>
                      <Text style={globalStyles.column}>
                        {result.user.country
                          ? result.user.country
                          : 'not specified'}
                      </Text>
                      <Text style={globalStyles.column}>
                        {Math.round(result.avg)}
                      </Text>
                    </View>
                  )
                })}
              </View>
            )}
            {!_.isEmpty(this.state.data.bestResults) && (
              <View style={{marginTop: 30}}>
                <Text style={globalStyles.tableHeader}>
                  {i18n.t('leaderboard.bestByCpm')}
                </Text>
                {this.state.data.bestResults.map((result, i) => {
                  return (
                    <View style={globalStyles.row} key={i}>
                      <Text style={globalStyles.column}>
                        {result.user.nickname
                          ? result.user.nickname
                          : 'noname'}
                      </Text>
                      <Text style={globalStyles.column}>
                        {result.user.country
                          ? result.user.country
                          : 'not specified'}
                      </Text>
                      <Text style={globalStyles.column}>{result.cpm}</Text>
                      <Text style={globalStyles.column}>
                        {moment(result.race.date).
                          format('HH:mm, D MMMM, YYYY')}
                      </Text>
                    </View>
                  )
                })}
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    )
  }
}
