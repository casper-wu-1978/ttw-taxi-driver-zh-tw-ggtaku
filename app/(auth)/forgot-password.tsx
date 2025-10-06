
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { Button } from '@/components/button';
import { IconSymbol } from '@/components/IconSymbol';
import { supabase } from '@/lib/supabase';
import { colors, commonStyles } from '@/styles/commonStyles';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleResetPassword = async () => {
    if (!email.trim()) {
      Alert.alert('錯誤', '請輸入您的電子郵件地址');
      return;
    }

    if (!email.includes('@')) {
      Alert.alert('錯誤', '請輸入有效的電子郵件地址');
      return;
    }

    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: 'https://natively.dev/reset-password',
      });
      
      if (error) {
        console.error('Reset password error:', error);
        let errorMessage = '發送重設密碼郵件失敗，請稍後再試';
        
        if (error.message) {
          errorMessage = error.message;
        }
        
        Alert.alert('發送失敗', errorMessage);
      } else {
        setEmailSent(true);
        Alert.alert(
          '郵件已發送',
          '我們已向您的電子郵件地址發送了重設密碼的連結，請檢查您的收件箱。',
          [
            {
              text: '確定',
              onPress: () => router.back(),
            },
          ]
        );
      }
    } catch (error) {
      console.error('Unexpected reset password error:', error);
      Alert.alert('錯誤', '發生未預期的錯誤，請稍後再試');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Stack.Screen 
        options={{ 
          title: '忘記密碼',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
        }} 
      />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.logoContainer}>
          <IconSymbol name="key" size={60} color={colors.primary} />
          <Text style={styles.title}>重設密碼</Text>
          <Text style={styles.subtitle}>
            輸入您的電子郵件地址，我們將發送重設密碼的連結給您
          </Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>電子郵件</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="請輸入您的電子郵件"
              placeholderTextColor={colors.textSecondary}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLoading && !emailSent}
            />
          </View>

          <Button
            onPress={handleResetPassword}
            loading={isLoading}
            disabled={isLoading || emailSent}
            style={styles.resetButton}
          >
            {emailSent ? '郵件已發送' : '發送重設連結'}
          </Button>

          {emailSent && (
            <View style={styles.successContainer}>
              <IconSymbol name="checkmark.circle" size={24} color={colors.success} />
              <Text style={styles.successText}>
                重設密碼的郵件已發送到您的信箱
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 16,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 22,
  },
  formContainer: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.surface,
  },
  resetButton: {
    marginBottom: 24,
  },
  successContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.success,
    gap: 8,
  },
  successText: {
    color: colors.success,
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    flex: 1,
  },
});
