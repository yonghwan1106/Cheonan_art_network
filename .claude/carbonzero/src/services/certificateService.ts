import QRCode from 'qrcode';
import { Certificate, MatchResult, Company } from '../types';

export const certificateService = {
  generateCertificate: async (
    matchResult: MatchResult,
    company: Company,
    _contractId: string
  ): Promise<Certificate> => {
    const certificateNumber = `KCZ-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
    const certificateId = `cert_${Date.now()}`;
    
    // QR 코드 생성
    const verificationUrl = `https://carbonzero.platform.com/verify/${certificateId}`;
    const qrCode = await QRCode.toDataURL(verificationUrl, {
      width: 200,
      margin: 2,
      color: {
        dark: '#2E7D32',
        light: '#FFFFFF'
      }
    });

    // 블록체인 해시 시뮬레이션
    const blockchainHash = `0x${Array.from(
      {length: 64}, 
      () => Math.floor(Math.random() * 16).toString(16)
    ).join('')}`;

    const certificate: Certificate = {
      id: certificateId,
      certificateNumber,
      companyName: company.name,
      powerPlantName: matchResult.plantName,
      offsetAmount: matchResult.offsetAmount,
      carbonIntensity: matchResult.carbonIntensity,
      timeSlot: matchResult.timeSlots[0] || '00:00-24:00',
      issuedDate: new Date().toISOString(),
      blockchainHash,
      qrCode,
      status: 'issued'
    };

    return certificate;
  },

  verifyCertificate: async (_certificateId: string): Promise<{ valid: boolean; message: string }> => {
    // 인증서 검증 시뮬레이션 (1초 지연)
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 90% 확률로 유효
    const isValid = Math.random() > 0.1;
    
    return {
      valid: isValid,
      message: isValid 
        ? '인증서가 블록체인에서 확인되었습니다.' 
        : '인증서를 찾을 수 없거나 위조된 인증서입니다.'
    };
  },

  generatePDF: async (certificate: Certificate): Promise<string> => {
    // PDF 생성 시뮬레이션 (2초 지연)
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 실제로는 PDF 라이브러리를 사용하여 PDF를 생성
    // 여기서는 다운로드 URL 시뮬레이션
    return `data:application/pdf;base64,${btoa(`Certificate PDF for ${certificate.certificateNumber}`)}`;
  },

  shareCertificate: (certificate: Certificate): { 
    linkedin: string; 
    twitter: string; 
    facebook: string; 
    email: string;
  } => {
    const message = `${certificate.companyName}이 CarbonZero 플랫폼을 통해 ${certificate.offsetAmount.toLocaleString()}tCO2의 탄소상쇄를 달성했습니다! 🌱 #탄소중립 #ESG #CarbonZero`;
    const url = `https://carbonzero.platform.com/verify/${certificate.id}`;
    
    return {
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&summary=${encodeURIComponent(message)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodeURIComponent(url)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(message)}`,
      email: `mailto:?subject=${encodeURIComponent('탄소상쇄 인증서 공유')}&body=${encodeURIComponent(`${message}\n\n인증서 확인: ${url}`)}`
    };
  }
};