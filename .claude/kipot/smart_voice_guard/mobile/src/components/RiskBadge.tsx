import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { formatRiskLevel, getRiskColor } from '@utils/formatters';

interface RiskBadgeProps {
  level: 'low' | 'medium' | 'high';
  score?: number;
  size?: 'small' | 'medium' | 'large';
}

const RiskBadge: React.FC<RiskBadgeProps> = ({ level, score, size = 'medium' }) => {
  const color = getRiskColor(level);
  const sizeStyle = styles[size];

  return (
    <View style={[styles.badge, { backgroundColor: color }, sizeStyle]}>
      <Text style={[styles.text, styles[`${size}Text`]]}>
        {formatRiskLevel(level)}
        {score !== undefined && ` (${score})`}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: 'white',
    fontWeight: '600',
  },
  small: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  medium: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  large: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  smallText: {
    fontSize: 10,
  },
  mediumText: {
    fontSize: 12,
  },
  largeText: {
    fontSize: 14,
  },
});

export default RiskBadge;