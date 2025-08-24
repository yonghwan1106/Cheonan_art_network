import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { UserSettings } from '@types/index';
import ApiService from '@services/api';

interface SettingsScreenProps {
  navigation: any;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation }) => {
  const [settings, setSettings] = useState<UserSettings>({
    notifications: true,
    autoBlock: false,
    riskThreshold: 7,
    audioRecording: true,
  });
  const [loading, setLoading] = useState(false);

  const updateSetting = async (key: keyof UserSettings, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);

    setLoading(true);
    try {
      const response = await ApiService.updateSettings(newSettings);
      if (!response.success) {
        Alert.alert('오류', '설정을 저장하는 중 오류가 발생했습니다.');
        setSettings(settings);
      }
    } catch (error) {
      Alert.alert('오류', '설정을 저장하는 중 오류가 발생했습니다.');
      setSettings(settings);
    } finally {
      setLoading(false);
    }
  };

  const riskThresholdOptions = [
    { value: 5, label: '5 - 매우 민감' },
    { value: 6, label: '6 - 민감' },
    { value: 7, label: '7 - 보통' },
    { value: 8, label: '8 - 덜 민감' },
    { value: 9, label: '9 - 매우 덜 민감' },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>설정</Text>
        <Text style={styles.subtitle}>앱 동작 설정</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>알림</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingContent}>
            <Text style={styles.settingLabel}>알림 활성화</Text>
            <Text style={styles.settingDescription}>
              사기 통화 탐지 시 알림을 받습니다
            </Text>
          </View>
          <Switch
            value={settings.notifications}
            onValueChange={(value) => updateSetting('notifications', value)}
            disabled={loading}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>차단</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingContent}>
            <Text style={styles.settingLabel}>자동 차단</Text>
            <Text style={styles.settingDescription}>
              고위험 통화를 자동으로 차단합니다
            </Text>
          </View>
          <Switch
            value={settings.autoBlock}
            onValueChange={(value) => updateSetting('autoBlock', value)}
            disabled={loading}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>위험도 임계값</Text>
        <Text style={styles.sectionDescription}>
          이 값 이상의 위험도를 가진 통화를 사기로 판정합니다
        </Text>
        
        {riskThresholdOptions.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.thresholdOption,
              settings.riskThreshold === option.value && styles.thresholdOptionSelected,
            ]}
            onPress={() => updateSetting('riskThreshold', option.value)}
            disabled={loading}
          >
            <Text style={[
              styles.thresholdLabel,
              settings.riskThreshold === option.value && styles.thresholdLabelSelected,
            ]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>오디오</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingContent}>
            <Text style={styles.settingLabel}>음성 녹음</Text>
            <Text style={styles.settingDescription}>
              분석을 위해 음성을 녹음합니다
            </Text>
          </View>
          <Switch
            value={settings.audioRecording}
            onValueChange={(value) => updateSetting('audioRecording', value)}
            disabled={loading}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>정보</Text>
        
        <TouchableOpacity style={styles.infoItem}>
          <Text style={styles.infoLabel}>앱 버전</Text>
          <Text style={styles.infoValue}>1.0.0</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.infoItem}>
          <Text style={styles.infoLabel}>개발자</Text>
          <Text style={styles.infoValue}>Smart Voice Guard Team</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#2196F3',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginTop: 4,
  },
  section: {
    margin: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  settingContent: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#666',
  },
  thresholdOption: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 8,
  },
  thresholdOptionSelected: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  thresholdLabel: {
    fontSize: 14,
    color: '#333',
  },
  thresholdLabelSelected: {
    color: 'white',
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  infoLabel: {
    fontSize: 16,
    color: '#333',
  },
  infoValue: {
    fontSize: 16,
    color: '#666',
  },
});

export default SettingsScreen;