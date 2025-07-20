import React, { useState } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  TextField,
  Chip,
  Card,
  CardContent,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Fab,
  Tooltip,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  ExpandMore as ExpandMoreIcon,
  Security as SecurityIcon,
  AttachMoney as MoneyIcon,
  Schedule as UrgencyIcon,
  Warning as ThreatIcon,
  VpnKey as AuthIcon,
  Link as PhishingIcon,
  CardGiftcard as BenefitIcon,
} from '@mui/icons-material';

interface KeywordCategory {
  id: string;
  name: string;
  description: string;
  icon: React.ReactElement;
  color: string;
  weight: number;
  keywords: string[];
}

const initialCategories: KeywordCategory[] = [
  {
    id: 'institution_impersonation',
    name: '기관 사칭',
    description: '공공기관이나 금융기관을 사칭하는 키워드',
    icon: <SecurityIcon />,
    color: '#d32f2f',
    weight: 3.0,
    keywords: ['금융감독원', '금감원', '검찰청', '경찰청', '국세청', '금융위원회', '국정원', '수사기관'],
  },
  {
    id: 'financial_terms',
    name: '금융 관련',
    description: '금융 거래와 관련된 키워드',
    icon: <MoneyIcon />,
    color: '#f57c00',
    weight: 2.5,
    keywords: ['계좌이체', '송금', '입금', '출금', '보안카드', '공인인증서', 'OTP', '비밀번호', '카드번호'],
  },
  {
    id: 'urgency_pressure',
    name: '긴급성/압박',
    description: '시간 압박이나 긴급성을 나타내는 키워드',
    icon: <UrgencyIcon />,
    color: '#ff9800',
    weight: 2.0,
    keywords: ['긴급', '즉시', '바로', '당장', '지금', '급하게', '빨리', '서둘러'],
  },
  {
    id: 'threat_intimidation',
    name: '협박/위협',
    description: '협박이나 위협적인 내용의 키워드',
    icon: <ThreatIcon />,
    color: '#e91e63',
    weight: 3.0,
    keywords: ['체포', '구속', '압수수색', '영장', '수배', '범죄', '사기', '처벌', '벌금'],
  },
];

const KeywordManagement: React.FC = () => {
  const [categories, setCategories] = useState<KeywordCategory[]>(initialCategories);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<KeywordCategory | null>(null);
  const [newKeyword, setNewKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const handleAddKeyword = (categoryId: string, keyword: string) => {
    if (!keyword.trim()) return;

    setCategories(categories.map(cat =>
      cat.id === categoryId
        ? { ...cat, keywords: [...cat.keywords, keyword.trim()] }
        : cat
    ));
    setNewKeyword('');
  };

  const handleDeleteKeyword = (categoryId: string, keywordIndex: number) => {
    setCategories(categories.map(cat =>
      cat.id === categoryId
        ? { ...cat, keywords: cat.keywords.filter((_, index) => index !== keywordIndex) }
        : cat
    ));
  };

  const handleEditCategory = (category: KeywordCategory) => {
    setEditingCategory({ ...category });
    setOpenDialog(true);
  };

  const handleSaveCategory = () => {
    if (!editingCategory) return;

    setCategories(categories.map(cat =>
      cat.id === editingCategory.id ? editingCategory : cat
    ));
    setOpenDialog(false);
    setEditingCategory(null);
  };

  const handleUpdateCategoryWeight = (categoryId: string, weight: number) => {
    setCategories(categories.map(cat =>
      cat.id === categoryId ? { ...cat, weight } : cat
    ));
  };

  const getTotalKeywords = () => {
    return categories.reduce((total, cat) => total + cat.keywords.length, 0);
  };

  const getHighestWeightCategory = () => {
    return categories.reduce((max, cat) => cat.weight > max.weight ? cat : max);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        키워드 관리
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
        사기 탐지에 사용되는 키워드를 카테고리별로 관리합니다.
      </Typography>

      {/* 통계 카드 */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h4" color="primary">
                {categories.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                총 카테고리 수
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h4" color="secondary">
                {getTotalKeywords()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                등록된 키워드
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h4" color="warning">
                {getHighestWeightCategory().weight}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                최고 가중치
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h4" color="success">
                활성
              </Typography>
              <Typography variant="body2" color="text.secondary">
                시스템 상태
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 키워드 카테고리 */}
      <Grid container spacing={3}>
        {categories.map((category) => (
          <Grid item xs={12} md={6} key={category.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ color: category.color, mr: 1 }}>
                    {category.icon}
                  </Box>
                  <Typography variant="h6" sx={{ flexGrow: 1 }}>
                    {category.name}
                  </Typography>
                  <Chip
                    label={`가중치: ${category.weight}`}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                </Box>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {category.description}
                </Typography>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    키워드 ({category.keywords.length}개)
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, minHeight: 40 }}>
                    {category.keywords.map((keyword, index) => (
                      <Chip
                        key={index}
                        label={keyword}
                        size="small"
                        onDelete={() => handleDeleteKeyword(category.id, index)}
                        sx={{ backgroundColor: category.color, color: 'white' }}
                      />
                    ))}
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <TextField
                    size="small"
                    placeholder="새 키워드 추가"
                    value={selectedCategory === category.id ? newKeyword : ''}
                    onChange={(e) => {
                      setNewKeyword(e.target.value);
                      setSelectedCategory(category.id);
                    }}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleAddKeyword(category.id, newKeyword);
                        setSelectedCategory('');
                      }
                    }}
                    sx={{ flexGrow: 1 }}
                  />
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => {
                      handleAddKeyword(category.id, newKeyword);
                      setSelectedCategory('');
                    }}
                    disabled={!newKeyword.trim() || selectedCategory !== category.id}
                  >
                    추가
                  </Button>
                </Box>

                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    size="small"
                    type="number"
                    label="가중치"
                    value={category.weight}
                    onChange={(e) => handleUpdateCategoryWeight(category.id, parseFloat(e.target.value) || 0)}
                    inputProps={{ min: 0, max: 5, step: 0.1 }}
                    sx={{ width: 100 }}
                  />
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<EditIcon />}
                    onClick={() => handleEditCategory(category)}
                  >
                    편집
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* 키워드 가중치 설명 */}
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          키워드 가중치 설명
        </Typography>
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>가중치 계산 방식</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" paragraph>
              각 카테고리의 가중치는 사기 탐지 시 해당 키워드의 중요도를 나타냅니다.
            </Typography>
            <List>
              <ListItem>
                <ListItemText
                  primary="3.0 (매우 높음)"
                  secondary="기관 사칭, 협박/위협 - 즉시 경고가 필요한 키워드"
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="2.5 (높음)"
                  secondary="금융 관련, 피싱/스미싱 - 개인정보 탈취 관련 키워드"
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="2.0 (보통)"
                  secondary="긴급성/압박, 보안/인증 - 심리적 압박 관련 키워드"
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="1.5 (낮음)"
                  secondary="수상한 혜택 - 의심스럽지만 즉시 위험하지 않은 키워드"
                />
              </ListItem>
            </List>
          </AccordionDetails>
        </Accordion>
      </Paper>

      {/* 카테고리 편집 다이얼로그 */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>카테고리 편집</DialogTitle>
        <DialogContent>
          {editingCategory && (
            <Box sx={{ pt: 1 }}>
              <TextField
                fullWidth
                label="카테고리명"
                value={editingCategory.name}
                onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="설명"
                multiline
                rows={3}
                value={editingCategory.description}
                onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="가중치"
                type="number"
                value={editingCategory.weight}
                onChange={(e) => setEditingCategory({ ...editingCategory, weight: parseFloat(e.target.value) || 0 })}
                inputProps={{ min: 0, max: 5, step: 0.1 }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>취소</Button>
          <Button onClick={handleSaveCategory} variant="contained">저장</Button>
        </DialogActions>
      </Dialog>

      {/* 변경사항 알림 */}
      <Alert severity="info" sx={{ mt: 3 }}>
        키워드 변경사항은 즉시 적용되어 실시간 분석에 반영됩니다.
      </Alert>
    </Box>
  );
};

export default KeywordManagement;