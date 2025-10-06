
import { StyleSheet, ViewStyle, TextStyle } from 'react-native';

export const colors = {
  primary: '#007AFF',
  secondary: '#5856D6',
  success: '#34C759',
  error: '#FF3B30',
  warning: '#FF9500',
  background: '#F2F2F7',
  surface: '#FFFFFF',
  text: '#000000',
  textSecondary: '#8E8E93',
  border: '#C6C6C8',
  shadow: '#000000',
};

export const commonStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  } as ViewStyle,
  
  surface: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
  } as ViewStyle,
  
  shadow: {
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  } as ViewStyle,
  
  text: {
    color: colors.text,
    fontSize: 16,
  } as TextStyle,
  
  textSecondary: {
    color: colors.textSecondary,
    fontSize: 14,
  } as TextStyle,
  
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  } as TextStyle,
  
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  } as TextStyle,
  
  button: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,
  
  buttonText: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: '600',
  } as TextStyle,
  
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.surface,
  } as ViewStyle,
  
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    ...StyleSheet.create({
      shadow: {
        shadowColor: colors.shadow,
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }
    }).shadow,
  } as ViewStyle,
});
