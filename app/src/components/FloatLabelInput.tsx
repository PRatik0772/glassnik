import { useState, useRef } from 'react';
import { View, TextInput, Text, TouchableOpacity, Animated, StyleSheet } from 'react-native';
import { C, F } from '../constants/theme';

interface Props {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: TextInput['props']['keyboardType'];
}

export function FloatLabelInput({ label, value, onChangeText, secureTextEntry, keyboardType }: Props) {
  const [focused, setFocused] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const anim = useRef(new Animated.Value(value ? 1 : 0)).current;

  const onFocus = () => {
    setFocused(true);
    Animated.timing(anim, { toValue: 1, duration: 180, useNativeDriver: false }).start();
  };
  const onBlur = () => {
    setFocused(false);
    if (!value) Animated.timing(anim, { toValue: 0, duration: 180, useNativeDriver: false }).start();
  };

  const labelTop = anim.interpolate({ inputRange: [0, 1], outputRange: [16, -2] });
  const labelSize = anim.interpolate({ inputRange: [0, 1], outputRange: [16, 11] });

  return (
    <View style={styles.wrap}>
      <Animated.Text style={[styles.label, { top: labelTop, fontSize: labelSize }]}>{label}</Animated.Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        onFocus={onFocus}
        onBlur={onBlur}
        secureTextEntry={secureTextEntry && !showPass}
        keyboardType={keyboardType}
        autoCapitalize="none"
      />
      {secureTextEntry && (
        <TouchableOpacity style={styles.eye} onPress={() => setShowPass(!showPass)}>
          <Text style={styles.eyeText}>{showPass ? 'Hide' : 'Show'}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 24, position: 'relative', borderBottomWidth: 1, borderBottomColor: C.sand },
  label: { position: 'absolute', left: 0, fontFamily: F.body, color: C.sand },
  input: { paddingTop: 20, paddingBottom: 8, fontFamily: F.body, fontSize: 16, color: C.charcoal } as any,
  eye: { position: 'absolute', right: 0, bottom: 10 },
  eyeText: { fontFamily: F.bodySemiBold, fontSize: 12, color: C.sand },
});
