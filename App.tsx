import React from 'react';
import {
  useColorScheme,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native';
import {
  Colors,

} from 'react-native/Libraries/NewAppScreen';
import { Text } from 'react-native';
import CarControlApp from './components/CarControlApp';
import Joystick from './components/JoyStick';

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <CarControlApp />
    </SafeAreaView>
  );
}



export default App;
