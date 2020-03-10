import React, { Component } from 'react';

import { Text, View, AsyncStorage } from 'react-native';

import { Accelerometer, Magnetometer, Gyroscope } from 'expo-sensors';

export default class Card extends Component {
    state = {
        acc: {x: 0, y: 0, z: 0},
        mag: {x: 0, y: 0, z: 0},
        gyr: {x: 0, y: 0, z: 0},
    }

    activeBuffer = 1;
    sensorbuffer1 = [];
    sensorbuffer2 = [];
    accData;
    mag;
    gyr;

    constructor(props) {
        super(props);
        Accelerometer.setUpdateInterval(10);
        Gyroscope.setUpdateInterval(10);
        Magnetometer.setUpdateInterval(10);
    }

    componentDidMount() {
        try {
            const obj = { datapoints: [] };
            AsyncStorage.setItem(this.props.activityId, JSON.stringify(obj));
        } catch (error) {
            console.log(error);
        }

        
        if (Accelerometer.isAvailableAsync()) {

            this.accData = Accelerometer.addListener(data => {
                this.setState({acc: data});

                const datapoint = {
                    timestamp: new Date().getTime(),
                    activity_id: this.props.activityId,
                    raw_data: this.state,
                    gait: this.props.gait
                }

                switch(this.activeBuffer) {
                    case 1:
                        this.sensorbuffer1.push(datapoint);
                        if(this.sensorbuffer1.length === 3000) {
                            this.writeBuffer(this.sensorbuffer1);
                            this.activeBuffer = 2;
                            this.sensorbuffer1 = [];
                        }
                        break;
                    case 2:
                        this.sensorbuffer2.push(datapoint);
                        if(this.sensorbuffer2.length === 3000) {
                            this.writeBuffer(this.sensorbuffer2);
                            this.activeBuffer = 1;
                            this.sensorbuffer2 = [];
                        }
                        break;
                }
            });
        }

        if (Magnetometer.isAvailableAsync()) {
            this.mag = Magnetometer.addListener(data => {
                this.setState({mag: data});
            });
        }

        if (Gyroscope.isAvailableAsync()) {
            this.gyr = Gyroscope.addListener(data => {
                this.setState({gyr: data});
            });
        }
    }

    async writeBuffer(buffer) {
        let activity = await this.getData();

        if (activity) {
            activity = JSON.parse(activity);
            activity.datapoints = activity.datapoints.concat(buffer);

            const response = await this.saveDatapoints(JSON.stringify(activity));

            if (response.STATUS === 'OK') {
                console.log("Saved to DB");
                return response;                
            }

            try {
                return AsyncStorage.mergeItem(this.props.activityId, JSON.stringify(activity), (err) => {
                    console.log("Error when reaching server - saving in storage", "Buffer: " + this.activeBuffer);
                });
            } catch (error) {
                console.log(error);
            }
        }

    }

    async writeAllBuffers() {
        let buffer1Status;
        let buffer2Status;

        if (this.sensorbuffer1.length > 0) {
            buffer1Status = await this.writeBuffer(this.sensorbuffer1);
            console.log("Wrote buffer 1", buffer1Status);

            if (buffer1Status.STATUS === 'OK') {
                this.sensorbuffer1 = [];
            }
        }
        
        if (this.sensorbuffer2.length > 0) {
            buffer2Status = await this.writeBuffer(this.sensorbuffer2);
            console.log("Wrote buffer 2", buffer2Status);

            if (buffer2Status.STATUS === 'OK') {
                this.sensorbuffer2 = [];
            }
        }

        if ( (buffer1Status && buffer1Status.STATUS) !== 'OK' || (buffer2Status && buffer2Status !== 'OK')) {
            return this.writeAllBuffers();
        }

        return { buffer1Status, buffer2Status };
    }

    async getData() {
        try {
            const val = await AsyncStorage.getItem(this.props.activityId);
            if (val !== null) {
                return val;
            }
        } catch (error) {
            return error;
        }
    }

    async saveDatapoints(data) {
        const urlMode = this.props.mode === 'test' ? '/test' : '';
        console.log("Sent data");
        const response = await fetch(`https://andreashej.dk/gaitsapi/data${urlMode}`, {
            method: "POST",
            headers: {
                Accept: "application/json", 
                'Content-Type': "application/json"
            },
            body: data
        });

        return await response.json();
    }

    componentWillUnmount() {
        this.accData && this.accData.remove();
        this.accData = null;

        this.mag && this.mag.remove();
        this.mag = null;

        this.gyr && this.gyr.remove();
        this.gyr = null;

        this.writeAllBuffers().then(
            ({buffer1Status, buffer2Status}) => {
                console.log("Done writing all data to DB!");
                // this.getData().then(
                //     data => {
                //         this.saveDatapoints(data).then(
                //             (response) => {
                //                 console.log("Successfully saved to db");
                //                 AsyncStorage.removeItem(this.props.activityId);
                //             },
                //             (err) => console.log(err)
                //         );

                //         // data = JSON.parse(data);
                //         // console.log("Recorded " + data.datapoints.length + " datapoints.");
                //     }
                // );
            }
        )

    }

    render() {
        return (
            null
            // <View style={{flex: 1, flexDirection: 'row'}}>
            //     <Text>
            //         Acc: X: {this.round(this.state.acc.x)}, Y: {this.round(this.state.acc.y)}, Z: {this.round(this.state.acc.z)}
            //     </Text>
            //     <Text>
            //         Mag: X: {this.round(this.state.mag.x)}, Y: {this.round(this.state.mag.y)}, Z: {this.round(this.state.mag.z)}
            //     </Text>
            //     <Text>
            //         Gyr: X: {this.round(this.state.gyr.x)}, Y: {this.round(this.state.gyr.y)}, Z: {this.round(this.state.gyr.z)}
            //     </Text>
            // </View>
        );
    }

    round(n) {
        if (!n) return 0;

        return Math.floor(n*100) / 100
    }
}