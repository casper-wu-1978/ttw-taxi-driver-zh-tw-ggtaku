
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
  Pressable,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { Button } from '@/components/button';
import { IconSymbol } from '@/components/IconSymbol';
import { useAuth } from '@/contexts/AuthContext';
import { colors, commonStyles } from '@/styles/commonStyles';

export default function RegisterScreen() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: '',
    phone: '',
    userType: 'driver' as 'driver' | 'passenger',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signUp } = useAuth();

  const handleRegister = async () => {
    // Validation
    if (!formData.email.trim() || !formData.password.trim() || !formData.confirmPassword.trim() || !formData.displayName.trim()) {
      Alert.alert('錯誤', '請填寫所有必填欄位');
      return;
    }

    if (!formData.email.includes('@')) {
      Alert.alert('錯誤', '請輸入有效的電子郵件地址');
      return;
    }

    if (formData.password.length < 6) {
      Alert.alert('錯誤', '密碼至少需要6個字符');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert('錯誤', '密碼確認不匹配');
      return;
    }

    if (formData.phone && !/^[0-9+\-\s()]+$/.test(formData.phone)) {
      Alert.alert('錯誤', '請輸入有效的電話號碼');
      return;
    }

    setIsLoading(true);
    
    try {
      const { error } = await signUp(formData.email.trim(), formData.password, {
        display_name: formData.displayName.trim(),
        phone: formData.phone.trim() || undefined,
        user_type: formData.userType,
      });
      
      if (error) {
        console.error('Registration error:', error);
        let errorMessage = '註冊失敗，請稍後再試';
        
        if (error.message.includes('User already registered')) {
          errorMessage = '此電子郵件已被註冊';
        } else if (error.message.includes('Password should be at least 6 characters')) {
          errorMessage = '密碼至少需要6個字符';
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        Alert.alert('註冊失敗', errorMessage);
      } else {
        Alert.alert(
          '註冊成功',
          '請檢查您的電子郵件並點擊確認連結以完成註冊。',
          [
            {
              text: '確定',
              onPress: () => router.replace('/(auth)/login'),
            },
          ]
        );
      }
    } catch (error) {
      console.error('Unexpected registration error:', error);
      Alert.alert('錯誤', '發生未預期的錯誤，請稍後再試');
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToLogin = () => {
    router.back();
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Stack.Screen 
        options={{ 
          title: '註冊',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
        }} 
      />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.logoContainer}>
          <IconSymbol name="person.badge.plus" size={60} color={colors.primary} />
          <Text style={styles.title}>建立新帳號</Text>
          <Text style={styles.subtitle}>加入TTW-TAXI司機團隊</Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>顯示名稱 *</Text>
            <TextInput
              style={styles.input}
              value={formData.displayName}
              onChangeText={(value) => updateFormData('displayName', value)}
              placeholder="請輸入您的姓名"
              placeholderTextColor={colors.textSecondary}
              autoCapitalize="words"
              editable={!isLoading}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>電子郵件 *</Text>
            <TextInput
              style={styles.input}
              value={formData.email}
              onChangeText={(value) => updateFormData('email', value)}
              placeholder="請輸入您的電子郵件"
              placeholderTextColor={colors.textSecondary}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLoading}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>電話號碼</Text>
            <TextInput
              style={styles.input}
              value={formData.phone}
              onChangeText={(value) => updateFormData('phone', value)}
              placeholder="請輸入您的電話號碼"
              placeholderTextColor={colors.textSecondary}
              keyboardType="phone-pad"
              editable={!isLoading}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>用戶類型</Text>
            <View style={styles.userTypeContainer}>
              <Pressable
                style={[
                  styles.userTypeButton,
                  formData.userType === 'driver' && styles.userTypeButtonActive
                ]}
                onPress={() => updateFormData('userType', 'driver')}
                disabled={isLoading}
              >
                <IconSymbol 
                  name="car" 
                  size={20} 
                  color={formData.userType === 'driver' ? colors.surface : colors.textSecondary} 
                />
                <Text style={[
                  styles.userTypeText,
                  formData.userType === 'driver' && styles.userTypeTextActive
                ]}>
                  司機
                </Text>
              </Pressable>
              
              <Pressable
                style={[
                  styles.userTypeButton,
                  formData.userType === 'passenger' && styles.userTypeButtonActive
                ]}
                onPress={() => updateFormData('userType', 'passenger')}
                disabled={isLoading}
              >
                <IconSymbol 
                  name="person" 
                  size={20} 
                  color={formData.userType === 'passenger' ? colors.surface : colors.textSecondary} 
                />
                <Text style={[
                  styles.userTypeText,
                  formData.userType === 'passenger' && styles.userTypeTextActive
                ]}>
                  乘客
                </Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>密碼 *</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                value={formData.password}
                onChangeText={(value) => updateFormData('password', value)}
                placeholder="請輸入密碼（至少6個字符）"
                placeholderTextColor={colors.textSecondary}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />
              <Pressable
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                <IconSymbol
                  name={showPassword ? "eye.slash" : "eye"}
                  size={20}
                  color={colors.textSecondary}
                />
              </Pressable>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>確認密碼 *</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                value={formData.confirmPassword}
                onChangeText={(value) => updateFormData('confirmPassword', value)}
                placeholder="請再次輸入密碼"
                placeholderTextColor={colors.textSecondary}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />
              <Pressable
                style={styles.eyeButton}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={isLoading}
              >
                <IconSymbol
                  name={showConfirmPassword ? "eye.slash" : "eye"}
                  size={20}
                  color={colors.textSecondary}
                />
              </Pressable>
            </View>
          </View>

          <Button
            onPress={handleRegister}
            loading={isLoading}
            disabled={isLoading}
            style={styles.registerButton}
          >
            註冊
          </Button>

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>已經有帳號？</Text>
            <Pressable
              onPress={navigateToLogin}
              disabled={isLoading}
            >
              <Text style={styles.loginLink}>立即登入</Text>
            </Pressable>
          </View>
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
    marginBottom: 32,
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
  },
  formContainer: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 20,
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
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.surface,
  },
  passwordInput: {
    flex: 1,
    padding: 16,
    fontSize: 16,
    color: colors.text,
  },
  eyeButton: {
    padding: 16,
  },
  userTypeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  userTypeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.surface,
    gap: 8,
  },
  userTypeButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  userTypeText: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  userTypeTextActive: {
    color: colors.surface,
  },
  registerButton: {
    marginTop: 8,
    marginBottom: 24,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  loginLink: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
});
