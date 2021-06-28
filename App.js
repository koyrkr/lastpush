/* eslint-disable prettier/prettier */
/* eslint-disable react/self-closing-comp */
/* eslint-disable no-alert */
/* eslint-disable react-native/no-inline-styles */
/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Component } from 'react';
import {
  TextInput,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
} from 'react-native';
import NotifService from './NotifService';
import database from '@react-native-firebase/database';
import { Table, TableWrapper, Row, Rows, Col, Cols, Cell } from 'react-native-table-component';

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      HeadTable: ['timestamp', 'type', 'message'],
      DataTable: [],
      loggedIn: false,
      storeName: '',
      storePassword: '',
    };

    this.notif = new NotifService(
      this.onRegister.bind(this),
      this.onNotif.bind(this),
    );
  }


  render() {
    if (this.state.loggedIn) {
      return (
        <View style={styles.container}>
          <Text style={styles.appTitle}> RealPass Admin App </Text>
          <Text style={styles.title}> Store Name : {this.state.storeName} </Text>
          <View style={styles.spacer}></View>
          <Text style={styles.customerTitle}> Customer List </Text>
          <Table borderStyle={{ borderWidth: 1, borderColor: 'black' }}>
            <Row data={this.state.HeadTable} style={styles.HeadStyle} textStyle={styles.HeadTableText} />
            <Rows data={this.state.DataTable} textStyle={styles.TableText} />
          </Table>
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              this.setState({ loggedIn: false });
            }}>
            <Text style={{ textAlign: 'center' }}>Logout</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              database()
                .ref(`/stores/${this.state.storeName}/customers`)
                .remove()
                .then(() => console.log('Customer log Reset!'));
            }}>
            <Text style={{ textAlign: 'center' }}>Reset Log</Text>
          </TouchableOpacity>
        </View>
      );
    } else {
      return (
        <View style={styles.containerLogin}>
          <Text style={styles.appTitle}> Store Login </Text>
          <TextInput
            style={styles.textField}
            value={this.state.storeName}
            onChangeText={text => this.setState({ storeName: text })}
            placeholder="Enter StoreName"
          />
          <TextInput
            style={styles.textField}
            value={this.state.storePassword}
            onChangeText={text => this.setState({ storePassword: text })}
            placeholder="Enter StorePassword"
          />
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              let tempDataTable = [];
              this.setState({ loggedIn: true });
              // Saving Store Information
              database()
              .ref(`/stores/${this.state.storeName}`)
              .update({
                store_name: this.state.storeName,
                store_password: this.state.storePassword,
                // store_register_token: this.state.registerToken,
              });
              // Saving Store Register Token
              database()
              .ref(`/stores/${this.state.storeName}/store_register_token`)
              .push(this.state.registerToken)
              .then(() => console.log('Store Info Registered!'));
              // Getting Log
              database()
              .ref(`/stores/${this.state.storeName}/log`)
              .once('value')
              .then((snapshot) => {
                console.log(snapshot.val()?.slice(1));
                snapshot.val()?.slice(1).forEach((s) => {
                  console.log('print s');
                  console.log(s);
                  console.log([s.timestamp, s.type, s.message]);
                  tempDataTable.push(
                    [s.timestamp, s.type, s.message]
                  );
                });
                console.log(tempDataTable);
                this.setState({DataTable : tempDataTable});
              });

            }}>
            <Text style={{ textAlign: 'center' }}>Enter</Text>
          </TouchableOpacity>
        </View>
      );
    }
  }

  onRegister(token) {
    this.setState({
      registerToken: token.token,
      fcmRegistered: true,
    });
  }

  onNotif(notif) {
    Alert.alert( //TODO : customize
      notif.title,
      notif.message,
      [
        { text: '확인 완료', onPress: () => console.log('Pass OK Pressed') },
        {
          text: '닫기',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
      ]
    );
    console.log(notif.data);
    var timeStampNow = Date();
    console.log(timeStampNow);
    console.log(this.state.storeName);
    database()
      .ref(`/stores/${this.state.storeName}/log`)
      .push({
        timestamp: timeStampNow,
        // noti_info: {
        //   noti_type: 'realpass 19',
        //   noti_message: `${notif.data.customer_name} ${notif.data.passed}`,
        // },
        // receiver_info: {
        //   store_name: `${this.state.storeName}`,
        //   store_id: 'store_id',
        // },
        // sender_info: {
        //   customer_name: notif.data.customer_name,
        //   is_admin: false,
        // },
        message: `${notif.data.customer_name} ${notif.data.passed}`,
        type: 'realpass 19 테스트용',
      })
      .then(() => console.log('Noti Info (Log) Saved!'));
  }

  handlePerm(perms) {
    Alert.alert('Permissions', JSON.stringify(perms));
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5FCFF',
  },
  containerLogin: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#F5FCFF',
    alignItems: 'center',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  button: {
    borderWidth: 1,
    borderColor: '#000000',
    margin: 5,
    padding: 5,
    width: '70%',
    backgroundColor: '#DDDDDD',
    borderRadius: 5,
  },
  textField: {
    borderWidth: 1,
    borderColor: '#AAAAAA',
    margin: 5,
    padding: 5,
    width: '70%',
  },
  spacer: {
    height: 10,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 20,
    textAlign: 'center',
    paddingTop: 20,
    paddingVertical: 10,
  },
  appTitle: {
    fontWeight: 'bold',
    fontSize: 40,
    textAlign: 'center',
    paddingTop: 20,
    paddingVertical: 10,
  },
  customerTitle: {
    fontSize: 20,
    textAlign: 'left',
    paddingTop: 20,
    paddingVertical: 10,
    fontFamily: 'Feather',
  },
  HeadStyle: {
    height: 30,
    alignContent: 'center',
    backgroundColor: '#21209C',
  },
  HeadTableText: {
    margin: 10,
    textAlign: 'center',
    fontSize: 20,
    color: 'white',
    fontFamily: 'Feather',
  },
  TableText: {
    margin: 10,
    textAlign: 'center',
    fontFamily: 'Feather',
  },
});
