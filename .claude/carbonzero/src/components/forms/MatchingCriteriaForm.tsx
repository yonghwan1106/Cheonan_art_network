import React from 'react';
import {
  Box,
  Typography,
  FormControlLabel,
  Checkbox,
  FormGroup,
  Slider,
  Paper,
} from '@mui/material';
import { MatchingCriteria } from '../../types';

interface MatchingCriteriaFormProps {
  criteria: MatchingCriteria;
  onChange: (criteria: MatchingCriteria) => void;
}

const timeSlots = [
  '00:00-06:00', '06:00-12:00', '12:00-18:00', '18:00-24:00',
  '새벽(02:00-05:00)', '오전(09:00-12:00)', '오후(13:00-17:00)', '저녁(18:00-22:00)'
];

const MatchingCriteriaForm: React.FC<MatchingCriteriaFormProps> = ({ criteria, onChange }) => {
  const handleTargetOffsetChange = (value: number) => {
    onChange({ ...criteria, targetOffset: value });
  };

  const handleMaxPriceChange = (value: number) => {
    onChange({ ...criteria, maxPricePerTon: value });
  };

  const handleTimeSlotChange = (slot: string, checked: boolean) => {
    const newSlots = checked
      ? [...criteria.preferredTimeSlots, slot]
      : criteria.preferredTimeSlots.filter(s => s !== slot);
    
    onChange({ ...criteria, preferredTimeSlots: newSlots });
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        매칭 조건 설정
      </Typography>

      <Box mb={3}>
        <Typography variant="body2" gutterBottom>
          탄소상쇄 목표량: {criteria.targetOffset.toLocaleString()} tCO2
        </Typography>
        <Slider
          value={criteria.targetOffset}
          onChange={(_, value) => handleTargetOffsetChange(value as number)}
          min={50}
          max={5000}
          step={50}
          marks={[
            { value: 50, label: '50' },
            { value: 1000, label: '1,000' },
            { value: 2500, label: '2,500' },
            { value: 5000, label: '5,000' },
          ]}
          valueLabelDisplay="auto"
          valueLabelFormat={(value) => `${value.toLocaleString()} tCO2`}
        />
      </Box>

      <Box mb={3}>
        <Typography variant="body2" gutterBottom>
          최대 톤당 가격: {criteria.maxPricePerTon.toLocaleString()}원
        </Typography>
        <Slider
          value={criteria.maxPricePerTon}
          onChange={(_, value) => handleMaxPriceChange(value as number)}
          min={20000}
          max={80000}
          step={1000}
          marks={[
            { value: 20000, label: '2만원' },
            { value: 35000, label: '3.5만원' },
            { value: 50000, label: '5만원' },
            { value: 65000, label: '6.5만원' },
            { value: 80000, label: '8만원' },
          ]}
          valueLabelDisplay="auto"
          valueLabelFormat={(value) => `${(value / 1000).toFixed(0)}천원`}
        />
      </Box>

      <Box>
        <Typography variant="body2" gutterBottom>
          선호 시간대 (선택사항)
        </Typography>
        <FormGroup>
          {timeSlots.map((slot) => (
            <FormControlLabel
              key={slot}
              control={
                <Checkbox
                  checked={criteria.preferredTimeSlots.includes(slot)}
                  onChange={(e) => handleTimeSlotChange(slot, e.target.checked)}
                  size="small"
                />
              }
              label={
                <Typography variant="body2">
                  {slot}
                </Typography>
              }
            />
          ))}
        </FormGroup>
      </Box>

      <Box mt={2} p={2} bgcolor="grey.50" borderRadius={1}>
        <Typography variant="caption" color="textSecondary">
          💡 팁: 새벽 시간대와 신재생에너지 발전소를 선택하면 더 저렴한 가격으로 매칭됩니다.
        </Typography>
      </Box>
    </Paper>
  );
};

export default MatchingCriteriaForm;