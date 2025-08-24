import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Box,
  Chip,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Tooltip,
  CircularProgress,
  Alert,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Download as DownloadIcon,
  Share as ShareIcon,
  Verified as VerifiedIcon,
  QrCode as QrCodeIcon,
  ContentCopy as CopyIcon,
  LinkedIn as LinkedInIcon,
  Twitter as TwitterIcon,
  Facebook as FacebookIcon,
  Email as EmailIcon,
} from '@mui/icons-material';
import { Certificate } from '../../types';
import { certificateService } from '../../services/certificateService';
import dayjs from 'dayjs';

interface CertificateCardProps {
  certificate: Certificate;
}

const CertificateCard: React.FC<CertificateCardProps> = ({ certificate }) => {
  const [qrDialog, setQrDialog] = useState(false);
  const [verificationDialog, setVerificationDialog] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{ valid: boolean; message: string } | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [shareMenu, setShareMenu] = useState<null | HTMLElement>(null);

  const handleQrOpen = () => setQrDialog(true);
  const handleQrClose = () => setQrDialog(false);

  const handleVerify = async () => {
    setIsVerifying(true);
    setVerificationDialog(true);
    
    try {
      const result = await certificateService.verifyCertificate(certificate.id);
      setVerificationResult(result);
    } catch (error) {
      setVerificationResult({ valid: false, message: '검증 중 오류가 발생했습니다.' });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    
    try {
      const pdfUrl = await certificateService.generatePDF(certificate);
      
      // PDF 다운로드 시뮬레이션
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = `Certificate_${certificate.certificateNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('PDF 다운로드 실패:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShareClick = (event: React.MouseEvent<HTMLElement>) => {
    setShareMenu(event.currentTarget);
  };

  const handleShareClose = () => {
    setShareMenu(null);
  };

  const handleShare = (platform: keyof ReturnType<typeof certificateService.shareCertificate>) => {
    const shareUrls = certificateService.shareCertificate(certificate);
    window.open(shareUrls[platform], '_blank');
    handleShareClose();
  };

  const handleCopyHash = () => {
    navigator.clipboard.writeText(certificate.blockchainHash);
  };

  const getStatusColor = (status: Certificate['status']) => {
    switch (status) {
      case 'issued': return 'success';
      case 'verified': return 'primary';
      case 'expired': return 'error';
      default: return 'default';
    }
  };

  const getStatusText = (status: Certificate['status']) => {
    switch (status) {
      case 'issued': return '발급완료';
      case 'verified': return '검증완료';
      case 'expired': return '만료';
      default: return '알 수 없음';
    }
  };

  return (
    <>
      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }} elevation={3}>
        <CardContent sx={{ flexGrow: 1 }}>
          <Box display="flex" justifyContent="between" alignItems="flex-start" mb={2}>
            <Box>
              <Typography variant="h6" component="div" gutterBottom>
                {certificate.companyName}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                인증서 번호: {certificate.certificateNumber}
              </Typography>
            </Box>
            <Chip 
              label={getStatusText(certificate.status)} 
              color={getStatusColor(certificate.status)}
              size="small"
            />
          </Box>

          <Divider sx={{ my: 2 }} />

          <Box display="flex" flexDirection="column" gap={1}>
            <Box display="flex" justifyContent="between">
              <Typography variant="body2" color="textSecondary">발전소:</Typography>
              <Typography variant="body2">{certificate.powerPlantName}</Typography>
            </Box>
            
            <Box display="flex" justifyContent="between">
              <Typography variant="body2" color="textSecondary">상쇄량:</Typography>
              <Typography variant="body2" fontWeight="bold" color="primary">
                {certificate.offsetAmount.toLocaleString()} tCO2
              </Typography>
            </Box>
            
            <Box display="flex" justifyContent="between">
              <Typography variant="body2" color="textSecondary">탄소집약도:</Typography>
              <Typography variant="body2">
                {certificate.carbonIntensity.toFixed(3)} gCO2/kWh
              </Typography>
            </Box>
            
            <Box display="flex" justifyContent="between">
              <Typography variant="body2" color="textSecondary">시간대:</Typography>
              <Typography variant="body2">{certificate.timeSlot}</Typography>
            </Box>
            
            <Box display="flex" justifyContent="between">
              <Typography variant="body2" color="textSecondary">발급일:</Typography>
              <Typography variant="body2">
                {dayjs(certificate.issuedDate).format('YYYY-MM-DD HH:mm')}
              </Typography>
            </Box>
          </Box>

          <Box mt={2} p={1} bgcolor="grey.50" borderRadius={1}>
            <Box display="flex" alignItems="center" justifyContent="between">
              <Typography variant="caption" color="textSecondary">
                블록체인 해시:
              </Typography>
              <Tooltip title="해시 복사">
                <IconButton size="small" onClick={handleCopyHash}>
                  <CopyIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
            <Typography variant="caption" sx={{ wordBreak: 'break-all', fontSize: '0.7rem' }}>
              {certificate.blockchainHash}
            </Typography>
          </Box>
        </CardContent>

        <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
          <Box display="flex" gap={1}>
            <Tooltip title="QR 코드">
              <IconButton size="small" onClick={handleQrOpen}>
                <QrCodeIcon />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="인증서 검증">
              <IconButton size="small" onClick={handleVerify}>
                <VerifiedIcon />
              </IconButton>
            </Tooltip>
          </Box>

          <Box display="flex" gap={1}>
            <Button
              size="small"
              startIcon={isDownloading ? <CircularProgress size={16} /> : <DownloadIcon />}
              onClick={handleDownload}
              disabled={isDownloading}
            >
              PDF
            </Button>
            
            <Button
              size="small"
              startIcon={<ShareIcon />}
              onClick={handleShareClick}
            >
              공유
            </Button>
          </Box>
        </CardActions>
      </Card>

      {/* QR 코드 다이얼로그 */}
      <Dialog open={qrDialog} onClose={handleQrClose} maxWidth="sm">
        <DialogTitle>인증서 QR 코드</DialogTitle>
        <DialogContent sx={{ textAlign: 'center', py: 3 }}>
          <img 
            src={certificate.qrCode} 
            alt="Certificate QR Code"
            style={{ maxWidth: '200px' }}
          />
          <Typography variant="body2" color="textSecondary" mt={2}>
            QR 코드를 스캔하여 인증서를 검증하세요
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleQrClose}>닫기</Button>
        </DialogActions>
      </Dialog>

      {/* 검증 결과 다이얼로그 */}
      <Dialog open={verificationDialog} onClose={() => setVerificationDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>인증서 검증</DialogTitle>
        <DialogContent>
          {isVerifying ? (
            <Box display="flex" alignItems="center" gap={2} py={3}>
              <CircularProgress size={24} />
              <Typography>블록체인에서 검증 중...</Typography>
            </Box>
          ) : verificationResult ? (
            <Alert severity={verificationResult.valid ? 'success' : 'error'}>
              {verificationResult.message}
            </Alert>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setVerificationDialog(false)}>닫기</Button>
        </DialogActions>
      </Dialog>

      {/* 공유 메뉴 */}
      <Menu
        anchorEl={shareMenu}
        open={Boolean(shareMenu)}
        onClose={handleShareClose}
      >
        <MenuItem onClick={() => handleShare('linkedin')}>
          <ListItemIcon>
            <LinkedInIcon fontSize="small" color="primary" />
          </ListItemIcon>
          <ListItemText>LinkedIn</ListItemText>
        </MenuItem>
        
        <MenuItem onClick={() => handleShare('twitter')}>
          <ListItemIcon>
            <TwitterIcon fontSize="small" color="primary" />
          </ListItemIcon>
          <ListItemText>Twitter</ListItemText>
        </MenuItem>
        
        <MenuItem onClick={() => handleShare('facebook')}>
          <ListItemIcon>
            <FacebookIcon fontSize="small" color="primary" />
          </ListItemIcon>
          <ListItemText>Facebook</ListItemText>
        </MenuItem>
        
        <MenuItem onClick={() => handleShare('email')}>
          <ListItemIcon>
            <EmailIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>이메일</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
};

export default CertificateCard;