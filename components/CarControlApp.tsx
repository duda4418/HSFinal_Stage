import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, PermissionsAndroid, Platform } from 'react-native';
import BluetoothSerial from 'react-native-bluetooth-classic';

const Joystick = () => {
  const [direction, setDirection] = useState('');
  const [logs, setLogs]:any = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [devices, setDevices]:any = useState([]);
  const [selectedDevice, setSelectedDevice]:any = useState(null);

  // Request Bluetooth permissions for Android
  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ]);
        
        if (
          granted['android.permission.BLUETOOTH_SCAN'] === PermissionsAndroid.RESULTS.GRANTED &&
          granted['android.permission.BLUETOOTH_CONNECT'] === PermissionsAndroid.RESULTS.GRANTED
        ) {
          setLogs((prev: any) => ['Bluetooth permissions granted', ...prev]);
          return true;
        } else {
          setLogs((prev: any) => ['Bluetooth permissions denied', ...prev]);
          return false;
        }
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  // Check if Bluetooth is enabled
  const checkBluetooth = async () => {
    try {
      const enabled = await BluetoothSerial.isEnabled();
      if (!enabled) {
        await BluetoothSerial.requestEnable();
      }
      return enabled;
    } catch (error:any ) {
      setLogs((prev: any) => [`Bluetooth error: ${error.message}`, ...prev]);
      return false;
    }
  };

  // Scan for nearby devices
  const scanDevices = async () => {
    const hasPermissions = await requestPermissions();
    if (!hasPermissions) return;

    const isEnabled = await checkBluetooth();
    if (!isEnabled) return;

    try {
      setLogs((prev: any) => ['Scanning for devices...', ...prev]);
      const foundDevices = await BluetoothSerial.list();
      setDevices(foundDevices);
      setLogs((prev: any) => [`Found ${foundDevices.length} devices`, ...prev]);
    } catch (error:any) {
      setLogs((prev: any) => [`Scan failed: ${error.message}`, ...prev]);
    }
  };

  // Connect to a specific device
  const connectToDevice = async (device:any) => {
    try {
      setLogs((prev: any) => [`Connecting to ${device.name}...`, ...prev]);
      const connected = await BluetoothSerial.connect(device.address);
      
      if (connected) {
        setIsConnected(true);
        setSelectedDevice(device);
        setLogs((prev: any)=> [`Connected to ${device.name}`, ...prev]);
        
        // Set up listener for incoming data
        BluetoothSerial.onDataReceived((data:any) => {
          setLogs((prev: any) => [`Received: ${data.data}`, ...prev]);
        });
      }
    } catch (error:any) {
      setLogs((prev: any) => [`Connection failed: ${error.message}`, ...prev]);
    }
  };

  // Disconnect from current device
  const disconnectDevice = async () => {
    try {
      await BluetoothSerial.disconnect();
      setIsConnected(false);
      setSelectedDevice(null);
      setLogs((prev: any) => ['Disconnected', ...prev]);
    } catch (error:any) {
      setLogs((prev: any) => [`Disconnect failed: ${error.message}`, ...prev]);
    }
  };

  // Send data to connected device
  const sendData = async (data:any) => {
    if (!isConnected) {
      setLogs((prev: any) => ['Not connected to any device', ...prev]);
      return;
    }

    try {
      await BluetoothSerial.write(data);
      setLogs((prev: any) => [`Sent: ${data}`, ...prev]);
    } catch (error:any) {
      setLogs((prev: any) => [`Send failed: ${error.message}`, ...prev]);
    }
  };

  // Handle direction button press
  const handlePress = (newDirection:any) => {
    setDirection(newDirection);
    sendData(newDirection);
  };

  // Initialize Bluetooth on component mount
  useEffect(() => {
    scanDevices();
    
    return () => {
      // Clean up listeners when component unmounts
      BluetoothSerial.removeListener('dataReceived');
    };
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.logsContainer}>
        <Text style={styles.logsTitle}>Logs:</Text>
        <ScrollView style={styles.logs}>
          {logs.map((log:any, index:any) => (
            <Text key={index} style={styles.logText}>{log}</Text>
          ))}
        </ScrollView>
      </View>
      
      {/* Device Connection UI */}
      <View style={styles.connectionPanel}>
        {!isConnected ? (
          <>
            <Text style={styles.connectionText}>Available Devices:</Text>
            <ScrollView style={styles.deviceList}>
              {devices.map((device:any, index:any) => (
                <TouchableOpacity
                  key={index}
                  style={styles.deviceButton}
                  onPress={() => connectToDevice(device)}
                >
                  <Text style={styles.deviceText}>{device.name} ({device.address})</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.scanButton}
              onPress={scanDevices}
            >
              <Text style={styles.buttonText}>Scan Again</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.connectionText}>
              Connected to: {selectedDevice.name}
            </Text>
            <TouchableOpacity
              style={styles.disconnectButton}
              onPress={disconnectDevice}
            >
              <Text style={styles.buttonText}>Disconnect</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Joystick Controls */}
      <View style={styles.joystickContainer}>
        <Text style={styles.text}>Direction: {direction}</Text>
        
        <View style={styles.joystick}>
        <TouchableOpacity
            style={[styles.button, styles.topButton]}
            onPress={() => handlePress("Forward")}
          >
            <Text style={styles.buttonText}>↑</Text>
          </TouchableOpacity>
          
          <View style={styles.middleRow}>
            <TouchableOpacity
              style={[styles.button, styles.sideButton]}
              onPress={() => handlePress("Left")}
            >
              <Text style={styles.buttonText}>←</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.centerButton]}
              onPress={() => handlePress("Rotate")}
            >
              <Text style={styles.buttonText}>⟳</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.sideButton]}
              onPress={() => handlePress("Right")}
            >
              <Text style={styles.buttonText}>→</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.button, styles.bottomButton]}
            onPress={() => handlePress("Backward")}
          >
            <Text style={styles.buttonText}>↓</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

// Add these new styles to your existing StyleSheet
const styles = StyleSheet.create({
  connectionPanel: {
    width: '90%',
    backgroundColor: '#56604F',
    padding: 10,
    borderRadius: 10,
    marginBottom: 20,
  },
  connectionText: {
    color: 'white',
    fontSize: 16,
    marginBottom: 10,
  },
  deviceList: {
    maxHeight: 100,
    marginBottom: 10,
  },
  deviceButton: {
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#707c64',
  },
  deviceText: {
    color: 'white',
  },
  scanButton: {
    backgroundColor: '#e4e6c3',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  disconnectButton: {
    backgroundColor: '#ff6b6b',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  container: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#707c64",
    paddingVertical: 30,
  },
  logsContainer: {
    width: "90%",
    height: 250,
    backgroundColor: "#56604F",
    padding: 10,
    borderRadius: 10,
    shadowColor: "black",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    margin: 50,
  },
  logsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    marginBottom: 5,
  },
  logs: {
    maxHeight: 230,
  },
  logText: {
    fontSize: 16,
    color: "white",
  },
  joystickContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  text: {
    fontSize: 22,
    marginBottom: 10,
    color: "white",
    fontWeight: "bold",
  },
  joystick: {
    alignItems: "center",
    backgroundColor: "#56604F",
    padding: 20,
    borderRadius: 100,
    shadowColor: "black",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  middleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  button: {
    width: 70,
    height: 70,
    margin: 10,
    backgroundColor: "#555",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 35,
    shadowColor: "black",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  topButton: {
    backgroundColor: "#e4e6c3",
  },
  bottomButton: {
    backgroundColor: "#e4e6c3",
  },
  sideButton: {
    backgroundColor: "#e4e6c3",
  },
  centerButton: {
    backgroundColor: "#e4e6c3",
  },
  buttonText: {
    fontSize: 28,
    color: "#222725",
    fontWeight: "bold",
  },
});
export default Joystick;