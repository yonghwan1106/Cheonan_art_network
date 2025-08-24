import React from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
  Chip,
} from '@mui/material';
import { Company } from '../../types';
import { useMockCompanies } from '../../hooks/useMockData';

interface CompanySelectorProps {
  selectedCompany: Company | null;
  onSelect: (company: Company | null) => void;
}

const CompanySelector: React.FC<CompanySelectorProps> = ({ selectedCompany, onSelect }) => {
  const { companies, isLoading } = useMockCompanies();

  const handleChange = (companyId: string) => {
    if (companyId === '') {
      onSelect(null);
    } else {
      const company = companies.find(c => c.id === companyId);
      onSelect(company || null);
    }
  };

  return (
    <Box>
      <FormControl fullWidth margin="normal">
        <InputLabel>기업 선택</InputLabel>
        <Select
          value={selectedCompany?.id || ''}
          label="기업 선택"
          onChange={(e) => handleChange(e.target.value)}
          disabled={isLoading}
        >
          <MenuItem value="">
            <em>기업을 선택해주세요</em>
          </MenuItem>
          {companies.map((company) => (
            <MenuItem key={company.id} value={company.id}>
              <Box>
                <Typography variant="body1">{company.name}</Typography>
                <Typography variant="caption" color="textSecondary">
                  {company.businessType} | 연간 전력사용량: {(company.annualElectricityUsage / 1000000).toFixed(1)}GWh
                </Typography>
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {selectedCompany && (
        <Box mt={2} p={2} bgcolor="background.paper" borderRadius={1} border="1px solid #e0e0e0">
          <Typography variant="h6" gutterBottom>
            선택된 기업 정보
          </Typography>
          
          <Box display="flex" flexDirection="column" gap={1}>
            <Box display="flex" alignItems="center" gap={1}>
              <Typography variant="body2" fontWeight="bold">업종:</Typography>
              <Typography variant="body2">{selectedCompany.businessType}</Typography>
            </Box>
            
            <Box display="flex" alignItems="center" gap={1}>
              <Typography variant="body2" fontWeight="bold">연간 전력사용량:</Typography>
              <Typography variant="body2">
                {(selectedCompany.annualElectricityUsage / 1000000).toFixed(1)} GWh
              </Typography>
            </Box>
            
            <Box display="flex" alignItems="center" gap={1}>
              <Typography variant="body2" fontWeight="bold">탄소감축 목표:</Typography>
              <Typography variant="body2">
                {selectedCompany.carbonReductionTarget.toLocaleString()} tCO2
              </Typography>
            </Box>
            
            <Box display="flex" alignItems="center" gap={1}>
              <Typography variant="body2" fontWeight="bold">RE100 참여:</Typography>
              <Chip 
                label={selectedCompany.re100Participant ? 'Y' : 'N'} 
                size="small" 
                color={selectedCompany.re100Participant ? 'success' : 'default'}
              />
            </Box>
            
            <Box display="flex" alignItems="center" gap={1}>
              <Typography variant="body2" fontWeight="bold">피크 시간대:</Typography>
              <Box display="flex" gap={0.5}>
                {selectedCompany.usagePattern.peakHours.map((hour) => (
                  <Chip key={hour} label={hour} size="small" variant="outlined" />
                ))}
              </Box>
            </Box>
            
            <Box display="flex" alignItems="center" gap={1}>
              <Typography variant="body2" fontWeight="bold">ESG 담당자:</Typography>
              <Typography variant="body2">
                {selectedCompany.esgManager.name} ({selectedCompany.esgManager.email})
              </Typography>
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default CompanySelector;