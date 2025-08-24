import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { VoiceAnalysisResult } from '@types/index';
import { formatDate, formatPhoneNumber, formatDuration } from '@utils/formatters';
import RiskBadge from './RiskBadge';

interface CallListItemProps {
  call: VoiceAnalysisResult;
  onPress: (callId: string) => void;
}

const CallListItem: React.FC<CallListItemProps> = ({ call, onPress }) => {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress(call.id)}
    >
      <View style={styles.header}>
        <Text style={styles.phoneNumber}>
          {formatPhoneNumber(call.phoneNumber)}
        </Text>
        <RiskBadge level={call.riskLevel} score={call.riskScore} size="small" />
      </View>
      
      <View style={styles.content}>
        <Text style={styles.timestamp}>{formatDate(call.timestamp)}</Text>
        <Text style={styles.duration}>{formatDuration(call.duration)}</Text>
      </View>
      
      <View style={styles.transcriptContainer}>
        <Text style={styles.transcript} numberOfLines={2}>
          {call.transcript}
        </Text>
      </View>
      
      {call.keywords.length > 0 && (
        <View style={styles.keywordsContainer}>
          <Text style={styles.keywordsLabel}>탐지 키워드:</Text>
          <Text style={styles.keywords}>
            {call.keywords.slice(0, 3).join(', ')}
            {call.keywords.length > 3 && '...'}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  phoneNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
  },
  duration: {
    fontSize: 12,
    color: '#666',
  },
  transcriptContainer: {
    marginBottom: 8,
  },
  transcript: {
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
  },
  keywordsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  keywordsLabel: {
    fontSize: 12,
    color: '#666',
    marginRight: 4,
  },
  keywords: {
    fontSize: 12,
    color: '#F44336',
    fontWeight: '500',
  },
});

export default CallListItem;