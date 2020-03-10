import React, {Component} from 'react';

import { View, Text } from 'react-native';

class Timer extends Component {
    state = {
        elapsed: 0
    }

    componentDidMount() {
        
    }

    componentDidUpdate() {
        if (this.props.since !== null && !this.interval) {
            this.startTimer();
        } else if (!this.props.since) {
            this.stopTimer();
        }
    }

    componentWillUnmount() {
        if (this.interval) {
            clearInterval(this.interval);
        }
    }

    startTimer() {
        this.interval = setInterval(() => {
            const now = new Date();
            this.setState({
                elapsed: now.getTime() - this.props.since.getTime()
            });
        }, 1000);
    }

    stopTimer() {
        if (this.interval && this.state.elapsed > 0) {
            clearInterval(this.interval);
            this.interval = null;
            this.setState({elapsed: 0});
            console.log("Recorded for " + this.state.elapsed + " ms");
        }
    }

    getTime() {
        let minutes = Math.floor(this.state.elapsed / 1000 / 60);
        let seconds = Math.floor(this.state.elapsed / 1000 - minutes * 60);

        if (minutes < 10) minutes = "0" + minutes;
        if (seconds < 10) seconds = "0" + seconds;

        return `${minutes}:${seconds}`;
    }
    
    render() {
        return (
            <View>
                <Text style={{fontSize: 80}}>{this.getTime()}</Text>
            </View>
        );
    }
}

export default Timer;