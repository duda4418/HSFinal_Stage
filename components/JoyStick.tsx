import React, { useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { PanGestureHandler, GestureHandlerRootView } from 'react-native-gesture-handler';

const Joystick = () => {
  const [direction, setDirection] = useState<string>('Neutral');
  const [rotation, setRotation] = useState<number>(0);

  const handleGesture = (event: any) => {
    const { translationX, translationY } = event.nativeEvent;
    if (Math.abs(translationX) > Math.abs(translationY)) {
      if (translationX > 0) {
        setDirection('Right');
      } else {
        setDirection('Left');
      }
    } else {
      if (translationY > 0) {
        setDirection('Forward');
      } else {
        setDirection('Backward');
      }
    }
  };

  const handleRotation = (event: any) => {
    const { translationX, translationY } = event.nativeEvent;
    const angle = Math.atan2(translationY, translationX) * (180 / Math.PI);
    setRotation(angle);
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.joystickContainer}>
        <PanGestureHandler onGestureEvent={handleGesture}>
          <View style={styles.joystick}>
            <Text>{`Direction: ${direction}`}</Text>
            <Text>{`Rotation: ${rotation.toFixed(2)}°`}</Text>
          </View>
        </PanGestureHandler>
        <PanGestureHandler onGestureEvent={handleRotation}>
          <View style={[styles.rotationControl, { transform: [{ rotate: `${rotation}deg` }] }]}>
            <Text>Rotate</Text>
          </View>
        </PanGestureHandler>
      </View>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  joystickContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  joystick: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rotationControl: {
    marginTop: 20,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#aaa',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Joystick;
