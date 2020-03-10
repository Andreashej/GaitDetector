import React, { Component } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import Card from './components/Card';
import PlayButton from './components/PlayButton';
import Timer from './components/Timer';

import { Button } from 'react-native-elements';

export default class App extends Component {
  gaits = [
    {
      name: "Walk",
      id: 0,
    },
    {
      name: "Tölt",
      id: 1,
    },
    {
      name: "Trot",
      id: 2,
    },
    {
      name: "Canter",
      id: 3,
    },
    {
      name: "Pace",
      id: 4,
    },
  ];

  state = {
    recording: false,
    startedAt: null,
    currentActivity: null,
    currentGait: 0,
    live: true
  }

  toggleRecording(activityId) {
    this.setState({recording: !this.state.recording}, () => {
      if (this.state.recording) {
        this.setState({startedAt: new Date(), currentActivity: activityId});
      } else {
        this.setState({startedAt: null, currentActivity: null});
      }
    });
  }

  setGait(gait) {
    this.setState({currentGait: gait});
  }

  renderButtons() {
    return this.gaits.map(btn => {
      const disabled = (this.state.currentGait === btn.id);
      return (
        <Button 
          key={btn.id}
          title={btn.name} 
          buttonStyle={styles.buttonStyle} 
          titleStyle={styles.buttonTextStyle}
          disabledStyle={styles.disabledStyle}
          disabledTitleStyle={styles.disabledTextStyle}
          disabled={disabled}
          onPress={() => this.setGait(btn.id)}
        ></Button>
      );
    });
  }

  setMode() {
    this.setState({live: !this.state.live});
  }

  renderModeSwitch() {
    const text = this.state.live ? 'Switch to test' : 'Switch to live';
    return (
      <Button title={text} disabled={this.state.recording} onPress={() => this.setMode()}></Button>
    )
  }

  render() {
    const card = this.state.recording && this.state.currentActivity ? (<Card activityId={this.state.currentActivity} gait={this.state.currentGait} mode={this.state.live ? 'live' : 'test'}></Card>) : null;

    return (
      <View style={styles.container}>
        <View style={styles.section}>
          <Timer since={this.state.startedAt}></Timer>
        </View>
        <View style={styles.section}>
          <PlayButton isRecording={this.state.recording} onPress={(uuid) => this.toggleRecording(uuid)} ></PlayButton>
        </View>
        <View style={styles.section}>
          {this.renderButtons()}
        </View>
        {this.renderModeSwitch()}
        {card}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: 'row'
  },
  buttonStyle: {
    marginHorizontal: 5,
  },
  buttonTextStyle: {
    fontSize: 24
  },
  disabledStyle: {
    backgroundColor: "green"
  },
  disabledTextStyle: {
    color: "white"
  }
});